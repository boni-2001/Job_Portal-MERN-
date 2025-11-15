
const Notification = require('../models/Notification');

async function createNotification({ type, message, fromUser, toRole = 'admin', meta = {} }) {
  const notif = await Notification.create({ type, message, fromUser, toRole, meta });
  return notif;
}

async function listNotificationsForAdmin() {
  return Notification.find({ toRole: 'admin' }).sort({ createdAt: -1 }).limit(100).populate('fromUser', 'name email');
}

async function markNotificationRead(id) {
  return Notification.findByIdAndUpdate(id, { read: true }, { new: true });
}

module.exports = { createNotification, listNotificationsForAdmin, markNotificationRead };
