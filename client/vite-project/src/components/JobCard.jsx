import { Card, CardContent, CardActions, Typography, Chip, Stack, Button, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function JobCard({ job, onApply, canApply, isLoggedIn }) {
  const skills = job.skills || [];
  const navigate = useNavigate();
  const id = job._id || job.id;

  const handleDetails = () => navigate(`/jobs/${id}`);
  const handleLogin = () => navigate('/login');

  return (
    <Card>
      <CardContent>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          {job.companyLogo ? (
            <Avatar
              src={job.companyLogo}
              alt={job.company}
              sx={{ width: 36, height: 36 }}
              variant="rounded"
            />
          ) : (
            <Avatar sx={{ width: 36, height: 36 }} variant="rounded">
              {String(job.company || 'C').slice(0,1).toUpperCase()}
            </Avatar>
          )}
          <Typography variant="h6">{job.title}</Typography>
        </Stack>

        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {job.company} • {job.location || 'Remote'}
        </Typography>

        <Typography variant="body2" sx={{ mb: 2 }} noWrap>
          {job.description}
        </Typography>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {skills.map((s, i) => (
            <Chip key={i} label={s} size="small" />
          ))}
        </Stack>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button variant="outlined" onClick={handleDetails}>Details</Button>

        {typeof canApply === 'boolean' && typeof isLoggedIn === 'boolean' ? (
          isLoggedIn ? (
            canApply ? (
              <Button variant="contained" onClick={onApply}>Apply</Button>
            ) : null
          ) : (
            <Button variant="contained" onClick={handleLogin}>Login to Apply</Button>
          )
        ) : (
          <Button variant="contained" onClick={onApply}>Apply</Button> // backward-compat
        )}
      </CardActions>
    </Card>
  );
}
