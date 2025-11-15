import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getApplicantForRecruiter } from '../../api/users';
import PageContainer from '../../components/PageContainer';
import { Avatar, Button, Card, CardContent, CardHeader, Chip, Grid, Stack, Typography } from '@mui/material';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

export default function ApplicantProfile() {
  const { id } = useParams();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['applicant', id],
    queryFn: () => getApplicantForRecruiter(id).then(r => r.data),
  });

  if (isLoading) return <PageContainer>Loading...</PageContainer>;
  if (isError) {
    return (
      <PageContainer>
        <Typography color="error">{error?.response?.data?.message || 'Failed to load applicant'}</Typography>
      </PageContainer>
    );
  }

  const roles = data?.jobRoles || [];

  const viewUrl = data?.resumePublicId
    ? `${API_BASE}/api/files/signed-raw?public_id=${encodeURIComponent(data.resumePublicId)}`
    : (data?.resume || '');

  const downloadUrl = data?.resumePublicId
    ? `${API_BASE}/api/files/signed-raw?public_id=${encodeURIComponent(data.resumePublicId)}&download=1&filename=${encodeURIComponent(`${data?.name || 'resume'}.pdf`)}`
    : (data?.resume ? `${data.resume}${data.resume.includes('?') ? '&' : '?'}fl_attachment=${encodeURIComponent(`${data?.name || 'resume'}.pdf`)}` : '');

  return (
    <PageContainer>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Applicant" />
            <CardContent>
              <Stack alignItems="center" spacing={2}>
                <Avatar src={data.profilePic} sx={{ width: 100, height: 100 }} />
                <Typography variant="h6">{data.name}</Typography>
                <Typography variant="body2" color="text.secondary">{data.email}</Typography>

                {viewUrl ? (
                  <Stack direction="row" spacing={1}>
                    <Button href={viewUrl} target="_blank" rel="noreferrer" variant="outlined" size="small">
                      View Resume
                    </Button>
                    <Button href={downloadUrl} target="_blank" rel="noreferrer" variant="contained" size="small">
                      Download Resume
                    </Button>
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">No resume uploaded</Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader title="Details" />
            <CardContent>
              <Stack spacing={2}>
                <div>
                  <Typography variant="subtitle2" color="text.secondary">Job Roles</Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                    {roles.length
                      ? roles.map((r, i) => <Chip key={i} label={r} size="small" />)
                      : <Typography variant="body2" color="text.secondary">No roles specified</Typography>}
                  </Stack>
                </div>
                <Typography variant="body2" color="text.secondary">
                  Joined: {data?.createdAt ? new Date(data.createdAt).toLocaleDateString() : '—'}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </PageContainer>
  );
}
