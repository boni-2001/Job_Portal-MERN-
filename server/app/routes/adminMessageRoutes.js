const router = require('express').Router();
const auth = require('../middlewares/authMiddleware');
const ContactController = require('../controllers/ContactController');

router.get('/', auth, ContactController.listForAdmin);
router.patch('/:id/read', auth, ContactController.markRead);

module.exports = router;
