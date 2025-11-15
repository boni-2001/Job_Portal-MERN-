
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { me, updateMe } from '../api/users';
import PageContainer from '../components/PageContainer';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Stack,
  TextField,
  Typography,
  Grid,
  Divider,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import useAuth from '../hooks/useAuth';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

export default function SeekerProfile() {
  const { enqueueSnackbar } = useSnackbar();
  const qc = useQueryClient();
  const { user: viewer } = useAuth(); // viewer = logged-in user (may be undefined)

  const { data, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => me().then(r => r.data),
    // keep previous behaviour
  });

  const { register, handleSubmit, reset } = useForm({
    defaultValues: { name: '', jobRolesCsv: '' }
  });

  const mutation = useMutation({
    mutationFn: (formData) => updateMe(formData),
    onSuccess: () => {
      enqueueSnackbar('Profile updated', { variant: 'success' });
      qc.invalidateQueries({ queryKey: ['me'] });
    },
    onError: (e) => enqueueSnackbar(e?.response?.data?.message || 'Update failed', { variant: 'error' })
  });

  const onSubmit = (values) => {
    const fd = new FormData();
    if (values.name) fd.append('name', values.name);
    if (values.jobRolesCsv) fd.append('jobRoles', values.jobRolesCsv);
    if (values.avatar?.[0]) fd.append('avatar', values.avatar[0]);
    if (values.resume?.[0]) fd.append('resume', values.resume[0]);
    mutation.mutate(fd);
  };

  useEffect(() => {
    if (data) {
      reset({
        name: data.name || '',
        jobRolesCsv: (data.jobRoles || []).join(', ')
      });
    }
  }, [data, reset]);

  if (isLoading) return <PageContainer>Loading...</PageContainer>;

  // Signed/raw URLs (prefer public_id signed route when available)
  const viewUrl = data?.resumePublicId
    ? `${API_BASE}/api/files/signed-raw?public_id=${encodeURIComponent(data.resumePublicId)}`
    : (data?.resume || '');

  const downloadUrl = data?.resumePublicId
    ? `${API_BASE}/api/files/signed-raw?public_id=${encodeURIComponent(data.resumePublicId)}&download=1&filename=${encodeURIComponent(`${data?.name || 'resume'}.pdf`)}`
    : (data?.resume ? `${data.resume}${data.resume.includes('?') ? '&' : '?'}fl_attachment=${encodeURIComponent(`${data?.name || 'resume'}.pdf`)}` : '');

  // Determine whether to show resume buttons:
  // - Always show to the profile owner (the seeker themself).
  // - If viewer.role === 'recruiter' and viewer is NOT the owner -> hide (per your request).
  const viewerId = viewer?.id || viewer?._id;
  const isOwner = data && (String(data._id || data.id) === String(viewerId));
  const viewerIsRecruiter = viewer?.role === 'recruiter';

  const showResumeButtons = Boolean(viewUrl) && (isOwner || !viewerIsRecruiter);

  return (
    <PageContainer>
      <Box sx={{ maxWidth: 960, mx: 'auto', width: '100%', px: { xs: 2, sm: 3 } }}>
        <Grid container spacing={3} justifyContent="center">
          {/* Left: Profile Card */}
          <Grid item xs={12} md={4}>
            <Card sx={{ boxShadow: 3 }}>
              <CardHeader title="Profile" sx={{ pb: 0 }} />
              <CardContent>
                <Stack alignItems="center" spacing={2}>
                  <Avatar src={data.profilePic} sx={{ width: 96, height: 96 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{data.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{data.email}</Typography>

                  <Divider sx={{ width: '100%', my: 1 }} />

                  {showResumeButtons ? (
                    <Stack direction="row" spacing={1}>
                      <Button
                        href={viewUrl}
                        target="_blank"
                        rel="noreferrer"
                        variant="outlined"
                        size="small"
                      >
                        View Resume
                      </Button>
                      <Button
                        href={downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        variant="contained"
                        size="small"
                      >
                        Download
                      </Button>
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                      {data.resume ? 'Resume available (hidden for recruiters)' : 'No resume uploaded'}
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Right: Update Form */}
          <Grid item xs={12} md={8}>
            <Card sx={{ boxShadow: 3 }}>
              <CardHeader title="Update profile" sx={{ pb: 0 }} />
              <CardContent>
                <Stack
                  spacing={2}
                  component="form"
                  onSubmit={handleSubmit(onSubmit)}
                >
                  <TextField
                    label="Full name"
                    {...register('name')}
                    fullWidth
                    size="small"
                  />

                  <TextField
                    label="Job roles (comma separated)"
                    {...register('jobRolesCsv')}
                    fullWidth
                    size="small"
                    helperText="e.g. Frontend Developer, React"
                  />

                  <Typography variant="subtitle2" sx={{ mt: 1 }}>Avatar</Typography>
                  <input type="file" accept="image/*" {...register('avatar')} />

                  <Typography variant="subtitle2" sx={{ mt: 1 }}>Resume (PDF)</Typography>
                  <input type="file" accept="application/pdf" {...register('resume')} />

                  <Box sx={{ pt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button type="submit" variant="contained">
                      Save changes
                    </Button>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
}
