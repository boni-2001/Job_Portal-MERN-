import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Card, CardContent, CardHeader, Stack, TextField, Typography } from '@mui/material';
import { forgotPassword } from '../api/auth';
import { useSnackbar } from 'notistack';

const schema = z.object({ email: z.string().email() });

export default function ForgotPassword() {
  const { enqueueSnackbar } = useSnackbar();
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } =
    useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values) => {
    try {
      await forgotPassword(values);
      enqueueSnackbar('If the email exists, a reset link was sent.', { variant: 'success' });
      reset();
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message || 'Failed to send reset link', { variant: 'error' });
    }
  };

  return (
    <Box sx={{ display:'grid', placeItems:'center', minHeight:'60vh' }}>
      <Card sx={{ width: 420, maxWidth: '95%' }}>
        <CardHeader title="Forgot Password" />
        <CardContent>
          <Stack spacing={2} component="form" onSubmit={handleSubmit(onSubmit)}>
            <Typography variant="body2" color="text.secondary">
              Enter your account email. We’ll send a password reset link if it exists.
            </Typography>
            <TextField label="Email" {...register('email')} error={!!errors.email} helperText={errors.email?.message} />
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              Send reset link
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
