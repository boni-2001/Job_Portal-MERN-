
require('dotenv').config();
const path = require('path');
const http = require('http');
const express = require('express');
const axios = require('axios'); 

const connectDB = require('./app/config/db');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const limiter = require('./app/middlewares/rateLimiter');
const errorHandler = require('./app/middlewares/errorHandler');
const swaggerSetup = require('./app/swagger');
const { initSocket } = require('./app/socket');

const authRoutes = require('./app/routes/authRoutes');
const jobRoutes = require('./app/routes/jobRoutes');
const applicationRoutes = require('./app/routes/applicationRoutes');
const adminRoutes = require('./app/routes/adminRoutes');
const userRoutes = require('./app/routes/userRoutes');
const fileRoutes = require('./app/routes/fileRoutes');
const contactRoutes = require('./app/routes/contactRoutes');
const adminMessageRoutes = require('./app/routes/adminMessageRoutes');
const notificationRoutes = require('./app/routes/notificationRoutes');


const PORT = process.env.PORT || 5000;
const app = express();
const server = http.createServer(app);

// init socket
initSocket(server);

(async () => {
  try {
    await connectDB();

    
    app.use(helmet({ crossOriginResourcePolicy: false }));
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(morgan('dev'));
    app.use(limiter);

    // EJS views
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'ejs');

    // static uploads
    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

    // routes
    app.use('/api/auth', authRoutes);
    app.use('/api/jobs', jobRoutes);
    app.use('/api/applications', applicationRoutes);
    app.use('/api/users', userRoutes);
    app.use('/admin', adminRoutes);
  app.use('/api/files', fileRoutes);  

  app.use('/api/contact', contactRoutes);
app.use('/api/admin/messages', adminMessageRoutes);
app.use('/api/notifications', notificationRoutes);
    //  INLINE & DOWNLOAD ENDPOINTS 
    const ALLOWED_HOSTS = ['res.cloudinary.com'];

    //  (renders PDF in browser)
    app.get('/api/files/inline', async (req, res) => {
      const raw = req.query.url;
      if (!raw) return res.status(400).json({ message: 'Missing url param' });

      let u;
      try { u = new URL(raw); } catch { return res.status(400).json({ message: 'Invalid URL' }); }
      if (!ALLOWED_HOSTS.includes(u.hostname)) {
        return res.status(400).json({ message: 'URL host not allowed' });
      }

      try {
        const upstream = await axios.get(raw, { responseType: 'stream' });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="resume.pdf"');
        upstream.data.pipe(res);
      } catch (e) {
        console.error('Inline proxy error:', e?.response?.status, e?.message);
        res.status(502).json({ message: 'Failed to fetch file' });
      }
    });

    // Force download
    app.get('/api/files/download', (req, res) => {
      const raw = req.query.url;
      const filename = (req.query.filename || 'resume.pdf').trim();
      if (!raw) return res.status(400).json({ message: 'Missing url param' });

      let u;
      try { u = new URL(raw); } catch { return res.status(400).json({ message: 'Invalid URL' }); }
      if (!ALLOWED_HOSTS.includes(u.hostname)) {
        return res.status(400).json({ message: 'URL host not allowed' });
      }

      const sep = u.search && u.search.length > 1 ? '&' : '?';
      const redirectUrl = `${raw}${sep}fl_attachment=${encodeURIComponent(filename)}`;
      return res.redirect(302, redirectUrl);
    });
    //  END INLINE/DOWNLOAD ENDPOINTS

    
    swaggerSetup(app);

    // health
    app.get('/health', (req, res) => res.json({ ok: true }));

    // error handler
    app.use(errorHandler);

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Swagger: ${process.env.BASE_URL || `http://localhost:${PORT}`}/api-docs`);
    });
  } catch (err) {
    console.error('Failed to start', err);
    process.exit(1);
  }
})();
