// server/app/routes/jobRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');

const auth = require('../middlewares/authMiddleware');
const JobController = require('../controllers/JobController');

/**
 * Multer: memory storage so we can stream to Cloudinary (no temp files)
 * Also enforce image-only uploads for company logos.
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file || !file.mimetype) {
      return cb(new Error('Invalid file upload'));
    }
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed for company logo.'));
    }
    cb(null, true);
  },
});

/**
 * Helper wrapper so multer errors are forwarded as next(err) and can be
 * formatted by your global error handler (instead of sending HTML).
 * Use: uploadHandler('companyLogo') -> middleware
 */
function uploadHandler(fieldName) {
  return (req, res, next) => {
    const single = upload.single(fieldName);
    single(req, res, (err) => {
      if (err) return next(err);
      return next();
    });
  };
}

/**
 * @openapi
 * /api/jobs:
 *   get:
 *     summary: List approved jobs (public)
 *     tags:
 *       - Jobs
 *     responses:
 *       200:
 *         description: Array of approved jobs
 */
router.get('/', JobController.list);

/**
 * NOTE: Keep recruiter routes before '/:id' to avoid param shadowing
 */

/**
 * @openapi
 * /api/jobs/recruiter/me:
 *   get:
 *     summary: Get jobs created by the authenticated recruiter
 *     tags:
 *       - Jobs
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of recruiter's jobs
 */
router.get('/recruiter/me', auth, JobController.myJobs);

/**
 * @openapi
 * /api/jobs:
 *   post:
 *     summary: Create a job (recruiter) — multipart with companyLogo image
 *     tags:
 *       - Jobs
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               company:
 *                 type: string
 *               description:
 *                 type: string
 *               companyLogo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Created job
 */
router.post('/', auth, uploadHandler('companyLogo'), JobController.create);

/**
 * @openapi
 * /api/jobs/{id}:
 *   put:
 *     summary: Update a job (recruiter) — companyLogo optional (multipart)
 *     tags:
 *       - Jobs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               companyLogo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Updated job
 */
router.put('/:id', auth, uploadHandler('companyLogo'), JobController.update);

/**
 * @openapi
 * /api/jobs/{id}:
 *   delete:
 *     summary: Delete a job (recruiter/admin)
 *     tags:
 *       - Jobs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted
 */
router.delete('/:id', auth, JobController.remove);

/**
 * @openapi
 * /api/jobs/{id}:
 *   get:
 *     summary: Get a single job
 *     tags:
 *       - Jobs
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job object
 */
 // Keep last so it doesn't shadow more specific routes
router.get('/:id', JobController.getOne);

module.exports = router;
