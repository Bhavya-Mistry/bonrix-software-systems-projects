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
  LinearProgress,
  Chip
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useModel } from '../../context/ModelContext';
import ResultCard from '../../components/ResultCard';

// API URL from environment variable
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const TextSummarization = () => {
  const { user, updateUserCredits } = useAuth();
  const { getSelectedModelForTask, getModelDetails } = useModel();
  
  // Get the selected model for this task
  const model = getSelectedModelForTask('text_summarization');
  const modelDetails = getModelDetails(model);
  
  // Form state
  const [text, setText] = useState('');
  
  // Processing state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  
  // Estimated credits
  const [estimatedCredits, setEstimatedCredits] = useState(5);
  
  // Handle text change
  const handleTextChange = (e) => {
    setText(e.target.value);
    
    // Update estimated credits based on text length and model
    const textLength = e.target.value.length;
    
    // Get model rate from the selected model
    const modelRate = modelDetails?.rate || 10; // Default to 10 if rate not available
    
    // Base tokens for text summarization (should match backend TASK_BASE_TOKENS)
    const baseTokens = 500;
    
    // Calculate tokens based on text length (similar to backend calculation)
    // Rough estimate: 1 token ≈ 4 characters
    const inputTokens = textLength / 4;
    
    // For text summarization, we add the input tokens to the base tokens
    const estimatedTokens = baseTokens + inputTokens;
    
    // Calculate credits: (tokens / 1000) * model rate
    const estimatedCost = Math.ceil((estimatedTokens / 1000) * modelRate);
    
    setEstimatedCredits(estimatedCost);
  };
  
  // Calculate text stats
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!text.trim()) {
      setError('Please enter some text to summarize');
      return;
    }
    
    if (text.length < 100) {
      setError('Text is too short. Please enter at least 100 characters.');
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
      formData.append('text', text);
      formData.append('model', model);
      
      // Send request to API
      const response = await axios.post(
        `${API_URL}/api/text-summarization/summarize`,
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
      console.error('Text summarization error:', error);
      setError(error.response?.data?.detail || 'An error occurred while summarizing the text. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Text Summarization
      </Typography>
      
      <Typography variant="body1" paragraph color="text.secondary">
        Enter long-form text to generate a concise summary using AI.
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Text Input */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Text to Summarize
              </Typography>
              
              <TextField
                multiline
                rows={10}
                fullWidth
                variant="outlined"
                placeholder="Paste your text here..."
                value={text}
                onChange={handleTextChange}
                disabled={loading}
              />
              
              <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  {wordCount} words, {charCount} characters
                </Typography>
                
                {text.length > 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '200px' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ mr: 1, minWidth: '80px' }}>
                      Ideal length:
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(text.length / 2000 * 100, 100)}
                      color={text.length < 100 ? 'error' : text.length > 10000 ? 'warning' : 'success'}
                      sx={{ width: '100%' }}
                    />
                  </Box>
                )}
              </Box>
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
                  disabled={loading || !text.trim() || text.length < 100}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                >
                  {loading ? 'Summarizing...' : 'Summarize Text'}
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
          About Text Summarization
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body2" paragraph>
          Our Text Summarization tool uses AI to generate concise summaries of long-form text while preserving the key points and main ideas.
        </Typography>
        <Typography variant="body2" paragraph>
          This is useful for quickly understanding articles, reports, research papers, and other lengthy documents without having to read the entire text.
        </Typography>
        <Typography variant="body2">
          The summary includes the main points of the text, presented in a clear and concise format that captures the essence of the original content.
        </Typography>
      </Paper>
    </Box>
  );
};

export default TextSummarization;
