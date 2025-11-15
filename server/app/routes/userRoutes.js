// server/app/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middlewares/authMiddleware');
const UserController = require('../controllers/UserController');

// Use memory storage so we can stream buffers to Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // up to 20MB resume
});

/**
 * @openapi
 * tags:
 *   - name: Users
 *     description: User profile endpoints
 */

/**
 * @openapi
 * /api/users/me:
 *   get:
 *     tags: [Users]
 *     summary: Get the authenticated user's profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile (password omitted)
 *       401:
 *         description: Unauthorized
 */
router.get('/me', auth, UserController.me);

/**
 * @openapi
 * /api/users/me:
 *   put:
 *     tags: [Users]
 *     summary: Update authenticated user's profile (supports avatar image and resume file)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               jobRoles:
 *                 type: string
 *                 description: CSV or array of roles
 *               profilePic:
 *                 type: string
 *                 description: direct URL if you prefer not to upload a file
 *               avatar:
 *                 type: string
 *                 format: binary
 *               resume:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Updated user object (password omitted)
 *       400:
 *         description: Validation error / bad file
 *       401:
 *         description: Unauthorized
 */
router.put(
  '/me',
  auth,
  upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'avatar', maxCount: 1 },
  ]),
  UserController.updateMe
);

/**
 * @openapi
 * /api/users/{id}/for-recruiter:
 *   get:
 *     tags: [Users]
 *     summary: Get a user's profile for recruiter view (admin always; recruiter only if the user applied to one of their jobs)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Seeker user id
 *     responses:
 *       200:
 *         description: Public fields for recruiter (name, email, profilePic, resume, jobRoles)
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.get('/:id/for-recruiter', auth, UserController.getApplicantForRecruiter);

module.exports = router;
