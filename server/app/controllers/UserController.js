
const User = require('../models/User');
const Application = require('../models/Application');
const { uploadBuffer, uploadImageBuffer } = require('../utils/cloudinaryUpload');

const API_BASE = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;


const buildSignedView = (publicId) =>
  publicId ? `${API_BASE}/api/files/signed-raw?public_id=${encodeURIComponent(publicId)}` : null;

const buildSignedDownload = (publicId, filename = 'resume.pdf') =>
  publicId
    ? `${API_BASE}/api/files/signed-raw?public_id=${encodeURIComponent(publicId)}&download=1&filename=${encodeURIComponent(filename)}`
    : null;

const buildInline = (url) =>
  url ? `${API_BASE}/api/files/inline?url=${encodeURIComponent(url)}` : null;

const buildDownload = (url, filename = 'resume.pdf') =>
  url ? `${API_BASE}/api/files/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}` : null;

class UserController {
  // GET /api/users/me
  async me(req, res, next) {
    try {
      const user = await User.findById(req.user._id).select('-password');
      if (!user) return res.status(404).json({ message: 'User not found' });

      const data = user.toObject();

      // expose best-available resume links
      const filename = `${data.name || 'resume'}.pdf`;
      if (data.resumePublicId) {
        data.resumeView = buildSignedView(data.resumePublicId);
        data.resumeDownload = buildSignedDownload(data.resumePublicId, filename);
      } else if (data.resume) {
        data.resumeView = buildInline(data.resume);
        data.resumeDownload = buildDownload(data.resume, filename);
      }

      res.json(data);
    } catch (err) { next(err); }
  }

  // PUT /api/users/me (multipart: avatar (image) + resume (pdf)) — Multer memoryStorage expected
  async updateMe(req, res, next) {
    try {
      const update = {};
      if (req.body.name) update.name = req.body.name;

      // jobRoles can be CSV or array
      if (typeof req.body.jobRoles !== 'undefined') {
        const roles = Array.isArray(req.body.jobRoles)
          ? req.body.jobRoles
          : String(req.body.jobRoles).split(',').map(s => s.trim()).filter(Boolean);
        update.jobRoles = roles;
      }

      // ===== Avatar (image) from memory buffer =====
      if (req.files?.avatar?.[0]?.buffer) {
        const base =
          req.files.avatar[0].originalname?.replace(/\.[^/.]+$/, '') || `avatar_${Date.now()}`;
        const upA = await uploadImageBuffer(req.files.avatar[0].buffer, {
          folder: 'avatars',
          filename_override: base,
          // resource_type: 'image' is already set inside uploadImageBuffer
        });
        update.profilePic = upA.secure_url;
      } else if (req.body.profilePic) {
        update.profilePic = req.body.profilePic;
      }

      // ===== Resume (PDF) from memory buffer — save secure_url + public_id =====
      if (req.files?.resume?.[0]?.buffer) {
        const file = req.files.resume[0];
        const isPdf = /\.pdf$/i.test(file.originalname);
        if (!isPdf) return res.status(400).json({ message: 'Resume must be a PDF file' });

        const base = file.originalname.replace(/\.[^/.]+$/, '') || `resume_${Date.now()}`;

        const upR = await uploadBuffer(file.buffer, {
          folder: 'resumes',
          filename_override: base,
          resource_type: 'raw',
          type: 'upload',
          access_mode: 'public',
          format: 'pdf',
          use_filename: true,
          unique_filename: true,
          overwrite: false,
        });

        update.resume = upR.secure_url;        // e.g. https://res.cloudinary.com/.../raw/upload/...pdf
        update.resumePublicId = upR.public_id; // e.g. resumes/abc123
      }

      const user = await User.findByIdAndUpdate(req.user._id, update, { new: true }).select('-password');
      if (!user) return res.status(404).json({ message: 'User not found' });

      const data = user.toObject();
      const filename = `${data.name || 'resume'}.pdf`;
      if (data.resumePublicId) {
        data.resumeView = buildSignedView(data.resumePublicId);
        data.resumeDownload = buildSignedDownload(data.resumePublicId, filename);
      } else if (data.resume) {
        data.resumeView = buildInline(data.resume);
        data.resumeDownload = buildDownload(data.resume, filename);
      }

      res.json(data);
    } catch (err) { next(err); }
  }

  /**
   * GET /api/users/:id/for-recruiter
   * Allow:
   * - admin always
   * - recruiter only if that seeker has applied to ANY of this recruiter’s jobs
   */
  async getApplicantForRecruiter(req, res, next) {
    try {
      const targetUserId = req.params.id;

      // Admins: always allowed
      if (req.user.role === 'admin') {
        const user = await User.findById(targetUserId)
          .select('name email profilePic resume resumePublicId jobRoles createdAt updatedAt');
        if (!user) return res.status(404).json({ message: 'User not found' });

        const data = user.toObject();
        const filename = `${data.name || 'resume'}.pdf`;
        if (data.resumePublicId) {
          data.resumeView = buildSignedView(data.resumePublicId);
          data.resumeDownload = buildSignedDownload(data.resumePublicId, filename);
        } else if (data.resume) {
          data.resumeView = buildInline(data.resume);
          data.resumeDownload = buildDownload(data.resume, filename);
        }
        return res.json(data);
      }

      // Recruiter: must have at least one application from this user to the recruiter's jobs
      if (req.user.role === 'recruiter') {
        const appDoc = await Application.findOne({ applicant: targetUserId })
          .populate('job', 'recruiter');
        if (!appDoc || String(appDoc.job.recruiter) !== String(req.user._id)) {
          return res.status(403).json({ message: 'Forbidden' });
        }

        const user = await User.findById(targetUserId)
          .select('name email profilePic resume resumePublicId jobRoles createdAt updatedAt');
        if (!user) return res.status(404).json({ message: 'User not found' });

        const data = user.toObject();
        const filename = `${data.name || 'resume'}.pdf`;
        if (data.resumePublicId) {
          data.resumeView = buildSignedView(data.resumePublicId);
          data.resumeDownload = buildSignedDownload(data.resumePublicId, filename);
        } else if (data.resume) {
          data.resumeView = buildInline(data.resume);
          data.resumeDownload = buildDownload(data.resume, filename);
        }
        return res.json(data);
      }

      // Seekers cannot view others this way
      return res.status(403).json({ message: 'Forbidden' });
    } catch (err) { next(err); }
  }
}

module.exports = new UserController();
