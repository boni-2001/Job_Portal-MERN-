const ContactMessage = require('../models/ContactMessage');
const { createNotification } = require('../services/notificationService');
const { getIO } = require('../socket');

class ContactController {
  // POST /api/contact
  async create(req, res, next) {
    try {
      const { name, email, subject, message } = req.body || {};
      if (!name || !email || !subject || !message) {
        return res.status(400).json({ message: 'All fields are required.' });
      }

      const doc = await ContactMessage.create({
        user: req.user?._id || null,
        role: req.user?.role || 'guest',
        name,
        email,
        subject,
        message,
      });

      // create admin notification (re-uses your existing service)
      try {
        await createNotification({
          type: 'contact_message',
          message: `New contact from ${name} (${req.user?.role || 'guest'}): ${subject}`,
          meta: { contactId: String(doc._id) }
        });
        const io = getIO();
        io && io.emit('admin:notification', { type: 'contact_message' });
      } catch (_) {}

      return res.status(201).json({ message: 'Message sent. We will get back to you shortly.' });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/admin/messages  (admin only)
  async listForAdmin(req, res, next) {
    try {
      if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
      const items = await ContactMessage.find({}).sort({ createdAt: -1 });
      res.json(items);
    } catch (err) {
      next(err);
    }
  }

  // PATCH /api/admin/messages/:id/read  (admin only)
  async markRead(req, res, next) {
    try {
      if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
      const { id } = req.params;
      const updated = await ContactMessage.findByIdAndUpdate(id, { read: true }, { new: true });
      if (!updated) return res.status(404).json({ message: 'Not found' });
      res.json(updated);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ContactController();
