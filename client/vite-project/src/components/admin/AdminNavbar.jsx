// client/vite-project/src/components/admin/AdminNavbar.jsx
import React from 'react';
import { AppBar, Toolbar, Typography, Stack, IconButton, Badge } from '@mui/material';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import { useQuery } from '@tanstack/react-query';
import { fetchAdminUnreadCount } from '../../api/admin';
import useAuth from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function AdminNavbar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // fetch unread notifications count (only for admins)
  const { data, refetch } = useQuery({
    queryKey: ['admin-unread-count'],
    queryFn: () => fetchAdminUnreadCount().then(r => r.data),
    enabled: !!isAdmin,
  });

  const count = data?.count ?? 0;

  return (
    <AppBar position="static" color="inherit" elevation={0}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 800 }}>
          Admin Dashboard
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center">
          {isAdmin && (
            <IconButton
              color="inherit"
              aria-label="Notifications"
              onClick={() => {
                refetch();
                navigate('/admin/notifications');
              }}
              size="large"
            >
              <Badge color="error" badgeContent={count} overlap="circular">
                <NotificationsNoneIcon />
              </Badge>
            </IconButton>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
