const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { listNotificationsForAdmin, markNotificationRead } = require('../services/notificationService');

class AdminController {
  
  async dashboard(req, res, next) {
    try {
      const users = await User.find().limit(50);
      const jobs = await Job.find({ isApproved: true }).limit(50);
      const pendingJobs = await Job.find({ isApproved: false }).limit(50);
      const applications = await Application.find().limit(50).populate('job applicant');
      const notifications = await listNotificationsForAdmin();
      res.render('dashboard', { users, jobs, pendingJobs, applications, notifications });
    } catch (err) {
      next(err);
    }
  }

  async listUsers(req, res, next) {
    try {
      const users = await User.find();
      res.json(users);
    } catch (err) {
      next(err);
    }
  }

  async toggleVerify(req, res, next) {
    try {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ message: 'User not found' });
      user.isVerified = !user.isVerified;
      await user.save();
      res.json({ message: 'User verification toggled', user });
    } catch (err) {
      next(err);
    }
  }

  // NEW: approve a job
  async approveJob(req, res, next) {
  try {
    const { id } = req.params;
    const job = await Job.findByIdAndUpdate(
      id,
      { $set: { isApproved: true } },   // only flip the flag
      { new: true }
    );
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) { next(err); }
}

  // NEW: list pending jobs
  async listPendingJobs(req, res, next) {
    try {
      const jobs = await Job.find({ isApproved: false }).sort({ createdAt: -1 });
      res.json(jobs);
    } catch (err) {
      next(err);
    }
  }

  // NEW: notifications
  async listNotifications(req, res, next) {
    try {
      const notifications = await listNotificationsForAdmin();
      res.json(notifications);
    } catch (err) {
      next(err);
    }
  }

  async markNotificationRead(req, res, next) {
    try {
      const updated = await markNotificationRead(req.params.id);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AdminController();
