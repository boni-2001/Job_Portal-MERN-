
const multer = require('multer');


const storage = multer.memoryStorage();
const limits = { fileSize: 10 * 1024 * 1024 }; // 10 MB

function avatarFilter(req, file, cb) {
  if (file.mimetype && file.mimetype.startsWith('image/')) return cb(null, true);
  cb(new Error('Only image files are allowed for avatar'), false);
}

function resumeFilter(req, file, cb) {
  if (file.mimetype === 'application/pdf') return cb(null, true);
  cb(new Error('Only PDF files are allowed for resume'), false);
}

const uploadAvatar = multer({ storage, limits, fileFilter: avatarFilter }).single('avatar');
const uploadResume = multer({ storage, limits, fileFilter: resumeFilter }).single('resume');

const uploadBoth = multer({
  storage,
  limits,
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'avatar') return avatarFilter(req, file, cb);
    if (file.fieldname === 'resume') return resumeFilter(req, file, cb);
    return cb(new Error('Unexpected field: ' + file.fieldname), false);
  },
}).fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'resume', maxCount: 1 },
]);

module.exports = { uploadAvatar, uploadResume, uploadBoth };
