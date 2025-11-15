
import { useQuery } from "@tanstack/react-query";
import { myApplications } from "../../api/applications";
import PageContainer from "../../components/PageContainer";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Chip,
  Stack,
  Box,
  Divider,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import useSocket from "../../hooks/useSocket";
import useAuth from "../../hooks/useAuth";

export default function SeekerDashboard() {
  useSocket();
  const { user } = useAuth();

  const { data = [], isLoading } = useQuery({
    queryKey: ["myApplications"],
    queryFn: () => myApplications().then((r) => r.data),
  });

  return (
    <PageContainer>
      <Box sx={{ maxWidth: 1200, mx: "auto", width: "100%", px: { xs: 1, sm: 2 } }}>
        <Typography variant="h4" sx={{ mb: 0.5, fontWeight: 800 }}>
          My Applications
        </Typography>

        {user?.name && (
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
            Welcome, {user.name} 👋
          </Typography>
        )}

        <Divider sx={{ mb: 3 }} />

        {isLoading && (
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Loading your applications...
          </Typography>
        )}

        {!isLoading && data.length === 0 && (
          <Typography color="text.secondary">You have not applied to any jobs yet.</Typography>
        )}

        <Grid container spacing={3} justifyContent="center">
          {(data || []).map((a) => (
            <Grid item xs={12} md={8} key={a._id}>
              <Card variant="outlined" sx={{ boxShadow: 2 }}>
                <CardHeader
                  title={
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {a.job?.title || "—"}
                    </Typography>
                  }
                  subheader={
                    <Typography variant="body2" color="text.secondary">
                      {a.job?.company} • {a.job?.location || "Remote"}
                    </Typography>
                  }
                  sx={{ pb: 0 }}
                />
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                    <Stack spacing={0.5}>
                      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: "100%" }}>
                        {a.job?.description ? String(a.job.description).slice(0, 220) + (a.job.description.length > 220 ? "…" : "") : ""}
                      </Typography>

                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                        Applied on: {a.appliedAt ? new Date(a.appliedAt).toLocaleDateString() : "—"}
                      </Typography>
                    </Stack>

                    <Stack spacing={1} alignItems="flex-end">
                      <Chip
                        label={a.status || "applied"}
                        color={
                          a.status === "accepted"
                            ? "success"
                            : a.status === "rejected"
                            ? "error"
                            : a.status === "shortlisted"
                            ? "warning"
                            : "default"
                        }
                        sx={{ textTransform: "capitalize", fontWeight: 700 }}
                      />
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </PageContainer>
  );
}
