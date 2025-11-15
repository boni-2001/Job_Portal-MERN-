import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchContactMessages, markContactMessageRead } from '../../api/admin';
import { Card, CardHeader, CardContent, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Chip, Typography } from '@mui/material';
import DoneIcon from '@mui/icons-material/Done';
import PageContainer from '../../components/PageContainer';
import { useSnackbar } from 'notistack';

export default function AdminMessages() {
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const { data = [], isLoading, isError, error } = useQuery({
    queryKey: ['admin-contact-messages'],
    queryFn: () => fetchContactMessages().then(r => r.data),
  });

  const markRead = useMutation({
    mutationFn: (id) => markContactMessageRead(id),
    onSuccess: () => {
      enqueueSnackbar('Marked as read', { variant: 'success' });
      qc.invalidateQueries({ queryKey: ['admin-contact-messages'] });
      qc.invalidateQueries({ queryKey: ['admin-unread-count'] });
    },
    onError: (e) => enqueueSnackbar(e?.response?.data?.message || 'Failed', { variant: 'error' }),
  });

  return (
    <PageContainer>
      <Card>
        <CardHeader title="Incoming Messages" />
        <CardContent>
          {isLoading && <Typography>Loading…</Typography>}
          {isError && <Typography color="error">{error?.response?.data?.message || 'Failed to load messages'}</Typography>}
          {!isLoading && !isError && (
            <List>
              {data.map(msg => (
                <ListItem key={msg._id} alignItems="flex-start" divider>
                  <ListItemText
                    primary={
                      <>
                        <strong>{msg.subject}</strong>{' '}
                        {!msg.read && <Chip size="small" color="primary" label="NEW" sx={{ ml: 1 }} />}
                      </>
                    }
                    secondary={
                      <>
                        <Typography variant="body2"><b>From:</b> {msg.name} &lt;{msg.email}&gt; {msg.role ? `• ${msg.role}` : ''}</Typography>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 0.5 }}>{msg.message}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(msg.createdAt).toLocaleString()}
                        </Typography>
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    {!msg.read && (
                      <IconButton edge="end" onClick={() => markRead.mutate(msg._id)} title="Mark as read">
                        <DoneIcon />
                      </IconButton>
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
              {data.length === 0 && <Typography color="text.secondary">No messages yet.</Typography>}
            </List>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}