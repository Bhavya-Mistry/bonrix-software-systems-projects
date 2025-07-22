import React from 'react';
import StatementHistory from '../components/StatementHistory';
import {
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  Divider,
  Container
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Statement = () => {
  const { user } = useAuth();
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Button
            component={Link}
            to="/wallet"
            startIcon={<ArrowBackIcon />}
            sx={{ 
              mb: 2, 
              borderRadius: '8px',
              letterSpacing: '0.5px',
              fontWeight: 500
            }}
          >
            Back to Wallet
          </Button>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, letterSpacing: '-0.5px' }}>
            Previous Purchases Statement
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ letterSpacing: '0.1px' }}>
            Detailed history of all your credit transactions and usage
          </Typography>
        </Box>
        
        <Box textAlign="right">
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {user?.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ letterSpacing: '0.1px' }}>
            {user?.email}
          </Typography>
          <Typography 
            variant="h5" 
            sx={{ 
              mt: 1, 
              color: 'primary.main', 
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #303f9f 0%, #5c6bc0 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            {user?.credits} Credits
          </Typography>
        </Box>
      </Box>
      
      <Paper elevation={2} sx={{ 
        p: 3, 
        mb: 4, 
        borderRadius: '12px',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
      }}>
        <StatementHistory />
      </Paper>
      
      <Paper elevation={1} sx={{ 
        p: 3, 
        mt: 4, 
        borderRadius: '12px',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '4px',
          background: 'linear-gradient(90deg, #303f9f 0%, #5c6bc0 100%)'
        }
      }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, letterSpacing: '0.1px' }}>
          About Your Statement
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body2" paragraph sx={{ letterSpacing: '0.1px', lineHeight: 1.6 }}>
          This statement provides a comprehensive record of all your credit transactions, including purchases, usage, refunds, and any administrative adjustments.
        </Typography>
        <Typography variant="body2" paragraph sx={{ letterSpacing: '0.1px', lineHeight: 1.6 }}>
          • <strong>Credits</strong>: Amount of credits added to your account
        </Typography>
        <Typography variant="body2" paragraph sx={{ letterSpacing: '0.1px', lineHeight: 1.6 }}>
          • <strong>Debits</strong>: Amount of credits deducted for AI task usage
        </Typography>
        <Typography variant="body2" paragraph sx={{ letterSpacing: '0.1px', lineHeight: 1.6 }}>
          • <strong>Opening/Closing Balance</strong>: Your credit balance before and after each transaction
        </Typography>
        <Typography variant="body2" sx={{ letterSpacing: '0.1px', lineHeight: 1.6 }}>
          You can filter your statement by date range and transaction type, or export it as a CSV file for your records.
        </Typography>
      </Paper>
    </Container>
  );
};

export default Statement;
