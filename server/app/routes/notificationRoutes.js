const router = require('express').Router();
const auth = require('../middlewares/authMiddleware');
const NotificationController = require('../controllers/NotificationController');

router.get('/admin/unread-count', auth, NotificationController.unreadCount);
router.get('/admin', auth, NotificationController.list);
router.patch('/:id/read', auth, NotificationController.markRead);

module.exports = router;
