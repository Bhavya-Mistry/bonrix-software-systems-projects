import React, { useState } from 'react';
import {
  Typography,
  Box,
  Button,
  Paper,
  TextField,
  Grid,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar
} from '@mui/material';
import { Upload as UploadIcon } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useModel } from '../../context/ModelContext';
import ResultCard from '../../components/ResultCard';
import ResumeAnalysisResult from '../../components/ResumeAnalysisResult';
import { DEFAULT_JOB_PROFILES, getUserJobProfiles, saveUserJobProfiles } from '../../utils/jobProfiles';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const ResumeAnalysis = () => {
  const { user, updateUserCredits } = useAuth();
  const { getSelectedModelForTask, getModelDetails } = useModel();
  const model = getSelectedModelForTask('resume_analysis');
  const modelDetails = getModelDetails(model);

  const [resumeFile, setResumeFile] = useState(null);
  const [jobProfile, setJobProfile] = useState('');
  const [userProfiles, setUserProfiles] = useState(() => getUserJobProfiles());
  const [manageDialogOpen, setManageDialogOpen] = useState(false);
  const [newProfile, setNewProfile] = useState('');
  const [profileError, setProfileError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleAddProfile = () => {
    if (!newProfile.trim()) {
      setProfileError('Profile name cannot be empty');
      return;
    }
    if ([...DEFAULT_JOB_PROFILES, ...userProfiles].includes(newProfile.trim())) {
      setProfileError('Profile already exists');
      return;
    }
    const updated = [...userProfiles, newProfile.trim()];
    setUserProfiles(updated);
    saveUserJobProfiles(updated);
    setNewProfile('');
    setProfileError('');
    setSnackbar({ open: true, message: 'Job profile added successfully!', severity: 'success' });
  };

  const handleDeleteProfile = (profile) => {
    const updated = userProfiles.filter(p => p !== profile);
    setUserProfiles(updated);
    saveUserJobProfiles(updated);
    if (jobProfile === profile) setJobProfile('');
    setSnackbar({ open: true, message: 'Job profile deleted successfully!', severity: 'success' });
  };

  const jobProfiles = [...DEFAULT_JOB_PROFILES, ...userProfiles];

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [estimatedCredits, setEstimatedCredits] = useState(0);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setResumeFile(acceptedFiles[0]);

        const fileSizeInKB = acceptedFiles[0].size / 1024;
        const modelRate = modelDetails?.rate || 10;
        const baseTokens = 1500;
        const inputTokens = (fileSizeInKB * 1000) / 4;
        const scalingFactor = Math.max(1.0, inputTokens / 1000);
        const estimatedTokens = baseTokens * Math.min(scalingFactor, 3.0);
        const estimatedCost = Math.ceil((estimatedTokens / 1000) * modelRate);
        setEstimatedCredits(estimatedCost);
      }
    }
  });

  const handleJobProfileChange = (e) => {
    setJobProfile(e.target.value);

    if (!resumeFile) {
      const modelRate = modelDetails?.rate || 10;
      const baseTokens = 1500;
      setEstimatedCredits(Math.ceil((baseTokens / 1000) * modelRate));
      return;
    }

    const fileSizeInKB = resumeFile.size / 1024;
    const modelRate = modelDetails?.rate || 10;
    const baseTokens = 1500;
    const inputTokens = (fileSizeInKB * 1000) / 4;
    const scalingFactor = Math.max(1.0, inputTokens / 1000);
    const estimatedTokens = baseTokens * Math.min(scalingFactor, 3.0);
    const estimatedCost = Math.ceil((estimatedTokens / 1000) * modelRate);
    setEstimatedCredits(estimatedCost);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!resumeFile) {
      setError('Please upload a resume file');
      return;
    }

    if (!jobProfile) {
      setError('Please select a job profile');
      return;
    }

    if (user.credits < estimatedCredits) {
      setError(`You don't have enough credits. This task requires approximately ${estimatedCredits} credits.`);
      return;
    }

    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('resume_file', resumeFile);
      formData.append('job_profile', jobProfile);
      formData.append('model', model);

      const response = await axios.post(
        `${API_URL}/api/resume-analysis/analyze`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            ...(user?.access_token ? { 'Authorization': `Bearer ${user.access_token}` } : {})
          }
        }
      );

      updateUserCredits(user.credits - response.data.credits_used);
      setResult(response.data);
    } catch (error) {
      console.error('Resume analysis error:', error);
      if (error.response?.status === 402) {
        setError(error.response.data.detail || 'Insufficient credits for this operation.');
      } else {
        setError(error.response?.data?.detail || 'An error occurred while analyzing the resume. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Box>
        <Typography variant="h4" gutterBottom>
          Resume Analysis
        </Typography>
        <Typography variant="body1" paragraph color="text.secondary">
          Upload a resume and provide a job description to analyze the candidate's fit.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        )}

        {/* Model & Cost Section */}
        <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
          <Grid container spacing={3}>
            {/* AI Model */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                AI Model
              </Typography>
              <Paper
                variant="outlined"
                sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '56px', borderRadius: 2 }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body1">
                    {modelDetails?.name || model}
                  </Typography>
                  <Chip 
                    label={modelDetails?.provider || 'AI'} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                  />
                </Box>
              </Paper>
            </Grid>
            {/* Estimated Credits */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Estimated Cost
              </Typography>
              <Paper
                variant="outlined"
                sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', maxHeight: '56px', borderRadius: 2 }}
              >
                <Typography variant="h6" color="primary">
                  {estimatedCredits} credits
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Paper>

        {/* Resume Upload Section */}
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Resume Upload */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Upload Resume
                </Typography>
                <Box
                  {...getRootProps()}
                  className="dropzone"
                  sx={{
                    border: '2px dashed',
                    borderColor: isDragActive ? 'primary.main' : 'divider',
                    bgcolor: isDragActive ? 'action.hover' : 'background.paper',
                    p: 4,
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <input {...getInputProps()} />
                  {resumeFile ? (
                    <Box>
                      <Typography>{resumeFile.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {(resumeFile.size / 1024).toFixed(1)} KB
                      </Typography>
                      <Button size="small" sx={{ mt: 1 }} onClick={(e) => {
                        e.stopPropagation();
                        setResumeFile(null);
                      }}>
                        Remove
                      </Button>
                    </Box>
                  ) : (
                    <>
                      <UploadIcon fontSize="large" color="action" sx={{ mb: 1 }} />
                      <Typography>Drag & drop a resume file here, or click to select</Typography>
                      <Typography variant="body2" color="text.secondary">Supported formats: PDF, DOC, DOCX, TXT</Typography>
                    </>
                  )}
                </Box>
              </Grid>

              {/* Job Profile */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Job Profile
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="job-profile-label">Select a Job Profile</InputLabel>
                    <Select
                      labelId="job-profile-label"
                      id="job-profile"
                      value={jobProfile}
                      onChange={handleJobProfileChange}
                      label="Select a Job Profile"
                    >
                      <MenuItem value=""><em>Select a profile</em></MenuItem>
                      {jobProfiles.map(profile => (
                        <MenuItem key={profile} value={profile}>
                          {profile}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Button
                    variant="outlined"
                    onClick={() => setManageDialogOpen(true)}
                    sx={{ ml: 2, whiteSpace: 'nowrap' }}
                  >
                    Manage Profiles
                  </Button>
                </Box>
              </Grid>
              {/* Submit Button */}
              <Grid item xs={12}>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Your balance: {user?.credits.toFixed(0)} credits
                  </Typography>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading || !resumeFile || !jobProfile}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                  >
                    {loading ? 'Analyzing...' : 'Analyze Resume'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>

        {result && result.task === 'Resume Analysis' ? (
          <ResumeAnalysisResult result={result} />
        ) : result && <ResultCard result={result} />}

        <Paper elevation={1} sx={{ p: 3, mt: 4 }}>
          <Typography variant="h6" gutterBottom>About Resume Analysis</Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body2" paragraph>
            Our Resume Analysis tool uses AI to compare a candidate's resume against a selected job profile to determine their fit for the role.
          </Typography>
          <Typography variant="body2" paragraph>
            The analysis provides a fit score, highlights the candidate's strengths, identifies potential red flags, and gives an overall verdict on the candidate's suitability.
          </Typography>
        </Paper>
      </Box>

      {/* Manage Profile Dialog */}
      <Dialog
        open={manageDialogOpen}
        onClose={() => setManageDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle>Manage Job Profiles</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <TextField
              label="Add New Job Profile"
              fullWidth
              value={newProfile}
              onChange={e => setNewProfile(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleAddProfile();
              }}
            />
            <Button sx={{ mt: 1 }} variant="contained" onClick={handleAddProfile}>
              Add
            </Button>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" gutterBottom>Existing Profiles</Typography>
          <Box>
            {[...DEFAULT_JOB_PROFILES, ...userProfiles].map(profile => (
              <Box key={profile} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography sx={{ flex: 1 }}>{profile}</Typography>
                {userProfiles.includes(profile) && (
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleDeleteProfile(profile)}
                  >
                    Delete
                  </Button>
                )}
              </Box>
            ))}
          </Box>
          {profileError && (
            <Alert severity="error" sx={{ mt: 2 }}>{profileError}</Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setManageDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ResumeAnalysis;