import { Box, Button, Container, Stack, Typography, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  return (
    <Box sx={{ background: 'linear-gradient(135deg, #eef4ff 0%, #f3fffb 100%)' }}>
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Paper elevation={0} sx={{ p: { xs: 4, md: 8 }, borderRadius: 4, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)' }}>
          <Typography variant="h1" sx={{ fontSize: { xs: 36, md: 56 }, mb: 2 }}>
            Welcome to <span style={{ color: '#5b8def' }}>HireNest</span>
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 720, mb: 4 }}>
            A super sleek job portal where talent and opportunity meet. Discover roles, apply in one click, and manage your hiring pipeline effortlessly.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button size="large" variant="contained" onClick={() => navigate('/jobs')}>Browse Jobs</Button>
            <Button size="large" variant="outlined" onClick={() => navigate('/register')}>Get Started</Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
