import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Card, CardContent, CardHeader, Stack, TextField, Typography, Link } from '@mui/material';
import { login } from '../api/auth';
import useAuth from '../hooks/useAuth';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import { useSnackbar } from 'notistack';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export default function Login() {
  const { enqueueSnackbar } = useSnackbar();
  const { login: doLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({ resolver: zodResolver(schema) });

  // show message from query params (e.g. after email verification redirect)
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const verified = q.get('verified');
    const msg = q.get('msg');
    if (verified !== null) {
      // verified=1 -> success, verified=0 -> error
      const text = msg ? decodeURIComponent(msg) : (verified === '1' ? 'Email verified successfully' : 'Verification failed');
      enqueueSnackbar(text, { variant: verified === '1' ? 'success' : 'error' });
      // remove query params from URL without reload
      const base = location.pathname;
      window.history.replaceState({}, document.title, base);
    }
  }, [location.search, location.pathname, enqueueSnackbar]);

  const onSubmit = async (values) => {
    try {
      const { data } = await login(values);
      doLogin(data.token, data.user); // your auth context
      enqueueSnackbar('Welcome back!', { variant: 'success' });
      navigate('/jobs');
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message || 'Login failed', { variant: 'error' });
    }
  };

  return (
    <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
      <Card sx={{ width: 420, maxWidth: '95%' }}>
        <CardHeader title="Log in to HireNest" />
        <CardContent>
          <Stack spacing={2} component="form" onSubmit={handleSubmit(onSubmit)}>
            <TextField
              label="Email"
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
              autoComplete="email"
              autoFocus
            />
            <TextField
              label="Password"
              type="password"
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
              autoComplete="current-password"
            />
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              Login
            </Button>

            <Typography variant="body2" sx={{ mt: 1 }}>
              <Link component={RouterLink} to="/forgot-password" underline="hover">Forgot password?</Link>
              {' '}• New here? <Link component={RouterLink} to="/register" underline="hover">Create an account</Link>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
