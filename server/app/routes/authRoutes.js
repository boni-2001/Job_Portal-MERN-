// server/app/routes/authRoutes.js
const router = require('express').Router();
const AuthController = require('../controllers/AuthController');

/**
 * @openapi
 * tags:
 *   - name: Auth
 *     description: Authentication endpoints (register, login, verify, forgot/reset)
 */

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 description: seeker | recruiter | admin
 *               adminSecret:
 *                 type: string
 *                 description: required if role=admin
 *     responses:
 *       201:
 *         description: Registered. Email sent to verify
 *       400:
 *         description: Validation error or email already registered
 */
router.post('/register', AuthController.register);

/**
 * @openapi
 * /api/auth/verify/{id}/{token}:
 *   get:
 *     tags: [Auth]
 *     summary: Verify email token (link from email). Redirects to client.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *       - in: path
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       302:
 *         description: Redirects to client login with status query
 *       400:
 *         description: Invalid token
 */
router.get('/verify/:id/:token', AuthController.verifyEmail);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Log in (returns token and user)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Authentication successful (token + user)
 *       400:
 *         description: Invalid credentials / validation error
 */
router.post('/login', AuthController.login);

/**
 * @openapi
 * /api/auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Request password reset (sends email)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: If that email exists, a reset link was sent
 */
router.post('/forgot-password', AuthController.forgotPassword);

/**
 * @openapi
 * /api/auth/reset-password/{id}/{token}:
 *   post:
 *     tags: [Auth]
 *     summary: Reset password using token
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *       - in: path
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password updated
 *       400:
 *         description: Invalid or expired link
 */
router.post('/reset-password/:id/:token', AuthController.resetPassword);

module.exports = router;
