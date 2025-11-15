// server/app/routes/fileRoutes.js
const express = require('express');
const cloudinary = require('../config/cloudinary');
const router = express.Router();
const { URL } = require('url');

const ALLOWED_CLOUDINARY_HOSTS = ['res.cloudinary.com', 'api.cloudinary.com', 'res-1.cloudinary.com'];

/**
 * Sanitize public_id: trim, decode, and remove trailing .pdf if present.
 * Expected format: folder/name (no extension)
 */
function sanitizePublicId(raw) {
  if (!raw) return null;
  let pid = decodeURIComponent(String(raw).trim());
  // remove leading/trailing slashes
  pid = pid.replace(/^\/+|\/+$/g, '');
  // strip trailing .pdf / .PDF if user accidentally added
  pid = pid.replace(/\.pdf$/i, '');
  return pid || null;
}

/**
 * Try to validate a user-supplied Cloudinary URL.
 * Returns true if host looks like Cloudinary and path is non-empty.
 */
function isAllowedCloudinaryUrl(raw) {
  try {
    const u = new URL(raw);
    return ALLOWED_CLOUDINARY_HOSTS.includes(u.hostname);
  } catch {
    return false;
  }
}

/**
 * @openapi
 * /api/files/signed-raw:
 *   get:
 *     summary: Redirect to a public Cloudinary RAW PDF for inline viewing
 *     description: |
 *       Preferred: pass `public_id=<folder/name>` (no .pdf).  
 *       Alternatively, pass `url=<full_cloudinary_url>`. The route will validate Cloudinary host and redirect to a PDF-viewable URL.
 *     tags:
 *       - Files
 *     parameters:
 *       - in: query
 *         name: public_id
 *         schema:
 *           type: string
 *         description: Cloudinary public_id (folder/name) — recommended
 *       - in: query
 *         name: url
 *         schema:
 *           type: string
 *         description: Full Cloudinary URL (optional; validated for Cloudinary host)
 *     responses:
 *       302:
 *         description: Redirects to Cloudinary PDF URL (inline)
 *       400:
 *         description: Bad request (missing/invalid params)
 *       404:
 *         description: Asset not found
 */
router.get('/signed-raw', (req, res) => {
  const rawPublicId = req.query.public_id;
  const rawUrl = req.query.url;

  // If caller provided a direct url -> validate host and redirect (safer)
  if (rawUrl) {
    if (!isAllowedCloudinaryUrl(rawUrl)) {
      return res.status(400).json({ message: 'Provided url hostname is not allowed' });
    }
    // For direct URL we will assume the user provided a working raw PDF URL.
    return res.redirect(302, rawUrl);
  }

  // Otherwise require public_id
  const pid = sanitizePublicId(rawPublicId);
  if (!pid) {
    return res.status(400).json({ message: 'public_id is required (or provide url).' });
  }

  try {
    // Build Cloudinary URL for a RAW PDF (upload delivery)
    // This ensures: resource_type=raw, type=upload, format=pdf
    const url = cloudinary.url(pid, {
      resource_type: 'raw',
      type: 'upload',
      format: 'pdf',
      secure: true,
      sign_url: false,
    });

    // Redirect client to Cloudinary-hosted PDF (inline by default)
    return res.redirect(302, url);
  } catch (err) {
    console.error('signed-raw error building url', err);
    return res.status(500).json({ message: 'Failed to build Cloudinary URL' });
  }
});

/**
 * @openapi
 * /api/files/signed-download:
 *   get:
 *     summary: Redirect to Cloudinary RAW PDF with forced download (fl_attachment)
 *     description: |
 *       Preferred: pass `public_id=<folder/name>` (no .pdf) and optional `filename=<nice_name.pdf>`.  
 *       Alternatively pass `url=<full_cloudinary_url>` (Cloudinary host validated).
 *     tags:
 *       - Files
 *     parameters:
 *       - in: query
 *         name: public_id
 *         schema:
 *           type: string
 *         description: Cloudinary public_id (folder/name)
 *       - in: query
 *         name: filename
 *         schema:
 *           type: string
 *         description: Suggested downloaded filename (e.g. "John Doe Resume.pdf")
 *       - in: query
 *         name: url
 *         schema:
 *           type: string
 *         description: Full Cloudinary URL (optional; validated for Cloudinary host)
 *     responses:
 *       302:
 *         description: Redirects to Cloudinary URL with fl_attachment query forcing download
 *       400:
 *         description: Bad request (missing/invalid params)
 *       500:
 *         description: Server error
 */
router.get('/signed-download', (req, res) => {
  const rawPublicId = req.query.public_id;
  const rawUrl = req.query.url;
  const filename = (req.query.filename || 'resume.pdf').trim();

  // If direct url provided -> validate host and append fl_attachment if needed
  if (rawUrl) {
    if (!isAllowedCloudinaryUrl(rawUrl)) {
      return res.status(400).json({ message: 'Provided url hostname is not allowed' });
    }
    // Append fl_attachment param to force download (preserve existing query string)
    const sep = rawUrl.includes('?') ? '&' : '?';
    const redirectUrl = `${rawUrl}${sep}fl_attachment=${encodeURIComponent(filename)}`;
    return res.redirect(302, redirectUrl);
  }

  const pid = sanitizePublicId(rawPublicId);
  if (!pid) {
    return res.status(400).json({ message: 'public_id is required (or provide url).' });
  }

  try {
    // Build base Cloudinary URL
    const baseUrl = cloudinary.url(pid, {
      resource_type: 'raw',
      type: 'upload',
      format: 'pdf',
      secure: true,
      sign_url: false,
    });

    const joiner = baseUrl.includes('?') ? '&' : '?';
    const url = `${baseUrl}${joiner}fl_attachment=${encodeURIComponent(filename)}`;
    return res.redirect(302, url);
  } catch (err) {
    console.error('signed-download error building url', err);
    return res.status(500).json({ message: 'Failed to build Cloudinary URL' });
  }
});

module.exports = router;
