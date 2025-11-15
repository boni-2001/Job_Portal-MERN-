
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const {
  applicationAcceptedTemplate,
  applicationReceivedTemplate,
  newApplicationForRecruiterTemplate
} = require('../utils/emailTemplates');
const { getIO } = require('../socket');
const { createNotification } = require('../services/notificationService');
const { applySchema } = require('../validators/applicationValidator');
const { uploadBuffer } = require('../utils/cloudinaryUpload');
const { isProbablyPdf } = require('../utils/verifyPdf');

class ApplicationController {
  // ============================
  // Seeker: apply to a job
  // ============================
  async apply(req, res, next) {
    try {
      const { error, value } = applySchema.validate(req.body);
      if (error) return res.status(400).json({ message: error.details[0].message });

      const job = await Job.findById(req.params.jobId).populate('recruiter');
      if (!job) return res.status(404).json({ message: 'Job not found' });
      if (!job.isApproved) {
        return res.status(403).json({ message: 'Job is not available for applications yet' });
      }

      let resumeUrl;
      let resumePublicId;

      // --- Resume upload (optional)
      if (req.file?.buffer) {
        if (!isProbablyPdf(req.file.buffer)) {
          return res.status(400).json({ message: 'Resume must be a valid PDF file.' });
        }

        const base = req.file.originalname?.replace(/\.[^/.]+$/, '') || `resume_${Date.now()}`;
        const uploaded = await uploadBuffer(req.file.buffer, {
          folder: 'resumes',
          resource_type: 'raw',
          type: 'upload',
          access_mode: 'public',
          use_filename: true,
          unique_filename: true,
          overwrite: false,
          format: 'pdf',
          filename_override: base,
        });

        resumeUrl = uploaded.secure_url;
        resumePublicId = uploaded.public_id;

        // Save to user's profile
        await User.findByIdAndUpdate(req.user._id, { resume: resumeUrl, resumePublicId });
      }

      // --- Create application
      const application = await Application.create({
        job: job._id,
        applicant: req.user._id,
        resume: resumeUrl || req.user.resume,
        coverLetter: value.coverLetter || '',
      });

      // --- Get applicant info
      const applicant = await User.findById(req.user._id);

      // ===================================
      // ✉️ 1. Email the applicant (confirmation)
      // ===================================
      try {
        const htmlApplicant = applicationReceivedTemplate({
          name: applicant.name,
          jobTitle: job.title,
          company: job.company,
          nextSteps: 'The recruiter will review your profile soon. You’ll be notified if shortlisted or accepted.'
        });
        await sendEmail(
          applicant.email,
          `Application received • ${job.title} @ ${job.company}`,
          htmlApplicant
        );
      } catch (err) {
        console.warn('Failed to send application received email:', err.message);
      }

      // ===================================
      // ✉️ 2. Email recruiter (new application)
      // ===================================
      try {
        const recruiter = job.recruiter;
        if (recruiter && recruiter.email) {
          const htmlRecruiter = newApplicationForRecruiterTemplate({
            recruiterName: recruiter.name,
            applicantName: applicant.name,
            jobTitle: job.title,
            company: job.company,
            linkToApplication: `${process.env.CLIENT_URL || 'http://localhost:5173'}/recruiter/applicants/${applicant._id}`
          });
          await sendEmail(
            recruiter.email,
            `New applicant for ${job.title}`,
            htmlRecruiter
          );
        }
      } catch (err) {
        console.warn('Failed to send recruiter new application email:', err.message);
      }

      // ===================================
      // 🔔 Create real-time notifications
      // ===================================
      try {
        await createNotification({
          type: 'application_created',
          message: `${applicant.name} applied to ${job.title}`,
          meta: { jobId: String(job._id), applicantId: String(applicant._id) },
        });
        const io = getIO();
        io && io.emit('notification', {
          type: 'application_created',
          message: `${applicant.name} applied to ${job.title}`,
        });
      } catch (_) {}

      res.status(201).json({ message: 'Applied successfully', application });
    } catch (err) {
      next(err);
    }
  }

  // ============================
  // Recruiter/Admin: get applications for a specific job
  // ============================
  async listByJob(req, res, next) {
    try {
      const job = await Job.findById(req.params.jobId);
      if (!job) return res.status(404).json({ message: 'Job not found' });

      if (String(job.recruiter) !== String(req.user._id) && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' });
      }

      const applications = await Application.find({ job: job._id })
        .populate('applicant', 'name email resume resumePublicId profilePic jobRoles')
        .sort({ appliedAt: -1 });

      res.json(applications);
    } catch (err) {
      next(err);
    }
  }

  // ============================
  // Seeker: list my applications
  // ============================
  async listByUser(req, res, next) {
    try {
      const applications = await Application.find({ applicant: req.user._id })
        .populate('job', 'title company location')
        .sort({ appliedAt: -1 });

      res.json(applications);
    } catch (err) {
      next(err);
    }
  }

  // ============================
  // Recruiter/Admin: update application status
  // ============================
  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const valid = ['applied', 'shortlisted', 'rejected', 'accepted'];
      if (!valid.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }

      const app = await Application.findById(id).populate('job applicant');
      if (!app) return res.status(404).json({ message: 'Application not found' });

      // Only job owner or admin can update
      if (req.user.role !== 'admin' && String(app.job.recruiter) !== String(req.user._id)) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      app.status = status;
      await app.save();

      // --- Accepted status: send branded email
      if (status === 'accepted') {
        const seeker = app.applicant;
        const job = app.job;

        try {
          const html = applicationAcceptedTemplate({
            name: seeker.name,
            jobTitle: job.title,
            company: job.company,
          });
          await sendEmail(
            seeker.email,
            `Application accepted • ${job.title} @ ${job.company}`,
            html
          );
        } catch (err) {
          console.warn('Failed to send acceptance email:', err.message);
        }

        // Notify via sockets
        try {
          await createNotification({
            type: 'application_accepted',
            message: `Your application for ${job.title} was accepted`,
            meta: { jobId: String(job._id), applicantId: String(seeker._id) },
          });
          const io = getIO();
          io && io.emit('notification', {
            type: 'application_accepted',
            message: `${seeker.name}'s application accepted for ${job.title}`,
          });
        } catch (_) {}
      } else {
        // Other status changes
        try {
          await createNotification({
            type: 'application_status',
            message: `Application status changed to ${status}`,
            meta: { applicationId: String(app._id) },
          });
          const io = getIO();
          io && io.emit('notification', {
            type: 'application_status',
            message: `Application ${String(app._id)} -> ${status}`,
          });
        } catch (_) {}
      }

      return res.json({ message: 'Status updated', application: app });
    } catch (err) {
      next(err);
    }
  }

  // ============================
  // Recruiter: list all applications across their jobs
  // ============================
  async listForRecruiterAll(req, res, next) {
    try {
      const page = Math.max(parseInt(req.query.page || '1', 10), 1);
      const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);
      const skip = (page - 1) * limit;
      const status = req.query.status;

      const jobIds = (await Job.find({ recruiter: req.user._id }).select('_id')).map(j => j._id);
      const filter = { job: { $in: jobIds } };
      if (status && ['applied', 'shortlisted', 'rejected', 'accepted'].includes(status)) {
        filter.status = status;
      }

      const [items, total] = await Promise.all([
        Application.find(filter)
          .sort({ appliedAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('job', 'title company location')
          .populate('applicant', 'name email resume resumePublicId profilePic jobRoles'),
        Application.countDocuments(filter),
      ]);

      res.json({
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        items,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ApplicationController();
