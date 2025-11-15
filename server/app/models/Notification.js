const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: { type: String, enum: ['feedback', 'application_accepted'], required: true },
  message: { type: String, required: true },
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  toRole: { type: String, enum: ['admin'], default: 'admin' },
  meta: { type: Object, default: {} }, // e.g., { applicationId, jobId }
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
