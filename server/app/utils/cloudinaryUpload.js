
const cloudinary = require('../config/cloudinary');
const stream = require('stream');

/**
 * Low-level generic buffer uploader (no forced format).
 * Callers pass resource_type/folder/format as needed.
 */
function uploadBufferGeneric(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const passthrough = new stream.PassThrough();

    const baseOptions = {
      type: 'upload',
      access_mode: 'public',
      use_filename: true,
      unique_filename: true,
      overwrite: false,
      ...options,
    };

    const upload = cloudinary.uploader.upload_stream(
      baseOptions,
      (err, result) => (err ? reject(err) : resolve(result))
    );

    passthrough.end(buffer);
    passthrough.pipe(upload);
  });
}

/**
 * Upload a PDF (resume) as RAW.
 */
function uploadPdfBuffer(buffer, options = {}) {
  return uploadBufferGeneric(buffer, {
    resource_type: 'raw',
    format: 'pdf',
    folder: 'resumes',
    ...options,
  });
}

/**
 * Upload an IMAGE (logo/avatar) as IMAGE.
 */
function uploadImageBuffer(buffer, options = {}) {
  const safe = { resource_type: 'image', folder: 'company_logos', ...options };
  if (String(safe.format || '').toLowerCase() === 'pdf') delete safe.format; // guard
  return uploadBufferGeneric(buffer, safe);
}

/* ---------- Backward-compatible alias ---------- */
/* Your existing code imports { uploadBuffer } for resumes (PDF).
   Keep that working by aliasing it to uploadPdfBuffer. */
const uploadBuffer = uploadPdfBuffer;

module.exports = {
  uploadBufferGeneric,
  uploadPdfBuffer,
  uploadImageBuffer,
  uploadBuffer, // alias for old code
};
