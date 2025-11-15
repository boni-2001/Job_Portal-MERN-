import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recruiterMyJobs, createJob, updateJob, deleteJob } from '../../api/jobs';
import PageContainer from '../../components/PageContainer';
import {
  Button, Card, CardContent, IconButton, Stack, Typography, Chip, Tooltip
} from '@mui/material';
import Grid from '@mui/material/Grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import JobFormDialog from '../../components/JobFormDialog.jsx';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';

export default function RecruiterJobs() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['recruiterMyJobs'],
    queryFn: () => recruiterMyJobs().then(r => r.data),
    select: (d) => Array.isArray(d) ? d : (d?.items ?? d?.jobs ?? [])
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const createMut = useMutation({
    mutationFn: (payload) => createJob(payload),
    onSuccess: () => { enqueueSnackbar('Job created', { variant: 'success' }); qc.invalidateQueries({ queryKey: ['recruiterMyJobs'] }); setDialogOpen(false); },
    onError: (e) => enqueueSnackbar(e?.response?.data?.message || 'Create failed', { variant: 'error' })
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }) => updateJob(id, payload),
    onSuccess: () => { enqueueSnackbar('Job updated', { variant: 'success' }); qc.invalidateQueries({ queryKey: ['recruiterMyJobs'] }); setDialogOpen(false); setEditing(null); },
    onError: (e) => enqueueSnackbar(e?.response?.data?.message || 'Update failed', { variant: 'error' })
  });

  const deleteMut = useMutation({
    mutationFn: (id) => deleteJob(id),
    onSuccess: () => { enqueueSnackbar('Job deleted', { variant: 'success' }); qc.invalidateQueries({ queryKey: ['recruiterMyJobs'] }); },
    onError: (e) => enqueueSnackbar(e?.response?.data?.message || 'Delete failed', { variant: 'error' })
  });

  const openCreate = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (job) => { setEditing(job); setDialogOpen(true); };
  const onSubmit = (payload) => {
    if (editing) return updateMut.mutate({ id: editing._id || editing.id, payload });
    return createMut.mutate(payload);
  };

  return (
    <PageContainer>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>My Jobs</Typography>
        <Button variant="contained" onClick={openCreate}>Create Job</Button>
      </Stack>

      {isLoading ? 'Loading...' : (
        <Grid container spacing={2}>
          {(data || []).map(job => (
            <Grid item xs={12} md={6} lg={4} key={job._id || job.id}>
              <Card>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="start">
                    <div>
                      <Typography variant="h6">{job.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {job.company} • {job.location || 'Remote'}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        <Chip size="small" label={job.isApproved ? 'Approved' : 'Pending'} color={job.isApproved ? 'success' : 'warning'} />
                        <Chip size="small" label={job.isActive ? 'Active' : 'Paused'} />
                      </Stack>
                    </div>
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="View"><IconButton onClick={() => navigate(`/jobs/${job._id || job.id}`)}><VisibilityIcon /></IconButton></Tooltip>
                      <Tooltip title="Edit"><IconButton onClick={() => openEdit(job)}><EditIcon /></IconButton></Tooltip>
                      <Tooltip title="Delete"><IconButton color="error" onClick={() => deleteMut.mutate(job._id || job.id)}><DeleteIcon /></IconButton></Tooltip>
                    </Stack>
                  </Stack>
                  <Typography variant="body2" sx={{ mt: 1 }} noWrap>
                    {job.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {(!data || data.length === 0) && <Typography sx={{ ml: 1 }} color="text.secondary">No jobs yet.</Typography>}
        </Grid>
      )}

      <JobFormDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditing(null); }}
        onSubmit={onSubmit}
        initial={editing}
      />
    </PageContainer>
  );
}
