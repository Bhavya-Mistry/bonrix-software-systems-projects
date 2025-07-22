import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Chip,
  Grid,
  Card,
  CardMedia
} from '@mui/material';

const ObjectDetectionResult = ({ result, imagePreview }) => {
  // Extract data from the result
  const summary = result.result.summary;
  const objects = result.result.structured_data.objects || [];
  const counts = result.result.structured_data.counts || {};
  
  // Format counts for display
  const countItems = Object.entries(counts).map(([objectClass, count]) => (
    <Chip 
      key={objectClass}
      label={`${objectClass}: ${count}`}
      color="primary"
      variant="outlined"
      sx={{ m: 0.5 }}
    />
  ));
  
  return (
    <Box sx={{ mt: 4 }}>
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Object Detection
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Processed with {result.model}
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          {/* Detection results */}
          <Grid item xs={12}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Summary
              </Typography>
              <Typography variant="body1" paragraph>
                {summary}
              </Typography>
              
              <Typography variant="h6" gutterBottom>
                Objects Detected:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 2 }}>
                {countItems.length > 0 ? countItems : (
                  <Typography variant="body2" color="text.secondary">
                    No objects detected
                  </Typography>
                )}
              </Box>
              
              {/* Stats */}
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                <Chip 
                  label={`${result.estimated_tokens} tokens`}
                  size="small"
                  color="default"
                  variant="outlined"
                />
                <Chip 
                  label={`${result.credits_used.toFixed(3)} credits`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
                <Chip 
                  label={`${result.time_taken_sec.toFixed(2)}s`}
                  size="small"
                  color="default"
                  variant="outlined"
                />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ObjectDetectionResult;
