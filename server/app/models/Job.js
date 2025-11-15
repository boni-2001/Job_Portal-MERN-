const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, default: 'Remote' },
    description: { type: String, required: true },
    skills: [{ type: String }],
    type: { type: String }, 
    salary: { type: mongoose.Schema.Types.Mixed }, 
    recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // NEW: company logo
    companyLogo: { type: String, default: '' },         
    companyLogoPublicId: { type: String, default: '' },  // for future replace/delete

    // moderation
    isApproved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Job', JobSchema);
