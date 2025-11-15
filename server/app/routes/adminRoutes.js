// server/app/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController');
const auth = require('../middlewares/authMiddleware');
const admin = require('../middlewares/adminMiddleware');

/**
 * @openapi
 * tags:
 *   - name: Admin
 *     description: Admin-only endpoints (dashboard, user management, job approvals, notifications)
 */

/**
 * @openapi
 * /api/admin/dashboard:
 *   get:
 *     tags: [Admin]
 *     summary: Admin dashboard summary
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 */
router.get('/dashboard', auth, admin, AdminController.dashboard);

/**
 * @openapi
 * /api/admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: List all users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of users
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/users', auth, admin, AdminController.listUsers);

/**
 * @openapi
 * /api/admin/users/{id}/toggle-verify:
 *   put:
 *     tags: [Admin]
 *     summary: Toggle a user's email verification status
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: User id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User updated
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put('/users/:id/toggle-verify', auth, admin, AdminController.toggleVerify);

/**
 * @openapi
 * /api/admin/jobs/pending:
 *   get:
 *     tags: [Admin]
 *     summary: List pending jobs awaiting approval
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of pending jobs
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/jobs/pending', auth, admin, AdminController.listPendingJobs);

/**
 * @openapi
 * /api/admin/jobs/{id}/approve:
 *   post:
 *     tags: [Admin]
 *     summary: Approve a pending job
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Job id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job approved
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/jobs/:id/approve', auth, admin, AdminController.approveJob);

/**
 * @openapi
 * /api/admin/notifications:
 *   get:
 *     tags: [Admin]
 *     summary: List admin notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of notifications
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/notifications', auth, admin, AdminController.listNotifications);

/**
 * @openapi
 * /api/admin/notifications/{id}/read:
 *   put:
 *     tags: [Admin]
 *     summary: Mark a notification as read
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Notification id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked read
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put('/notifications/:id/read', auth, admin, AdminController.markNotificationRead);

module.exports = router;
