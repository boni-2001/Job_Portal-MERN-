
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Token = require('../models/Token');
const sendEmail = require('../utils/sendEmail');
const generateToken = require('../utils/generateToken');
const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require('../validators/authValidator');

// import templates
const {
  verifyEmailTemplate,
  resetPasswordTemplate,
} = require('../utils/emailTemplates');

const CLIENT_URL = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
const BASE_URL = (process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`).replace(/\/$/, '');

class AuthController {
  // Register user (creates email verification token + sends email)
  async register(req, res, next) {
    try {
      const { error, value } = registerSchema.validate(req.body);
      if (error) return res.status(400).json({ message: error.details[0].message });

      const { name, email, password, role, adminSecret } = value;

      // allow manual admin creation only with ADMIN_SECRET
      if (role === 'admin') {
        const expected = process.env.ADMIN_SECRET || 'letmein';
        if (adminSecret !== expected) return res.status(403).json({ message: 'Invalid admin secret' });
      }

      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ message: 'Email already registered' });

      const hashed = await bcrypt.hash(password, 10);
      const user = await User.create({ name, email, password: hashed, role });

      const tokenValue = crypto.randomBytes(32).toString('hex');
      await Token.create({
        userId: user._id,
        token: tokenValue,
        purpose: 'emailVerify',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
      });

      // backend verify endpoint — user clicks this, then backend will validate & redirect to client login
      const verifyLink = `${BASE_URL}/api/auth/verify/${user._id}/${tokenValue}`;

      // use HTML template
      const html = verifyEmailTemplate({ name: user.name, link: verifyLink });

      await sendEmail(user.email, 'Verify your email', html);
      res.status(201).json({ message: 'Registered. Please check your email to verify your account.' });
    } catch (err) {
      next(err);
    }
  }

  // When user clicks verification link, backend verifies token and redirects to client login with a message
  async verifyEmail(req, res, next) {
    try {
      const { id, token } = req.params;
      const tokenDoc = await Token.findOne({ userId: id, token, purpose: 'emailVerify' });

      if (!tokenDoc || tokenDoc.expiresAt < new Date()) {
        // redirect to client login with failure message
        const failUrl = `${CLIENT_URL}/login?verified=0&msg=${encodeURIComponent('Invalid or expired verification link')}`;
        return res.redirect(failUrl);
      }

      await User.findByIdAndUpdate(id, { isVerified: true });
      await Token.deleteOne({ _id: tokenDoc._id });

      // success: redirect to client login with success flag/message
      const successUrl = `${CLIENT_URL}/login?verified=1&msg=${encodeURIComponent('Email verified successfully')}`;
      return res.redirect(successUrl);
    } catch (err) {
      next(err);
    }
  }

  // Login
  async login(req, res, next) {
    try {
      const { error, value } = loginSchema.validate(req.body);
      if (error) return res.status(400).json({ message: error.details[0].message });

      const { email, password } = value;
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: 'Invalid credentials' });

      if (!user.isVerified) return res.status(403).json({ message: 'Please verify your email before logging in' });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

      const token = generateToken(user._id);
      res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
      next(err);
    }
  }

  // Forgot password — create a reset token and email the reset link
  async forgotPassword(req, res, next) {
    try {
      const { error, value } = forgotPasswordSchema.validate(req.body);
      if (error) return res.status(400).json({ message: error.details[0].message });

      const user = await User.findOne({ email: value.email });
      // always return same response to avoid user enumeration
      if (!user) return res.json({ message: 'If that email exists, a reset link was sent.' });

      const tokenValue = crypto.randomBytes(32).toString('hex');
      await Token.deleteMany({ userId: user._id, purpose: 'passwordReset' }); // invalidate old
      await Token.create({
        userId: user._id,
        token: tokenValue,
        purpose: 'passwordReset',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1h
      });

      // Link goes to client reset page; client will POST to backend with new password
      const resetLink = `${CLIENT_URL}/reset-password/${user._id}/${tokenValue}`;
      const html = resetPasswordTemplate({ name: user.name || '', link: resetLink });

      await sendEmail(user.email, 'Reset your password', html);
      res.json({ message: 'If that email exists, a reset link was sent.' });
    } catch (err) {
      next(err);
    }
  }

  // Reset password — backend endpoint that client POSTs new password to
  async resetPassword(req, res, next) {
    try {
      const { id, token } = req.params;
      const { error, value } = resetPasswordSchema.validate(req.body);
      if (error) return res.status(400).json({ message: error.details[0].message });

      const tokenDoc = await Token.findOne({ userId: id, token, purpose: 'passwordReset' });
      if (!tokenDoc || tokenDoc.expiresAt < new Date()) {
        return res.status(400).json({ message: 'Invalid or expired link' });
      }

      const hashed = await bcrypt.hash(value.password, 10);
      await User.findByIdAndUpdate(id, { password: hashed });
      await Token.deleteOne({ _id: tokenDoc._id });

      res.json({ message: 'Password updated. You can now log in.' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
