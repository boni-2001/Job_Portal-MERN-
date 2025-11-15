import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Stack, IconButton } from '@mui/material';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { ROLES } from '../utils/roles';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const dashboardPath =
    user?.role === ROLES.ADMIN
      ? '/dashboard/admin'
      : user?.role === ROLES.RECRUITER
      ? '/dashboard/recruiter'
      : '/dashboard/seeker';

  return (
    <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: '1px solid #eee' }}>
      <Toolbar>
        {/* Logo / Brand */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          component={RouterLink}
          to="/"
          sx={{ textDecoration: 'none', color: 'inherit' }}
        >
          <IconButton color="primary" edge="start" sx={{ p: 0.5 }}>
            <WorkOutlineIcon />
          </IconButton>
          <Typography variant="h6" fontWeight={800}>
            HireNest
          </Typography>
        </Stack>

        <Box sx={{ flexGrow: 1 }} />

        {/* Nav links + auth controls */}
        <Stack direction="row" spacing={1} alignItems="center">
          <Button component={RouterLink} to="/jobs">Jobs</Button>
          <Button component={RouterLink} to="/about">About</Button>
          <Button component={RouterLink} to="/contact">Contact</Button>

          {user ? (
            <>
              {/* Role-specific quick links */}
              {user.role === ROLES.SEEKER && (
                <Button component={RouterLink} to="/profile">Profile</Button>
              )}
              {user.role === ROLES.RECRUITER && (
                <Button component={RouterLink} to="/recruiter/jobs">My Jobs</Button>
              )}

              <Button variant="outlined" onClick={() => navigate(dashboardPath)}>
                Dashboard
              </Button>
              <Button variant="contained" color="secondary" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button component={RouterLink} to="/login">Login</Button>
              <Button variant="contained" component={RouterLink} to="/register">
                Register
              </Button>
            </>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
