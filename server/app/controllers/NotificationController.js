const Notification = require('../models/Notification'); // you already create via createNotification

class NotificationController {
  // GET /api/notifications/admin/unread-count  (admin only)
  async unreadCount(req, res, next) {
    try {
      if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
      const count = await Notification.countDocuments({ isRead: { $ne: true } });
      res.json({ count });
    } catch (e) { next(e); }
  }

  // GET /api/notifications/admin (admin only)
  async list(req, res, next) {
    try {
      if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
      const items = await Notification.find({}).sort({ createdAt: -1 }).limit(100);
      res.json(items);
    } catch (e) { next(e); }
  }

  // PATCH /api/notifications/:id/read  (admin only)
  async markRead(req, res, next) {
    try {
      if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
      const { id } = req.params;
      const updated = await Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
      if (!updated) return res.status(404).json({ message: 'Not found' });
      res.json(updated);
    } catch (e) { next(e); }
  }
}
module.exports = new NotificationController();
