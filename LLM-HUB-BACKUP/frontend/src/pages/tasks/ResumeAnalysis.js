import React, { useState } from 'react';
import {
  Typography,
  Box,
  Paper,
  Button,
  TextField,
  Grid,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Upload as UploadIcon } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useModel } from '../../context/ModelContext';
import ResultCard from '../../components/ResultCard';
import ResumeAnalysisResult from '../../components/ResumeAnalysisResult';

// API URL from environment variable
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const ResumeAnalysis = () => {
  const { user, updateUserCredits } = useAuth();
  const { getSelectedModelForTask, getModelDetails } = useModel();
  
  // Get the selected model for this task
  const model = getSelectedModelForTask('resume_analysis');
  const modelDetails = getModelDetails(model);
  
  // Form state
  const [resumeFile, setResumeFile] = useState(null);
  const [jobProfile, setJobProfile] = useState('');
  
  // Job profiles list
  const jobProfiles = [
    'Full Stack Developer',
    'Backend Developer (Node.js, Django, etc.)',
    'Frontend Developer (React, Angular, Vue.js)',
    'Mobile App Developer (iOS/Android/Flutter)',
    'DevOps Engineer',
    'Data Scientist',
    'Machine Learning Engineer',
    'Data Analyst',
    'AI Research Engineer',
    'Prompt Engineer (LLM / NLP)',
    'Cloud Solutions Architect (AWS/GCP/Azure)',
    'System Administrator',
    'Site Reliability Engineer (SRE)',
    'Cybersecurity Analyst',
    'Product Manager (Tech)',
    'UI/UX Designer',
    'Technical Program Manager',
    'QA/Test Automation Engineer',
    'Embedded Engineer',
    'Business Analyst',
    'Operations Manager',
    'Product Manager (Non-Tech)',
    'Strategy Consultant',
    'Project Coordinator',
    'Digital Marketing Specialist',
    'Sales Executive / Manager',
    'Content Strategist',
    'SEO Analyst',
    'Customer Success Manager',
    'Accountant / Chartered Accountant (CA)',
    'Financial Analyst',
    'Human Resources (HR) Executive',
    'Payroll Specialist',
    'Recruiter / Talent Acquisition Specialist',
    'Graphic Designer',
    'Social Media Manager',
    'Video Editor / Animator',
    'Copywriter / Content Writer',
    'Public Relations (PR) Executive'
  ];
  
  // Processing state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  
  // Estimated credits
  const [estimatedCredits, setEstimatedCredits] = useState(0);
  
  // File dropzone
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
        
        // Update estimated credits based on file size and model
        const fileSizeInKB = acceptedFiles[0].size / 1024;
        
        // Get model rate from the selected model
        const modelRate = modelDetails?.rate || 10; // Default to 10 if rate not available
        
        // Base tokens for resume analysis (should match backend TASK_BASE_TOKENS)
        const baseTokens = 1500;
        
        // Calculate scaling factor based on file size (similar to backend calculation)
        // Rough estimate: 1 token ≈ 4 characters, and 1KB ≈ 1000 characters
        const inputTokens = (fileSizeInKB * 1000) / 4;
        const scalingFactor = Math.max(1.0, inputTokens / 1000);
        const estimatedTokens = baseTokens * Math.min(scalingFactor, 3.0); // Cap at 3x base
        
        // Calculate credits: (tokens / 1000) * model rate
        const estimatedCost = Math.ceil((estimatedTokens / 1000) * modelRate);
        
        setEstimatedCredits(estimatedCost);
      }
    }
  });
  
  // Handle job profile change
  const handleJobProfileChange = (e) => {
    setJobProfile(e.target.value);
    
    // If no resume file yet, don't update credits
    if (!resumeFile) {
      // Set a baseline estimate for the selected model
      const modelRate = modelDetails?.rate || 10;
      const baseTokens = 1500; // Base tokens for resume analysis
      setEstimatedCredits(Math.ceil((baseTokens / 1000) * modelRate));
      return;
    }
    
    // If resume file exists, recalculate with the same logic as onDrop
    const fileSizeInKB = resumeFile.size / 1024;
    const modelRate = modelDetails?.rate || 10;
    const baseTokens = 1500;
    
    const inputTokens = (fileSizeInKB * 1000) / 4;
    const scalingFactor = Math.max(1.0, inputTokens / 1000);
    const estimatedTokens = baseTokens * Math.min(scalingFactor, 3.0);
    
    const estimatedCost = Math.ceil((estimatedTokens / 1000) * modelRate);
    setEstimatedCredits(estimatedCost);
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!resumeFile) {
      setError('Please upload a resume file');
      return;
    }
    
    if (!jobProfile) {
      setError('Please select a job profile');
      return;
    }
    
    // Check if user has enough credits
    if (user.credits < estimatedCredits) {
      setError(`You don't have enough credits. This task requires approximately ${estimatedCredits} credits.`);
      return;
    }
    
    // Clear previous errors and results
    setError('');
    setLoading(true);
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append('resume_file', resumeFile);
      formData.append('job_profile', jobProfile);
      formData.append('model', model);
      
      // Send request to API
      const response = await axios.post(
        `${API_URL}/api/resume-analysis/analyze`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      // Update user credits
      updateUserCredits(user.credits - response.data.credits_used);
      
      // Set result
      setResult(response.data);
    } catch (error) {
      console.error('Resume analysis error:', error);
      
      // Handle insufficient credits error specifically
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
    <Box>
      <Typography variant="h4" gutterBottom>
        Resume Analysis
      </Typography>
      
      <Typography variant="body1" paragraph color="text.secondary">
        Upload a resume and provide a job description to analyze the candidate's fit.
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
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
                  borderColor: isDragActive ? 'primary.main' : 'divider',
                  bgcolor: isDragActive ? 'action.hover' : 'background.paper'
                }}
              >
                <input {...getInputProps()} />
                {resumeFile ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      {resumeFile.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {(resumeFile.size / 1024).toFixed(1)} KB
                    </Typography>
                    <Button
                      size="small"
                      sx={{ mt: 1 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setResumeFile(null);
                      }}
                    >
                      Remove
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                    <UploadIcon fontSize="large" color="action" sx={{ mb: 1 }} />
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      Drag & drop a resume file here, or click to select
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Supported formats: PDF, DOC, DOCX, TXT
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>
            
            {/* Job Description */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Job Profile
              </Typography>
              
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
                  {jobProfiles.map((profile) => (
                    <MenuItem key={profile} value={profile}>
                      {profile}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* Selected Model */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                AI Model
              </Typography>
              
              <Paper
                variant="outlined"
                sx={{ 
                  p: 2, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  height: '100%',
                  maxHeight: '56px'
                }}
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
                sx={{ 
                  p: 2, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  maxHeight: '56px'
                }}
              >
                <Typography variant="h6" color="primary">
                  {estimatedCredits} credits
                </Typography>
              </Paper>
            </Grid>
            
            {/* Submit Button */}
            <Grid item xs={12}>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
      
      {/* Results */}
      {result && result.task === 'Resume Analysis' ? (
        <ResumeAnalysisResult result={result} />
      ) : (
        result && <ResultCard result={result} />
      )}
      
      {/* Information */}
      <Paper elevation={1} sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          About Resume Analysis
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body2" paragraph>
          Our Resume Analysis tool uses AI to compare a candidate's resume against a selected job profile to determine their fit for the role.
        </Typography>
        <Typography variant="body2" paragraph>
          The analysis provides a fit score, highlights the candidate's strengths, identifies potential red flags, and gives an overall verdict on the candidate's suitability.
        </Typography>
        <Typography variant="body2">
          This helps recruiters and hiring managers quickly identify promising candidates and make more informed decisions.
        </Typography>
      </Paper>
    </Box>
  );
};

export default ResumeAnalysis;
