
const Job = require('../models/Job');
const { createJobSchema, updateJobSchema } = require('../validators/jobValidator');
const { uploadImageBuffer } = require('../utils/cloudinaryUpload'); // <-- image uploader
const mongoose = require('mongoose');

class JobController {
  // GET /api/jobs (public, list only approved)
  async list(req, res, next) {
    try {
      const q = (req.query.q || '').trim();
      const query = { isApproved: true };

      if (q) {
        // case-insensitive regex
        const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

        // match title, company, location, OR any skill containing the text
        query.$or = [
          { title: { $regex: rx } },
          { company: { $regex: rx } },
          { location: { $regex: rx } },
          // skills is an array of strings; match any element that matches regex
          { skills: { $elemMatch: { $regex: rx } } },
        ];
      }

      // optional: you may want to add pagination later (page/limit)
      const jobs = await Job.find(query).sort({ createdAt: -1 });
      res.json(jobs);
    } catch (err) {
      next(err);
    }
  }

  // GET /api/jobs/:id
  async getOne(req, res, next) {
    try {
      const job = await Job.findById(req.params.id);
      if (!job) return res.status(404).json({ message: 'Job not found' });
      res.json(job);
    } catch (err) {
      // if invalid ObjectId
      if (err instanceof mongoose.Error.CastError) {
        return res.status(404).json({ message: 'Job not found' });
      }
      next(err);
    }
  }

  // GET /api/jobs/recruiter/me
  async myJobs(req, res, next) {
    try {
      const jobs = await Job.find({ recruiter: req.user._id }).sort({ createdAt: -1 });
      res.json(jobs);
    } catch (err) {
      next(err);
    }
  }

  // POST /api/jobs  (multipart: companyLogo image required)
  async create(req, res, next) {
    try {
      const { error, value } = createJobSchema.validate(req.body);
      if (error) return res.status(400).json({ message: error.details[0].message });

      const payload = {
        title: value.title,
        company: value.company,
        location: value.location,
        description: value.description,
        skills: value.skills || [],
        type: value.type,
        salary: value.salary,
        recruiter: req.user._id,
      };

      if (req.file?.buffer) {
        const base =
          req.file.originalname?.replace(/\.[^/.]+$/, '') || `company_${Date.now()}`;
        const up = await uploadImageBuffer(req.file.buffer, {
          folder: 'company_logos',
          filename_override: base,
        });
        payload.companyLogo = up.secure_url;
        payload.companyLogoPublicId = up.public_id;
      } else if (value.companyLogoUrl) {
        payload.companyLogo = value.companyLogoUrl;
      } else {
        return res.status(400).json({ message: 'Company logo is required' });
      }

      const job = await Job.create(payload);
      res.status(201).json(job);
    } catch (err) {
      next(err);
    }
  }

  // PUT /api/jobs/:id  (logo optional)
  async update(req, res, next) {
    try {
      const { error, value } = updateJobSchema.validate(req.body);
      if (error) return res.status(400).json({ message: error.details[0].message });

      const job = await Job.findById(req.params.id);
      if (!job) return res.status(404).json({ message: 'Job not found' });
      if (String(job.recruiter) !== String(req.user._id) && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden' });
      }

      if (typeof value.title !== 'undefined') job.title = value.title;
      if (typeof value.company !== 'undefined') job.company = value.company;
      if (typeof value.location !== 'undefined') job.location = value.location;
      if (typeof value.description !== 'undefined') job.description = value.description;
      if (typeof value.skills !== 'undefined') job.skills = value.skills;
      if (typeof value.type !== 'undefined') job.type = value.type;
      if (typeof value.salary !== 'undefined') job.salary = value.salary;

      if (req.file?.buffer) {
        const base =
          req.file.originalname?.replace(/\.[^/.]+$/, '') || `company_${Date.now()}`;
        const up = await uploadImageBuffer(req.file.buffer, {
          folder: 'company_logos',
          filename_override: base,
        });
        job.companyLogo = up.secure_url;
        job.companyLogoPublicId = up.public_id;
      } else if (value.companyLogoUrl) {
        job.companyLogo = value.companyLogoUrl;
      }

      await job.save();
      res.json(job);
    } catch (err) {
      next(err);
    }
  }

  // DELETE /api/jobs/:id
  async remove(req, res, next) {
    try {
      const job = await Job.findById(req.params.id);
      if (!job) return res.status(404).json({ message: 'Not found' });
      if (String(job.recruiter) !== String(req.user._id) && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden' });
      }
      await job.deleteOne();
      res.json({ message: 'Deleted' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new JobController();
