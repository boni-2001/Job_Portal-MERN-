
import React, { useState } from "react";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Stack,
  TextField,
  Typography,
  Avatar,
  Paper,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import PageContainer from "../components/PageContainer";
import useAuth from "../hooks/useAuth";
import { useSnackbar } from "notistack";
import { getJobById } from "../api/jobs"; // alias for getJob
import { applyToJob } from "../api/applications";

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { user, token } = useAuth(); // user?.role: 'seeker' | 'recruiter' | 'admin'

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["job", id],
    queryFn: () => getJobById(id).then((r) => r.data),
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });

  const [coverLetter, setCoverLetter] = useState("");
  const [resumeFile, setResumeFile] = useState(null);

  const isLoggedIn = !!token;
  const isSeeker = user?.role === "seeker";

  // Show/hide entire Apply card:
  // - Seekers: show apply form
  // - Logged out: show login CTA
  // - Recruiters/Admins: HIDE the card entirely
  const showApplyCard = !isLoggedIn || isSeeker;

  const mutation = useMutation({
    mutationFn: async (payload) => await applyToJob(id, payload),
    onSuccess: () => {
      enqueueSnackbar("Applied successfully!", { variant: "success" });
      setCoverLetter("");
      setResumeFile(null);
    },
    onError: (e) => {
      enqueueSnackbar(e?.response?.data?.message || "Apply failed", {
        variant: "error",
      });
    },
  });

  const handleApply = async () => {
    if (!isLoggedIn) {
      enqueueSnackbar("Please login to apply", { variant: "warning" });
      navigate("/login");
      return;
    }
    if (!isSeeker) {
      // Guard (UI already hides apply for non-seekers)
      enqueueSnackbar("Only job seekers can apply", { variant: "info" });
      return;
    }

    try {
      const fd = new FormData();
      if (coverLetter) fd.append("coverLetter", coverLetter);
      if (resumeFile) fd.append("resume", resumeFile);
      mutation.mutate(fd);
    } catch (err) {
      enqueueSnackbar("Failed to submit application", { variant: "error" });
    }
  };

  if (isLoading) return <PageContainer>Loading job...</PageContainer>;

  if (isError) {
    return (
      <PageContainer>
        <Typography color="error">
          {error?.response?.data?.message || "Failed to load job"}
        </Typography>
      </PageContainer>
    );
  }

  const job = data || {};
  const skills = job.skills || job.tags || [];

  return (
    <PageContainer>
      <Box sx={{ maxWidth: 1100, mx: "auto", px: { xs: 2, sm: 3 } }}>
        <Grid container spacing={3}>
          {/* LEFT: Job details */}
          <Grid item xs={12} md={showApplyCard ? 8 : 12}>
            <Card elevation={3}>
              <CardHeader
                title={
                  <Stack direction="row" spacing={2} alignItems="center">
                    {job.companyLogo ? (
                      <Avatar
                        src={job.companyLogo}
                        alt={job.company || "Company"}
                        variant="rounded"
                        sx={{ width: 64, height: 64 }}
                      />
                    ) : (
                      <Avatar variant="rounded" sx={{ width: 64, height: 64 }}>
                        {job.company?.[0] ? job.company[0].toUpperCase() : "C"}
                      </Avatar>
                    )}

                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 800 }}>
                        {job.title || "Job Title"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                        {(job.company || "Company") + " • " + (job.location || "Remote")}
                      </Typography>
                    </Box>
                  </Stack>
                }
                sx={{ pb: 0 }}
              />

              <CardContent>
                {job.isApproved === false && (
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1,
                      display: "inline-block",
                      mb: 2,
                      background: (t) => t.palette.warning.light,
                    }}
                  >
                    <Typography variant="caption" color="text.primary">
                      Pending admin approval
                    </Typography>
                  </Paper>
                )}

                {skills?.length > 0 && (
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                    {skills.map((s, i) => (
                      <Chip key={i} label={s} size="small" />
                    ))}
                  </Stack>
                )}

                <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 700 }}>
                  About the role
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: "pre-line", mb: 2 }}>
                  {job.description || "No description provided."}
                </Typography>

                {job.salary && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 700 }}>
                      Compensation
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {typeof job.salary === "string"
                        ? job.salary
                        : `${job.salary?.min ?? ""} - ${job.salary?.max ?? ""}`}
                    </Typography>
                  </>
                )}

                {job.type && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 700 }}>
                      Job Type
                    </Typography>
                    <Typography variant="body2">{job.type}</Typography>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* RIGHT: Apply card — hidden for recruiter/admin */}
          {showApplyCard && (
            <Grid item xs={12} md={4}>
              <Card elevation={3}>
                <CardHeader title="Apply" />
                <CardContent>
                  {!isLoggedIn && (
                    <Stack spacing={2}>
                      <Typography variant="body2" color="text.secondary">
                        Please log in to apply for this job.
                      </Typography>
                      <Button component={RouterLink} to="/login" variant="contained">
                        Login to Apply
                      </Button>
                    </Stack>
                  )}

                  {isLoggedIn && isSeeker && (
                    <Stack spacing={2}>
                      <TextField
                        label="Cover letter (optional)"
                        multiline
                        minRows={3}
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        fullWidth
                        variant="outlined"
                        placeholder="Write a short cover note for the recruiter..."
                      />

                      <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                          Attach resume (PDF, optional)
                        </Typography>
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                          style={{ display: "block" }}
                        />
                        {resumeFile && (
                          <Typography variant="caption" sx={{ mt: 1, display: "block" }}>
                            Selected: {resumeFile.name}
                          </Typography>
                        )}
                      </Box>

                      <Button
                        variant="contained"
                        onClick={handleApply}
                        disabled={mutation.isLoading}
                        fullWidth
                      >
                        {mutation.isLoading ? "Submitting..." : "Apply Now"}
                      </Button>
                    </Stack>
                  )}
                </CardContent>
              </Card>

              {/* Secondary actions */}
              <Box sx={{ mt: 2 }}>
                <Card elevation={1}>
                  <CardContent>
                    <Stack spacing={1}>
                      <Button variant="outlined" component={RouterLink} to="/jobs">
                        Back to Jobs
                      </Button>
                      <Button
                        variant="text"
                        onClick={() => {
                          // quick view of recruiter or company page could go here
                          enqueueSnackbar("You can contact the recruiter from the job details.", {
                            variant: "info",
                          });
                        }}
                      >
                        Contact recruiter
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Box>
            </Grid>
          )}

          {/* If apply card hidden (recruiter/admin), still show Back to Jobs in the right column */}
          {!showApplyCard && (
            <Grid item xs={12} md={4}>
              <Box sx={{ mt: { xs: 2, md: 0 } }}>
                <Card elevation={1}>
                  <CardContent>
                    <Stack spacing={1}>
                      <Button variant="outlined" component={RouterLink} to="/jobs">
                        Back to Jobs
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Box>
            </Grid>
          )}
        </Grid>
      </Box>
    </PageContainer>
  );
}
