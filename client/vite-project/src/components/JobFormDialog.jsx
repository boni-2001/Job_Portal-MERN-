import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Stack, FormControlLabel, Switch, Avatar, Typography
} from '@mui/material';

const schema = z.object({
  title: z.string().min(2, 'Title required'),
  company: z.string().min(1, 'Company required'),
  location: z.string().optional(),
  salaryRange: z.string().optional(),
  description: z.string().min(10, 'Description too short'),
  skillsCsv: z.string().optional(), // comma separated
  isActive: z.boolean().optional(),
  // file input (not validated by zod here)
  companyLogoFile: z.any().optional(),
});

export default function JobFormDialog({ open, onClose, onSubmit, initial }) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      company: '',
      location: '',
      salaryRange: '',
      description: '',
      skillsCsv: '',
      isActive: true,
      companyLogoFile: null,
    },
  });

  // preview: prefer newly picked file; else show existing logo if editing
  const companyLogoFile = watch('companyLogoFile');
  const logoPreview = useMemo(() => {
    if (companyLogoFile instanceof File) {
      return URL.createObjectURL(companyLogoFile);
    }
    if (initial?.companyLogo) return initial.companyLogo;
    return '';
  }, [companyLogoFile, initial?.companyLogo]);

  useEffect(() => {
    if (initial) {
      reset({
        title: initial.title || '',
        company: initial.company || '',
        location: initial.location || '',
        salaryRange:
          typeof initial.salaryRange === 'string'
            ? initial.salaryRange
            : typeof initial.salary === 'string'
            ? initial.salary
            : '',
        description: initial.description || '',
        skillsCsv: (initial.skills || []).join(','),
        isActive: initial.isActive !== false,
        companyLogoFile: null,
      });
    } else {
      reset();
    }
  }, [initial, reset]);

  const submit = (values) => {
    // Build FormData for multipart upload
    const fd = new FormData();
    fd.append('title', values.title);
    fd.append('company', values.company);
    if (values.location) fd.append('location', values.location);
    // Map salaryRange -> salary (backend accepts string)
    if (values.salaryRange) fd.append('salary', values.salaryRange);
    fd.append('description', values.description);
    if (values.skillsCsv) fd.append('skills', values.skillsCsv); // backend accepts CSV or array

    //  company logo file: required on create; optional on edit (server enforces create)
    if (values.companyLogoFile instanceof File) {
      fd.append('companyLogo', values.companyLogoFile);
    }

    

    return onSubmit(fd);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initial ? 'Edit Job' : 'Create Job'}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            label="Job title"
            {...register('title')}
            error={!!errors.title}
            helperText={errors.title?.message}
          />
          <TextField
            label="Company"
            {...register('company')}
            error={!!errors.company}
            helperText={errors.company?.message}
          />
          <TextField label="Location" {...register('location')} />
          <TextField label="Salary range" {...register('salaryRange')} />
          <TextField label="Skills (comma separated)" {...register('skillsCsv')} />
          <TextField
            label="Description"
            {...register('description')}
            multiline
            minRows={4}
            error={!!errors.description}
            helperText={errors.description?.message}
          />

          {/* Company Logo (file) */}
          <Stack direction="row" spacing={2} alignItems="center">
            <div>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                Company Logo {initial ? '(optional on edit)' : '(required)'}
              </Typography>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setValue('companyLogoFile', file, { shouldValidate: false });
                }}
              />
              <Typography variant="caption" color="text.secondary">
                PNG/JPG up to 5MB
              </Typography>
            </div>
            <Avatar
              src={logoPreview || undefined}
              variant="rounded"
              sx={{ width: 48, height: 48 }}
            />
          </Stack>

          {/* Keep the Active switch for UI, but we don't send it to backend */}
          <FormControlLabel control={<Switch defaultChecked {...register('isActive')} />} label="Active" />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>Cancel</Button>
        <Button onClick={handleSubmit(submit)} variant="contained" disabled={isSubmitting}>
          {initial ? 'Save changes' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
