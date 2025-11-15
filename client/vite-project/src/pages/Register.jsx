import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Card, CardContent, CardHeader, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { register as registerApi } from '../api/auth';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { ROLES } from '../utils/roles';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum([ROLES.SEEKER, ROLES.RECRUITER, ROLES.ADMIN]),
  adminSecret: z.string().optional()
});

export default function Register() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { control, register, handleSubmit, watch, formState: { errors, isSubmitting } } =
    useForm({ resolver: zodResolver(schema), defaultValues: { role: ROLES.SEEKER } });

  const role = watch('role');

  const onSubmit = async (values) => {
    try {
      await registerApi(values);
      enqueueSnackbar('Registered! Please verify your email, then log in.', { variant: 'success' });
      navigate('/login');
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message || 'Registration failed', { variant: 'error' });
    }
  };

  return (
    <Box sx={{ display:'grid', placeItems:'center', minHeight:'60vh' }}>
      <Card sx={{ width: 520, maxWidth: '95%' }}>
        <CardHeader title="Create your HireNest account" />
        <CardContent>
          <Stack spacing={2} component="form" onSubmit={handleSubmit(onSubmit)}>
            <TextField label="Full name" {...register('name')} error={!!errors.name} helperText={errors.name?.message} />
            <TextField label="Email" {...register('email')} error={!!errors.email} helperText={errors.email?.message} />
            <TextField label="Password" type="password" {...register('password')} error={!!errors.password} helperText={errors.password?.message} />
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <TextField select label="I am a" {...field}>
                  <MenuItem value={ROLES.SEEKER}>Job Seeker</MenuItem>
                  <MenuItem value={ROLES.RECRUITER}>Recruiter</MenuItem>
                  <MenuItem value={ROLES.ADMIN}>Admin (requires secret)</MenuItem>
                </TextField>
              )}
            />
            {role === ROLES.ADMIN && (
              <TextField label="Admin Secret" {...register('adminSecret')} error={!!errors.adminSecret} helperText={errors.adminSecret?.message} />
            )}
            <Button type="submit" variant="contained" disabled={isSubmitting}>Register</Button>
            <Typography variant="body2">Already have an account? <a href="/login">Login</a></Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
