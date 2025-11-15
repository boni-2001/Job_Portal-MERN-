
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listJobs } from "../api/jobs";
import {
  Typography,
  TextField,
  InputAdornment,
  Stack,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import SearchIcon from "@mui/icons-material/Search";
import PageContainer from "../components/PageContainer";
import JobCard from "../components/JobCard";
import useAuth from "../hooks/useAuth";
import { applyToJob } from "../api/applications";
import { useSnackbar } from "notistack";

export default function Jobs() {
  const { user, token } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  // --- search state (with debounce) ---
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState(q);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 350);
    return () => clearTimeout(t);
  }, [q]);

  const {
    data: jobs = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["jobs", debouncedQ],
    queryFn: () =>
      // listJobs accepts an optional params object; pass { q } when searching
      listJobs(debouncedQ ? { q: debouncedQ } : undefined).then((r) => r.data),
    select: (d) => (Array.isArray(d) ? d : d?.items ?? d?.jobs ?? []),
    keepPreviousData: true,
  });

  const handleApply = async (jobId) => {
    if (!token) {
      enqueueSnackbar("Please login to apply", { variant: "warning" });
      return;
    }
    if (user?.role !== "seeker") {
      enqueueSnackbar("Only job seekers can apply", { variant: "info" });
      return;
    }

    try {
      const fd = new FormData();
      fd.append("coverLetter", "Excited to apply via HireNest.");
      await applyToJob(jobId, fd);
      enqueueSnackbar("Applied successfully!", { variant: "success" });
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message || "Apply failed", {
        variant: "error",
      });
    }
  };

  const canApply = user?.role === "seeker";
  const isLoggedIn = !!token;

  return (
    <PageContainer>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        sx={{ mb: 3 }}
      >
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Latest Jobs
        </Typography>

        {/* Search: job title / company / skills */}
        <TextField
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by title, company, or skill…"
          size="small"
          sx={{ minWidth: { xs: "100%", sm: 360 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      {isLoading && "Loading..."}

      {isError && (
        <Typography color="error">
          {error?.response?.data?.message || "Failed to load jobs"}
        </Typography>
      )}

      {!isLoading && !isError && (
        <>
          {jobs.length === 0 ? (
            <Typography color="text.secondary">
              No jobs to show{debouncedQ ? ` for “${debouncedQ}”` : ""}.
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {jobs.map((job) => {
                const id = job._id || job.id;

                
                return (
                  <Grid item xs={12} md={6} lg={4} key={id}>
                    <JobCard
                      job={job}
                      canApply={canApply} // only seekers see Apply
                      isLoggedIn={isLoggedIn}
                      onApply={() => handleApply(id)}
                    />
                  </Grid>
                );
              })}
            </Grid>
          )}
        </>
      )}
    </PageContainer>
  );
}
