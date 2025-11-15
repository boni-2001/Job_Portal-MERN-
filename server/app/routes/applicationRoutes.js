// server/app/routes/applicationRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const ApplicationController = require('../controllers/ApplicationController');
const auth = require('../middlewares/authMiddleware');

// memory storage for streaming uploads to Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

/**
 * @openapi
 * tags:
 *   - name: Applications
 *     description: Application endpoints (apply, list, update status)
 */

/**
 * @openapi
 * /api/applications/recruiter/me:
 *   get:
 *     tags: [Applications]
 *     summary: Get all applications across jobs owned by the logged-in recruiter (admin/recruiter)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *         description: Page number (for pagination)
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *         description: Filter by application status
 *     responses:
 *       200:
 *         description: Paginated list of applications
 *       401:
 *         description: Unauthorized
 */
router.get('/recruiter/me', auth, ApplicationController.listForRecruiterAll);

/**
 * @openapi
 * /api/applications/apply/{jobId}:
 *   post:
 *     tags: [Applications]
 *     summary: Apply to a job (seeker). Resume file is optional.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: jobId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Job id to apply for
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               coverLetter:
 *                 type: string
 *               resume:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Application created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (job not open for applications)
 */
router.post('/apply/:jobId', auth, upload.single('resume'), ApplicationController.apply);

/**
 * @openapi
 * /api/applications/job/{jobId}:
 *   get:
 *     tags: [Applications]
 *     summary: List applications for a specific job (job owner or admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: jobId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Job id
 *     responses:
 *       200:
 *         description: Array of applications for the job
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Job not found
 */
router.get('/job/:jobId', auth, ApplicationController.listByJob);

/**
 * @openapi
 * /api/applications/me:
 *   get:
 *     tags: [Applications]
 *     summary: Get applications of the logged-in seeker
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of the user's applications
 *       401:
 *         description: Unauthorized
 */
router.get('/me', auth, ApplicationController.listByUser);

/**
 * @openapi
 * /api/applications/{id}/status:
 *   put:
 *     tags: [Applications]
 *     summary: Update an application's status (recruiter/admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Application id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [applied, shortlisted, rejected, accepted]
 *     responses:
 *       200:
 *         description: Status updated
 *       400:
 *         description: Invalid status
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Application not found
 */
router.put('/:id/status', auth, ApplicationController.updateStatus);

module.exports = router;
