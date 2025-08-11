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
  FormControlLabel,
  Switch
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useModel } from '../../context/ModelContext';
import ResultCard from '../../components/ResultCard';
import ModelSettings from '../../components/ModelSettings';

// API URL from environment variable
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const CustomPrompt = () => {
  const { user, updateUserCredits } = useAuth();
  const { getSelectedModelForTask, getModelDetails, setSelectedModelForTask } = useModel();
  
  // Get the selected model for this task
  const model = getSelectedModelForTask('custom_prompt');
  const modelDetails = getModelDetails(model);
  
  // Form state
  const [prompt, setPrompt] = useState('');
  const [advancedMode, setAdvancedMode] = useState(false);
  const [deepSearch, setDeepSearch] = useState(false);
  
  // Processing state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  
  // Estimated credits
  const [estimatedCredits, setEstimatedCredits] = useState(3);
  // Model selection modal state
  const [modelModalOpen, setModelModalOpen] = useState(false);
  
  // Handle prompt change
  const handlePromptChange = (e) => {
    setPrompt(e.target.value);
    
    // Update estimated credits based on text length
    const textLength = e.target.value.length;
    const baseCredits = 3; // Base credits for custom prompt
    const textMultiplier = Math.min(Math.max(textLength / 500, 1), 5); // Cap at 5x
    
    setEstimatedCredits(Math.ceil(baseCredits * textMultiplier));
  };
  
  // Calculate prompt stats
  const wordCount = prompt.trim() ? prompt.trim().split(/\s+/).length : 0;
  const charCount = prompt.length;
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }
    
    if (prompt.length < 10) {
      setError('Prompt is too short. Please enter at least 10 characters.');
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
      formData.append('prompt', prompt);
      formData.append('model', model);
      formData.append('deep_search', deepSearch ? 'true' : 'false');
      
      // Send request to API
      const response = await axios.post(
        `${API_URL}/api/custom-prompt/execute`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            ...(user?.access_token ? { 'Authorization': `Bearer ${user.access_token}` } : {})
          }
        }
      );
      
      // Update user credits
      updateUserCredits(user.credits - response.data.credits_used);
      
      // Set result
      setResult(response.data);
    } catch (error) {
      console.error('Custom prompt error:', error);
      setError(error.response?.data?.detail || 'An error occurred while executing the prompt. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Example prompts
  const examplePrompts = [
    {
      title: "Creative Writing",
      prompt: "Write a short story about a robot who discovers emotions for the first time. The story should be heartwarming and no more than 500 words."
    },
    {
      title: "Technical Help",
      prompt: "Explain how to implement a binary search algorithm in Python, with code examples and time complexity analysis."
    },
    {
      title: "Business Advice",
      prompt: "I'm starting a small coffee shop. What are the top 5 things I should focus on in my first year of business to ensure success?"
    },
    {
      title: "Learning",
      prompt: "Explain quantum computing to me like I'm 10 years old."
    }
  ];
  
  // Handle example prompt selection
  const handleUseExample = (examplePrompt) => {
    setPrompt(examplePrompt.prompt);
    
    // Update estimated credits
    const textLength = examplePrompt.prompt.length;
    const baseCredits = 3;
    const textMultiplier = Math.min(Math.max(textLength / 500, 1), 5);
    
    setEstimatedCredits(Math.ceil(baseCredits * textMultiplier));
  };
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Custom Prompt
      </Typography>
      
      <Typography variant="body1" paragraph color="text.secondary">
        Create your own custom AI prompts for any task or question.
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* AI Model and Estimated Cost summary box */}
      <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Grid container spacing={3}>
          {/* AI Model */}
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
    maxHeight: '56px',
    borderRadius: 2,
    cursor: 'pointer',
    transition: 'box-shadow 0.2s',
    '&:hover': {
      boxShadow: 4,
      background: 'rgba(33,150,243,0.05)'
    }
  }}
  onClick={() => setModelModalOpen(true)}
  tabIndex={0}
  aria-label="Select AI Model"
>
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <Typography variant="body1">
      {modelDetails?.name || model}
    </Typography>
      {/* Dropdown arrow icon for model selection */}
      <Box
        component="span"
        sx={{
          display: 'flex',
          alignItems: 'center',
          ml: 1,
          width: 24,
          height: 24,
          justifyContent: 'center',
          color: 'primary.main',
          borderRadius: '50%',
          transition: 'background 0.2s',
          '&:hover': {
            background: 'rgba(33,150,243,0.09)'
          }
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </Box>
  </Box>
</Paper>
<ModelSettings
  open={modelModalOpen}
  onClose={() => setModelModalOpen(false)}
  taskType="custom_prompt"
/>

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

      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Example Prompts */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Example Prompts
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {examplePrompts.map((example, index) => (
                  <Chip
                    key={index}
                    label={example.title}
                    onClick={() => handleUseExample(example)}
                    variant="outlined"
                    color="primary"
                    disabled={loading}
                    sx={{ mb: 1 }}
                  />
                ))}
              </Box>
            </Grid>
            
            {/* Prompt Input */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Your Prompt
              </Typography>
              
              <TextField
                multiline
                rows={8}
                fullWidth
                variant="outlined"
                placeholder="Enter your prompt here..."
                value={prompt}
                onChange={handlePromptChange}
                disabled={loading}
              />
              
              <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  {wordCount} words, {charCount} characters
                </Typography>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={advancedMode}
                      onChange={(e) => setAdvancedMode(e.target.checked)}
                      disabled={loading}
                    />
                  }
                  label="Advanced Mode"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={deepSearch}
                      onChange={(e) => setDeepSearch(e.target.checked)}
                      disabled={loading}
                    />
                  }
                  label="Deep Search"
                />
              </Box>
              
              {advancedMode && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    Advanced Mode Tips:
                  </Typography>
                  <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                    <li>Be specific about the format you want (e.g., "Format the response as a table")</li>
                    <li>Specify the tone (e.g., "Use a professional tone")</li>
                    <li>Set constraints (e.g., "Keep the response under 300 words")</li>
                    <li>Ask for examples if needed (e.g., "Include 3 examples")</li>
                  </ul>
                </Alert>
              )}
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
                  disabled={loading || !prompt.trim() || prompt.length < 10}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                >
                  {loading ? 'Processing...' : 'Execute Prompt'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
      
      {/* Results */}
      {result && <ResultCard result={result} />}
      
      {/* Information */}
      <Paper elevation={1} sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          About Custom Prompts
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body2" paragraph>
          Our Custom Prompt tool gives you direct access to our AI models for any task or question you can imagine.
        </Typography>
        <Typography variant="body2" paragraph>
          You can use this for creative writing, problem-solving, learning, business advice, code generation, and much more.
        </Typography>
        <Typography variant="body2">
          For best results, be specific in your prompts and provide context. The more detailed your prompt, the better the AI can understand what you're looking for.
        </Typography>
      </Paper>
    </Box>
  );
};

export default CustomPrompt;