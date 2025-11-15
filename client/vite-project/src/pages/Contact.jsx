import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Card, CardContent, CardHeader, Stack, TextField, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import PageContainer from '../components/PageContainer';
import { sendContactMessage } from '../api/contact';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  subject: z.string().min(3, 'Subject is required'),
  message: z.string().min(10, 'Please enter at least 10 characters'),
});

export default function Contact() {
  const { enqueueSnackbar } = useSnackbar();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', subject: '', message: '' },
  });

  const onSubmit = async (values) => {
    try {
      await sendContactMessage(values);
      enqueueSnackbar('Message sent! Our team will contact you shortly.', { variant: 'success' });
      reset();
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message || 'Failed to send message', { variant: 'error' });
    }
  };

  return (
    <PageContainer>
      <Stack spacing={3}>
        <Typography variant="h4" fontWeight={800}>Contact Us</Typography>

        <Card>
          <CardHeader title="Send us a message" />
          <CardContent>
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={2}>
                <TextField label="Your Name" {...register('name')} error={!!errors.name} helperText={errors.name?.message} />
                <TextField label="Email" type="email" {...register('email')} error={!!errors.email} helperText={errors.email?.message} />
                <TextField label="Subject" {...register('subject')} error={!!errors.subject} helperText={errors.subject?.message} />
                <TextField label="Message" {...register('message')} multiline minRows={5} error={!!errors.message} helperText={errors.message?.message} />
                <Box>
                  <Button type="submit" variant="contained" disabled={isSubmitting}>Send</Button>
                </Box>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Stack>
    </PageContainer>
  );
}
