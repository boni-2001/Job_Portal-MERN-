import { Grid, Typography, Paper, Stack } from '@mui/material';
import PageContainer from '../components/PageContainer';

export default function About() {
  return (
    <PageContainer>
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>About HireNest</Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            We’re a modern job platform where design meets performance. We match world-class talent with world-class teams.
          </Typography>
          <Stack spacing={2}>
            <Paper sx={{ p: 2 }}>⚡ Lightning-fast job search powered by a clean API.</Paper>
            <Paper sx={{ p: 2 }}>🔒 Secure authentication with email verification and role-based access.</Paper>
            <Paper sx={{ p: 2 }}>📡 Real-time notifications for admins and recruiters.</Paper>
          </Stack>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, height: '100%', display: 'grid', placeItems: 'center', fontSize: 120, opacity: 0.1 }}>
            🪺
          </Paper>
        </Grid>
      </Grid>
    </PageContainer>
  );
}
