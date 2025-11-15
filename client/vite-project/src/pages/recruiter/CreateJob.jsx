import React, { useState } from 'react';
import { Card, CardContent, CardHeader, Stack, TextField, Button, Typography } from '@mui/material';
import PageContainer from '../../components/PageContainer';
import { useSnackbar } from 'notistack';
import { createJob } from '../../api/jobs';
import { useNavigate } from 'react-router-dom';

export default function CreateJob() {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
    skillsCsv: '',
  });
  const [logoFile, setLogoFile] = useState(null);

  const onChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('company', form.company);
      if (form.location) fd.append('location', form.location);
      fd.append('description', form.description);
      if (form.skillsCsv) {
        // backend accepts array or CSV; send as CSV here
        fd.append('skills', form.skillsCsv);
      }
      if (logoFile) fd.append('companyLogo', logoFile); // 🔑 the new logo

      await createJob(fd);
      enqueueSnackbar('Job created (pending admin approval)', { variant: 'success' });
      navigate('/dashboard/recruiter');
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.message || 'Failed to create job', { variant: 'error' });
    }
  };

  return (
    <PageContainer title="Post a Job">
      <Card component="form" onSubmit={onSubmit}>
        <CardHeader title="Create Job" />
        <CardContent>
          <Stack spacing={2}>
            <TextField label="Job title" name="title" value={form.title} onChange={onChange} required />
            <TextField label="Company" name="company" value={form.company} onChange={onChange} required />
            <TextField label="Location" name="location" value={form.location} onChange={onChange} />
            <TextField label="Description" name="description" value={form.description} onChange={onChange} required multiline minRows={4} />
            <TextField label="Skills (comma separated)" name="skillsCsv" value={form.skillsCsv} onChange={onChange} />

            <div>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Company Logo (required)</Typography>
              <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
            </div>

            <Button type="submit" variant="contained">Create</Button>
          </Stack>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
