
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recruiterAllApplications, updateApplicationStatus } from '../../api/applications';
import PageContainer from '../../components/PageContainer';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Stack,
  Chip,
  Button,
  Avatar,
  Divider,
  IconButton,
  Box,
  Paper,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import useAuth from '../../hooks/useAuth';
import MoreVertIcon from '@mui/icons-material/MoreVert';

export default function RecruiterDashboard() {
  const [status, setStatus] = useState('');
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth(); // to show welcome name

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['recruiterAllApplications', status],
    queryFn: () =>
      recruiterAllApplications({ status: status || undefined }).then((r) => r.data),
    keepPreviousData: true,
  });

  const mutation = useMutation({
    mutationFn: ({ id, newStatus }) => updateApplicationStatus(id, newStatus),
    onSuccess: (_res, variables) => {
      // Refetch list after change (preserve current filter)
      qc.invalidateQueries({ queryKey: ['recruiterAllApplications'] });
      if (variables.newStatus === 'accepted') {
        enqueueSnackbar('Application accepted. Email sent to applicant.', { variant: 'success' });
      } else {
        enqueueSnackbar('Status updated.', { variant: 'success' });
      }
    },
    onError: (e) => {
      enqueueSnackbar(e?.response?.data?.message || 'Update failed', { variant: 'error' });
    },
  });

  const filters = ['', 'applied', 'shortlisted', 'rejected', 'accepted'];

  return (
    <PageContainer>
      <Box sx={{ maxWidth: 1100, mx: 'auto', width: '100%', px: { xs: 2, sm: 3 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <div>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Candidates
            </Typography>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 0.5 }}>
              {user ? `Welcome, ${user.name}` : 'Manage applications'}
            </Typography>
          </div>

          <Stack direction="row" spacing={1} alignItems="center">
            {filters.map((s) => (
              <Chip
                key={s || 'all'}
                label={s || 'All'}
                onClick={() => setStatus(s)}
                color={s === status ? 'primary' : 'default'}
                clickable
                size="small"
              />
            ))}
          </Stack>
        </Stack>

        {isLoading && (
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Loading...
          </Typography>
        )}

        {isError && (
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography color="error">
              {error?.response?.data?.message || 'Failed to load applications'}
            </Typography>
          </Paper>
        )}

        {!isLoading && !isError && (
          <>
            <Grid container spacing={2}>
              {(data?.items || []).map((a) => (
                <Grid item xs={12} md={6} key={a._id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: 3 }}>
                    <CardHeader
                      avatar={
                        <Avatar
                          src={a.applicant?.profilePic || a.applicant?.avatar || ''}
                          alt={a.applicant?.name || 'A'}
                          sx={{ width: 48, height: 48 }}
                        />
                      }
                      action={
                        <IconButton aria-label="more">
                          <MoreVertIcon />
                        </IconButton>
                      }
                      title={
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          {a.applicant?.name}
                        </Typography>
                      }
                      subheader={<Typography variant="caption">{a.applicant?.email}</Typography>}
                      sx={{ pb: 0 }}
                    />

                    <CardContent sx={{ flex: 1 }}>
                      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                        {/* Job logo if available */}
                        {a.job?.companyLogo ? (
                          <Avatar
                            src={a.job.companyLogo}
                            variant="rounded"
                            sx={{ width: 56, height: 56 }}
                            alt={a.job.company}
                          />
                        ) : (
                          <Avatar variant="rounded" sx={{ width: 56, height: 56 }}>
                            {a.job?.company?.[0] || 'C'}
                          </Avatar>
                        )}

                        <div style={{ flex: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            {a.job?.title} <Typography component="span" color="text.secondary">• {a.job?.company}</Typography>
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {a.job?.location || 'Remote'}
                          </Typography>
                        </div>
                      </Stack>

                      <Stack direction="row" spacing={1} sx={{ mb: 1 }} alignItems="center" flexWrap="wrap">
                        <Chip
                          label={a.status}
                          color={
                            a.status === 'accepted'
                              ? 'success'
                              : a.status === 'rejected'
                              ? 'error'
                              : a.status === 'shortlisted'
                              ? 'warning'
                              : 'default'
                          }
                          size="small"
                        />

                        {(a.applicant?.jobRoles || []).slice(0, 4).map((r, idx) => (
                          <Chip key={idx} label={r} size="small" variant="outlined" />
                        ))}
                      </Stack>

                      <Divider sx={{ my: 1 }} />

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }} noWrap>
                        {a.coverLetter || a.applicant?.coverLetter || 'No cover letter provided.'}
                      </Typography>

                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        <Button
                          size="small"
                          onClick={() =>
                            navigate(`/recruiter/applicants/${a.applicant?._id || a.applicantId}`)
                          }
                        >
                          View Profile
                        </Button>

                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => mutation.mutate({ id: a._id, newStatus: 'shortlisted' })}
                        >
                          Shortlist
                        </Button>

                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => mutation.mutate({ id: a._id, newStatus: 'rejected' })}
                        >
                          Reject
                        </Button>

                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() => mutation.mutate({ id: a._id, newStatus: 'accepted' })}
                        >
                          Accept
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {(!data?.items || data.items.length === 0) && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                No applications found for this filter.
              </Typography>
            )}
          </>
        )}
      </Box>
    </PageContainer>
  );
}
