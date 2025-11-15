import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Card, CardContent, CardHeader, Stack, TextField } from '@mui/material';
import { resetPassword } from '../api/auth';
import { useSnackbar } from 'notistack';

const schema = z.object({
  password: z.string().min(6, 'Minimum 6 characters'),
  confirm: z.string().min(6)
}).refine((vals) => vals.password === vals.confirm, {
  path: ['confirm'],
  message: 'Passwords do not match'
});

export default function ResetPassword() {
  const { id, token } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } =
    useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values) => {
    try {
      await resetPassword(id, token, { password: values.password });
      enqueueSnackbar('Password updated. Please log in.', { variant: 'success' });
      navigate('/login');
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message || 'Reset failed', { variant: 'error' });
      reset({ password: '', confirm: '' });
    }
  };

  return (
    <Box sx={{ display:'grid', placeItems:'center', minHeight:'60vh' }}>
      <Card sx={{ width: 420, maxWidth: '95%' }}>
        <CardHeader title="Set a new password" />
        <CardContent>
          <Stack spacing={2} component="form" onSubmit={handleSubmit(onSubmit)}>
            <TextField label="New password" type="password" {...register('password')} error={!!errors.password} helperText={errors.password?.message} />
            <TextField label="Confirm password" type="password" {...register('confirm')} error={!!errors.confirm} helperText={errors.confirm?.message} />
            <Button type="submit" variant="contained" disabled={isSubmitting}>Update password</Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
