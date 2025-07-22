import React, { useState } from 'react';
import {
  Typography,
  Box,
  Paper,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardMedia,
  Chip
} from '@mui/material';
import { Upload as UploadIcon } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useModel } from '../../context/ModelContext';
import ResultCard from '../../components/ResultCard';
import ObjectDetectionResult from '../../components/ObjectDetectionResult';

// API URL from environment variable
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const ObjectDetection = () => {
  const { user, updateUserCredits } = useAuth();
  const { getSelectedModelForTask, getModelDetails } = useModel();
  
  // Get the selected model for this task
  const model = getSelectedModelForTask('object_detection');
  const modelDetails = getModelDetails(model);
  
  // Form state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // Processing state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  
  // Estimated credits
  const [estimatedCredits, setEstimatedCredits] = useState(10);
  
  // File dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setImageFile(acceptedFiles[0]);
        
        // Create preview URL
        const previewUrl = URL.createObjectURL(acceptedFiles[0]);
        setImagePreview(previewUrl);
        
        // Update estimated credits based on file size
        const fileSizeInKB = acceptedFiles[0].size / 1024;
        const baseCredits = 10; // Base credits for object detection
        const sizeMultiplier = Math.min(Math.max(fileSizeInKB / 500, 1), 2); // Cap at 2x
        
        setEstimatedCredits(Math.ceil(baseCredits * sizeMultiplier));
      }
    }
  });
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!imageFile) {
      setError('Please upload an image');
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
      formData.append('image_file', imageFile);
      formData.append('model', model);
      
      // Send request to API
      const response = await axios.post(
        `${API_URL}/api/object-detection/detect`,
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
      console.error('Object detection error:', error);
      setError(error.response?.data?.detail || 'An error occurred while detecting objects. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Clean up preview URL when component unmounts
  React.useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Object Detection
      </Typography>
      
      <Typography variant="body1" paragraph color="text.secondary">
        Upload an image to detect and count objects using AI vision.
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Image Upload */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Upload Image
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
                {imageFile ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                    <Card sx={{ maxWidth: 300, mb: 2 }}>
                      <CardMedia
                        component="img"
                        image={imagePreview}
                        alt="Image preview"
                        sx={{ maxHeight: 200 }}
                      />
                    </Card>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      {imageFile.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {(imageFile.size / 1024).toFixed(1)} KB
                    </Typography>
                    <Button
                      size="small"
                      sx={{ mt: 1 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                    >
                      Remove
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                    <UploadIcon fontSize="large" color="action" sx={{ mb: 1 }} />
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      Drag & drop an image here, or click to select
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Supported formats: JPG, JPEG, PNG, WEBP
                    </Typography>
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
                  disabled={loading || !imageFile}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                >
                  {loading ? 'Detecting...' : 'Detect Objects'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
      
      {/* Results */}
      {result && <ObjectDetectionResult result={result} imagePreview={imagePreview} />}
      
      {/* Information */}
      <Paper elevation={1} sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          About Object Detection
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body2" paragraph>
          Our Object Detection tool uses computer vision AI to identify and count objects in images.
        </Typography>
        <Typography variant="body2" paragraph>
          The system can recognize over 80 different types of common objects, including people, animals, vehicles, and everyday items.
        </Typography>
        <Typography variant="body2">
          After detection, the AI generates a natural language caption describing what was found in the image.
        </Typography>
      </Paper>
    </Box>
  );
};

export default ObjectDetection;
