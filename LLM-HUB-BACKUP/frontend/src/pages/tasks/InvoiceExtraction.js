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

// API URL from environment variable
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const InvoiceExtraction = () => {
  const { user, updateUserCredits } = useAuth();
  const { getSelectedModelForTask, getModelDetails } = useModel();
  
  // Get the selected model for this task
  const model = getSelectedModelForTask('invoice_extraction');
  const modelDetails = getModelDetails(model);
  
  // Form state
  const [invoiceFile, setInvoiceFile] = useState(null);
  const [invoicePreview, setInvoicePreview] = useState(null);
  
  // Processing state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  
  // Estimated credits
  const [estimatedCredits, setEstimatedCredits] = useState(12);
  
  // File dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setInvoiceFile(acceptedFiles[0]);
        
        // Create preview URL for images
        if (acceptedFiles[0].type.startsWith('image/')) {
          const previewUrl = URL.createObjectURL(acceptedFiles[0]);
          setInvoicePreview(previewUrl);
        } else {
          setInvoicePreview(null);
        }
        
        // Update estimated credits based on file size
        const fileSizeInKB = acceptedFiles[0].size / 1024;
        const baseCredits = 12; // Base credits for invoice extraction
        const sizeMultiplier = Math.min(Math.max(fileSizeInKB / 500, 1), 2); // Cap at 2x
        
        setEstimatedCredits(Math.ceil(baseCredits * sizeMultiplier));
      }
    }
  });
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!invoiceFile) {
      setError('Please upload an invoice file');
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
      formData.append('file', invoiceFile);
      formData.append('model', model);
      
      // Send request to API
      const response = await axios.post(
        `${API_URL}/api/invoice-extraction/extract`,
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
      console.error('Invoice extraction error:', error);
      setError(error.response?.data?.detail || 'An error occurred while extracting invoice data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Clean up preview URL when component unmounts
  React.useEffect(() => {
    return () => {
      if (invoicePreview) {
        URL.revokeObjectURL(invoicePreview);
      }
    };
  }, [invoicePreview]);
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Invoice Extraction
      </Typography>
      
      <Typography variant="body1" paragraph color="text.secondary">
        Upload an invoice image or PDF to extract structured data using OCR and AI.
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Model & Cost Section (ResumeAnalysis style) */}
            <Grid item xs={12}>
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
                          label={modelDetails?.provider || 'Gemini'} 
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
            </Grid>

            {/* Invoice Upload */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Upload Invoice
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
                {invoiceFile ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                    {invoicePreview && (
                      <Card sx={{ maxWidth: 300, mb: 2 }}>
                        <CardMedia
                          component="img"
                          image={invoicePreview}
                          alt="Invoice preview"
                          sx={{ maxHeight: 200 }}
                        />
                      </Card>
                    )}
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      {invoiceFile.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {(invoiceFile.size / 1024).toFixed(1)} KB
                    </Typography>
                    <Button
                      size="small"
                      sx={{ mt: 1 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setInvoiceFile(null);
                        setInvoicePreview(null);
                      }}
                    >
                      Remove
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                    <UploadIcon fontSize="large" color="action" sx={{ mb: 1 }} />
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      Drag & drop an invoice here, or click to select
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Supported formats: JPG, JPEG, PNG, PDF
                    </Typography>
                  </Box>
                )}
              </Box>
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
                  disabled={loading || !invoiceFile}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                >
                  {loading ? 'Extracting...' : 'Extract Data'}
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
          About Invoice Extraction
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body2" paragraph>
          Our Invoice Extraction tool uses OCR (Optical Character Recognition) and AI to extract structured data from invoice images and PDFs.
        </Typography>
        <Typography variant="body2" paragraph>
          The system can identify and extract key information such as GSTIN, invoice number, date, amount, vendor name, and other relevant fields.
        </Typography>
        <Typography variant="body2">
          This helps automate data entry and streamline accounting processes by eliminating manual data extraction.
        </Typography>
      </Paper>
    </Box>
  );
};

export default InvoiceExtraction;
