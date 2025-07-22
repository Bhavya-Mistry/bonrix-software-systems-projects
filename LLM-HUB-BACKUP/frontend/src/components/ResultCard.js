import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Divider,
  Chip,
  IconButton,
  Collapse,
  Grid
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  AccessTime as TimeIcon,
  Token as TokenIcon,
  CreditCard as CreditIcon
} from '@mui/icons-material';

const ResultCard = ({ result }) => {
  const [expanded, setExpanded] = useState(false);
  
  // Handle expand toggle
  const handleExpandClick = () => {
    setExpanded(!expanded);
  };
  
  // Format JSON for display
  const formatJSON = (json) => {
    return JSON.stringify(json, null, 2);
  };
  
  return (
    <Card sx={{ mt: 4, mb: 2 }}>
      <CardHeader
        title={result.task}
        subheader={`Processed with ${result.model}`}
        action={
          <IconButton
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label="show more"
            sx={{
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s'
            }}
          >
            <ExpandMoreIcon />
          </IconButton>
        }
      />
      
      <CardContent>
        {/* Stats row */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={4}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TokenIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {result.estimated_tokens} tokens
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={4}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CreditIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {result.credits_used} credits
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={4}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TimeIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {result.time_taken_sec.toFixed(2)}s
              </Typography>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 2 }} />
        
        {/* Summary */}
        <Typography variant="h6" gutterBottom>
          Summary
        </Typography>
        <Typography variant="body1" paragraph>
          {result.result.summary}
        </Typography>
        {result.task === 'Deep Search' && result.result.structured_data.results && (
          <>
            <Typography variant="h6" gutterBottom>
              Top Dealers
            </Typography>
            <Box sx={{ mt: 2 }}>
              {result.result.structured_data.results.map((dealer, idx) => (
                <Box key={idx} sx={{ mb: 2 }}>
                  <Typography variant="subtitle1">
                    {dealer.website ? (
                      <a href={dealer.website} target="_blank" rel="noopener noreferrer">
                        {dealer.name}
                      </a>
                    ) : (
                      dealer.name
                    )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Address: {dealer.address}
                  </Typography>
                  {dealer.phone && (
                    <Typography variant="body2" color="text.secondary">
                      Phone: {dealer.phone}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          </>
        )}
        
        {/* Task-specific content based on task type */}
        {result.task === 'Resume Analysis' && (
          <Box sx={{ mt: 2 }}>
            {/* Fit Score with visual indicator */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Fit Score
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box
                  sx={{
                    width: '100%',
                    bgcolor: 'grey.300',
                    borderRadius: 5,
                    height: 10,
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <Box
                    sx={{
                      width: `${result.result.structured_data.fit_score}%`,
                      bgcolor: (theme) => {
                        const score = result.result.structured_data.fit_score;
                        if (score >= 80) return 'success.main';
                        if (score >= 60) return 'warning.main';
                        return 'error.main';
                      },
                      height: '100%',
                      borderRadius: 5,
                      transition: 'width 1s ease-in-out'
                    }}
                  />
                </Box>
                <Typography variant="h5" sx={{ ml: 2, fontWeight: 'bold' }}>
                  {result.result.structured_data.fit_score}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {result.result.structured_data.fit_score >= 80 ? 'Strong match' : 
                 result.result.structured_data.fit_score >= 60 ? 'Moderate match' : 'Low match'}
              </Typography>
            </Box>
            
            <Grid container spacing={3}>
              {/* Strengths */}
              <Grid item xs={12} md={6}>
                <Box sx={{ bgcolor: 'success.light', p: 2, borderRadius: 2, height: '100%' }}>
                  <Typography variant="h6" gutterBottom color="success.dark">
                    Strengths
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, mb: 0 }}>
                    {result.result.structured_data.strengths.map((strength, index) => (
                      <Typography component="li" key={index} sx={{ mb: 1 }}>
                        {strength}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              </Grid>
              
              {/* Red Flags */}
              <Grid item xs={12} md={6}>
                <Box sx={{ bgcolor: 'error.light', p: 2, borderRadius: 2, height: '100%' }}>
                  <Typography variant="h6" gutterBottom color="error.dark">
                    Areas of Concern
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, mb: 0 }}>
                    {result.result.structured_data.red_flags.map((flag, index) => (
                      <Typography component="li" key={index} sx={{ mb: 1 }}>
                        {flag}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              </Grid>
            </Grid>
            
            {/* Final Verdict */}
            <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" gutterBottom>
                Final Verdict
              </Typography>
              <Typography variant="body1">
                {result.result.structured_data.final_verdict}
              </Typography>
            </Box>
            
            {/* Job Profile */}
            {result.job_profile && (
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Analyzed for: 
                </Typography>
                <Chip 
                  label={result.job_profile} 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                  sx={{ ml: 1 }}
                />
              </Box>
            )}
          </Box>
        )}
        
        {result.task === 'Object Detection' && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Objects Detected:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {Object.entries(result.result.structured_data.counts).map(([object, count]) => (
                <Chip 
                  key={object} 
                  label={`${object}: ${count}`} 
                  variant="outlined" 
                  size="small" 
                />
              ))}
            </Box>
          </Box>
        )}
        
        {result.task === 'Invoice Extraction' && (
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">GSTIN:</Typography>
                <Typography variant="body2" gutterBottom>
                  {result.result.structured_data.gstin}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Invoice Number:</Typography>
                <Typography variant="body2" gutterBottom>
                  {result.result.structured_data.invoice_no}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Date:</Typography>
                <Typography variant="body2" gutterBottom>
                  {result.result.structured_data.date}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Amount:</Typography>
                <Typography variant="body2" gutterBottom>
                  {result.result.structured_data.amount}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Vendor:</Typography>
                <Typography variant="body2" gutterBottom>
                  {result.result.structured_data.vendor}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}
        
        {result.task === 'Text Summarization' && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Key Points:
            </Typography>
            <Box component="ul">
              {result.result.structured_data.key_points.map((point, index) => (
                <Typography component="li" key={index}>
                  {point}
                </Typography>
              ))}
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Compression ratio: {result.result.structured_data.compression_ratio.toFixed(1)}%
            </Typography>
          </Box>
        )}
        
        {result.task === 'Sentiment Analysis' && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Overall Sentiment: 
              <Chip 
                label={result.result.structured_data.overall_sentiment} 
                color={
                  result.result.structured_data.overall_sentiment === 'Positive' ? 'success' :
                  result.result.structured_data.overall_sentiment === 'Negative' ? 'error' : 'default'
                }
                size="small"
                sx={{ ml: 1 }}
              />
            </Typography>
            
            <Typography variant="subtitle2" gutterBottom>
              Sentiment Breakdown:
            </Typography>
            <Grid container spacing={1} sx={{ mb: 2 }}>
              <Grid item xs={4}>
                <Typography variant="body2" color="success.main">
                  Positive: {result.result.structured_data.sentiment_breakdown.positive}%
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  Neutral: {result.result.structured_data.sentiment_breakdown.neutral}%
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2" color="error.main">
                  Negative: {result.result.structured_data.sentiment_breakdown.negative}%
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}
        
        {/* JSON Viewer (Collapsed by default) */}
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" gutterBottom>
            Raw JSON Response
          </Typography>
          <Box
            className="json-viewer"
            component="pre"
            sx={{
              fontSize: '0.8rem',
              overflowX: 'auto',
              bgcolor: (theme) => 
                theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'
            }}
          >
            {formatJSON(result)}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default ResultCard;
