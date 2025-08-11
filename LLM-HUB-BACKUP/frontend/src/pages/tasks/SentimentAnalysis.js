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
  Chip
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useModel } from '../../context/ModelContext';
import ResultCard from '../../components/ResultCard';

// API URL from environment variable
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const SentimentAnalysis = () => {
  const { user, updateUserCredits } = useAuth();
  const { getSelectedModelForTask, getModelDetails } = useModel();
  
  // Get the selected model for this task
  const model = getSelectedModelForTask('sentiment_analysis');
  const modelDetails = getModelDetails(model);
  
  // Form state
  const [reviews, setReviews] = useState('');
  
  // Processing state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  
  // Estimated credits
  const [estimatedCredits, setEstimatedCredits] = useState(5);
  
  // Handle reviews change
  const handleReviewsChange = (e) => {
    setReviews(e.target.value);
    
    // Update estimated credits based on text length
    const textLength = e.target.value.length;
    const baseCredits = 5; // Base credits for sentiment analysis
    const textMultiplier = Math.min(Math.max(textLength / 1000, 1), 5); // Cap at 5x
    
    setEstimatedCredits(Math.ceil(baseCredits * textMultiplier));
  };
  
  // Calculate review stats
  const reviewCount = reviews.trim() ? reviews.trim().split(/\n+/).filter(line => line.trim().length > 0).length : 0;
  const charCount = reviews.length;
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!reviews.trim()) {
      setError('Please enter some reviews to analyze');
      return;
    }
    
    if (reviews.length < 50) {
      setError('Text is too short. Please enter at least 50 characters.');
      return;
    }
    
    // Check if user has enough credits
    if (user.credits < estimatedCredits) {
      setError(`You don't have enough credits. This task requires approximately ${estimatedCredits} credits.`);
      return;
    }
    
    // Clear previous errors and results
    setError('');
    setResult(null);
    setLoading(true);
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append('reviews', reviews);
      formData.append('model', model);
      
      // Send request to API
      const response = await axios.post(
        `${API_URL}/api/sentiment-analysis/analyze`,
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
      console.error('Sentiment analysis error:', error);
      setError(error.response?.data?.detail || 'An error occurred while analyzing sentiment. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Example reviews for the user to try
  const exampleReviews = `The product exceeded my expectations! The quality is amazing and it arrived earlier than expected.

This restaurant was a huge disappointment. The food was cold and the service was terrible. I won't be coming back.

The hotel was okay. Nothing special but clean and comfortable enough for the price.

I've been using this app for a month now and it's been quite helpful, though there are some bugs that need to be fixed.

Absolutely love this device! It's changed my life and I use it every day. Best purchase I've made this year.`;

  // Handle example button click
  const handleUseExample = () => {
    setReviews(exampleReviews);
    
    // Update estimated credits
    const textLength = exampleReviews.length;
    const baseCredits = 5;
    const textMultiplier = Math.min(Math.max(textLength / 1000, 1), 5);
    
    setEstimatedCredits(Math.ceil(baseCredits * textMultiplier));
  };
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Sentiment Analysis
      </Typography>
      
      <Typography variant="body1" paragraph color="text.secondary">
        Analyze sentiment in customer reviews and feedback to understand overall sentiment.
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3, color: 'text.primary' }}>
          {error}
        </Alert>
      )}
      
      {/* Model & Cost Section - Match Text Summarization Style */}
      <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 3, backgroundColor: 'background.paper' }}>
        <Box sx={{ display: 'flex', gap: 3 }}>
          {/* AI Model */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
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
                backgroundColor: 'background.paper',
                boxShadow: 'none',
                border: `2px solid`,
                borderColor: 'divider',
                mb: 0
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body1" sx={{ fontWeight: 500, color: 'text.primary' }}>
                  {modelDetails?.name || model}
                </Typography>
                <Chip
                  label={modelDetails?.provider || 'AI'}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: 600, color: 'text.primary' }}
                />
              </Box>
            </Paper>
          </Box>
          {/* Estimated Credits */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
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
                maxHeight: '56px',
                borderRadius: 2,
                backgroundColor: 'background.paper',
                boxShadow: 'none',
                border: `2px solid`,
                borderColor: 'divider',
                mb: 0
              }}
            >
              <Typography variant="h6" color="primary" sx={{ fontWeight: 700, fontSize: 22, color: 'text.primary' }}>
                {estimatedCredits} credits
              </Typography>
            </Paper>
          </Box>
        </Box>
      </Paper>
      <Paper elevation={2} sx={{ p: 3, mb: 4, backgroundColor: 'background.paper' }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Reviews Input */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" sx={{ color: 'text.primary' }}>
                  Reviews to Analyze
                </Typography>
                
                <Button 
                  size="small" 
                  variant="outlined" 
                  onClick={handleUseExample}
                  disabled={loading}
                  sx={{ color: 'text.primary' }}
                >
                  Use Example
                </Button>
              </Box>
              
              <Box
                sx={{
                  border: '2px dashed',
                  borderColor: 'divider',
                  borderRadius: 3,
                  backgroundColor: 'background.paper',
                  p: 5,
                  mb: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 220,
                  transition: 'border-color 0.3s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1, color: 'text.primary' }}>
                  Paste or type your reviews here
                </Typography>
                <TextField
                  multiline
                  minRows={8}
                  maxRows={16}
                  fullWidth
                  value={reviews}
                  onChange={handleReviewsChange}
                  variant="standard"
                  placeholder="Paste your reviews here, one per line..."
                  InputProps={{
                    disableUnderline: true,
                    style: { fontSize: 16, lineHeight: 1.5, background: 'transparent', color: 'text.primary' }
                  }}
                  sx={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    width: '100%',
                    mb: 0,
                    mt: 0,
                    color: 'text.primary'
                  }}
                  disabled={loading}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mt: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ color: 'text.primary' }}>
                    {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}, {charCount} characters
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip 
                    label="Bulk Analysis" 
                    size="small" 
                    color="primary" 
                    variant={reviewCount > 1 ? "filled" : "outlined"}
                    sx={{ color: 'text.primary' }}
                  />
                  <Chip 
                    label="Single Review" 
                    size="small" 
                    color="primary" 
                    variant={reviewCount === 1 ? "filled" : "outlined"}
                    sx={{ color: 'text.primary' }}
                  />
                </Box>
              </Box>
            </Grid>
            
            {/* Submit Button */}
            <Grid item xs={12}>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ color: 'text.primary' }}>
                  Your balance: {user?.credits.toFixed(0)} credits
                </Typography>
                
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading || !reviews.trim() || reviews.length < 50}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                  sx={{ color: 'text.primary' }}
                >
                  {loading ? 'Analyzing...' : 'Analyze Sentiment'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
      
      {/* Results */}
      {result && <ResultCard result={result} />}
      
      {/* Information */}
      <Paper elevation={1} sx={{ p: 3, mt: 4, backgroundColor: 'background.paper' }}>
        <Typography variant="h6" gutterBottom sx={{ color: 'text.primary' }}>
          About Sentiment Analysis
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body2" paragraph sx={{ color: 'text.primary' }}>
          Our Sentiment Analysis tool uses AI to analyze the sentiment in customer reviews, social media posts, survey responses, and other text feedback.
        </Typography>
        <Typography variant="body2" paragraph>
          The system categorizes sentiment as positive, neutral, or negative, and provides an overall sentiment breakdown with percentages.
        </Typography>
        <Typography variant="body2">
          This helps businesses understand customer sentiment, identify areas for improvement, and track sentiment trends over time.
        </Typography>
      </Paper>
    </Box>
  );
};

export default SentimentAnalysis;