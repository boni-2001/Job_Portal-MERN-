const router = require('express').Router();
const auth = require('../middlewares/authMiddleware');
const ContactController = require('../controllers/ContactController');

// Auth is optional: if logged in we capture user/role; if not, treat as guest
router.post('/', auth.optional ? auth.optional : (req, _res, next) => next(), ContactController.create);

module.exports = router;
