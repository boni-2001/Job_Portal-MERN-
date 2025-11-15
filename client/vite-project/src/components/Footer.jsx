import { Box, Container, Typography, Stack, Link } from '@mui/material';

export default function Footer() {
  return (
    <Box sx={{ borderTop: '1px solid #eee', mt: 6, py: 3, bgcolor: 'background.paper' }}>
      <Container maxWidth="lg">
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
          <Typography variant="body2">© {new Date().getFullYear()} HireNest. All rights reserved.</Typography>
          <Stack direction="row" spacing={3}>
            <Link href="/about" underline="hover">About</Link>
            <Link href="/contact" underline="hover">Contact</Link>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
