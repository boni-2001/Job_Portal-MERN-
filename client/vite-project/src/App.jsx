import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Public pages
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import NotFound from './pages/NotFound';

// Dashboards
import SeekerDashboard from './pages/dashboards/SeekerDashboard';
import RecruiterDashboard from './pages/dashboards/RecruiterDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';

// Role pages
import SeekerProfile from './pages/SeekerProfile';
import RecruiterJobs from './pages/recruiter/RecruiterJobs';
import ApplicantProfile from './pages/recruiter/ApplicantProfile'; // NEW

// Routing helpers
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';
import { ROLES } from './utils/roles';

export default function App() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <Box sx={{ flex: 1 }}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:id/:token" element={<ResetPassword />} />

          {/* Protected */}
          <Route element={<ProtectedRoute />}>
            {/* Seeker-only */}
            <Route element={<RoleRoute allow={[ROLES.SEEKER]} />}>
              <Route path="/dashboard/seeker" element={<SeekerDashboard />} />
              <Route path="/profile" element={<SeekerProfile />} />
            </Route>

            {/* Recruiter-only */}
            <Route element={<RoleRoute allow={[ROLES.RECRUITER]} />}>
              <Route path="/dashboard/recruiter" element={<RecruiterDashboard />} />
              <Route path="/recruiter/jobs" element={<RecruiterJobs />} />
              <Route path="/recruiter/applicants/:id" element={<ApplicantProfile />} /> {/* NEW */}
            </Route>

            {/* Admin-only */}
            <Route element={<RoleRoute allow={[ROLES.ADMIN]} />}>
              <Route path="/dashboard/admin" element={<AdminDashboard />} />
            </Route>
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Box>
      <Footer />
    </Box>
  );
}
