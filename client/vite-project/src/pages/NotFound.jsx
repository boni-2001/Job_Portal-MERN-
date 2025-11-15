import { Box, Button, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <Box sx={{ minHeight:'60vh', display:'grid', placeItems:'center' }}>
      <div>
        <Typography variant="h3" sx={{ mb: 2 }}>Page not found</Typography>
        <Button variant="contained" component={Link} to="/">Go Home</Button>
      </div>
    </Box>
  );
}
