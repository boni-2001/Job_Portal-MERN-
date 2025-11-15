
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  approveJob,
  listNotifications,
  listPendingJobs,
  markNotificationRead,
} from "../../api/admin";
import PageContainer from "../../components/PageContainer";
import {
  Card,
  CardContent,
  Stack,
  Typography,
  Button,
  Chip,
  Divider,
  Box,
  Paper,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import useSocket from "../../hooks/useSocket";
import { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";

export default function AdminDashboard() {
  const socket = useSocket();
  const qc = useQueryClient();
  const { user } = useAuth();

  const { data: pending } = useQuery({
    queryKey: ["pendingJobs"],
    queryFn: () => listPendingJobs().then((r) => r.data),
  });

  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => listNotifications().then((r) => r.data),
  });

  const approve = useMutation({
    mutationFn: approveJob,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pendingJobs"] }),
  });

  const markRead = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const [socketNote, setSocketNote] = useState(null);

  useEffect(() => {
    if (!socket) return;
    const handler = (n) => {
      setSocketNote(n);
      qc.invalidateQueries({ queryKey: ["notifications"] });
    };
    socket.on("notification", handler);
    return () => socket.off("notification", handler);
  }, [socket]);

  return (
    <PageContainer>
      <Box sx={{ maxWidth: 1100, mx: "auto", px: { xs: 2, sm: 3 } }}>
        {/* Header Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Admin Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {user ? `Welcome, ${user.name}` : "Monitor and manage jobs & system activity"}
          </Typography>
        </Box>

        {/* Real-time notification alert */}
        {socketNote && (
          <Paper
            sx={{
              mb: 3,
              p: 2,
              borderLeft: "5px solid #1976d2",
              backgroundColor: "#f1f6ff",
            }}
          >
            <Typography variant="subtitle2" color="primary">
              Real-time Update
            </Typography>
            <Typography variant="body2">{socketNote.message}</Typography>
          </Paper>
        )}

        <Grid container spacing={3}>
          {/* Pending Jobs Section */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: "100%", boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Pending Jobs
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {(pending || []).map((j) => (
                  <Paper
                    key={j._id}
                    elevation={0}
                    sx={{
                      p: 1.5,
                      mb: 1,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      border: "1px solid #eee",
                      borderRadius: 1,
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {j.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {j.company} • {j.location || "Remote"}
                      </Typography>
                    </Box>

                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      onClick={() => approve.mutate(j._id)}
                    >
                      Approve
                    </Button>
                  </Paper>
                ))}

                {!pending?.length && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    No pending jobs at the moment.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Notifications Section */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: "100%", boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Notifications
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {(notifications || []).map((n) => (
                  <Paper
                    key={n._id}
                    elevation={0}
                    sx={{
                      p: 1.5,
                      mb: 1,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      border: "1px solid #eee",
                      borderRadius: 1,
                      backgroundColor: n.read ? "#fafafa" : "#f8fbff",
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        label={n.type}
                        color={
                          n.type.includes("accepted")
                            ? "success"
                            : n.type.includes("rejected")
                            ? "error"
                            : "default"
                        }
                        size="small"
                        variant="outlined"
                      />
                      <Typography variant="body2">{n.message}</Typography>
                    </Stack>

                    {!n.read ? (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => markRead.mutate(n._id)}
                      >
                        Mark Read
                      </Button>
                    ) : (
                      <Chip
                        label="Read"
                        size="small"
                        variant="outlined"
                        sx={{
                          borderColor: "#ccc",
                          color: "#666",
                        }}
                      />
                    )}
                  </Paper>
                ))}

                {!notifications?.length && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    No new notifications.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
}
