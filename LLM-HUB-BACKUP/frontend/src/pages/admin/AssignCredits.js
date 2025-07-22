import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Box,
  Typography,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import axios from 'axios';

// API URL from environment variable
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

/**
 * AssignCredits component - A standalone component for assigning credits to users
 * This component is designed to be simple and reliable, avoiding complex state management
 */
const AssignCredits = ({ userId, userName, userCredits, onSuccess, disabled }) => {
  // Component state
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle opening the dialog
  const handleOpen = () => {
    setOpen(true);
    setAmount('');
    setError(null);
  };

  // Handle closing the dialog
  const handleClose = () => {
    setOpen(false);
    setAmount('');
    setError(null);
  };

  // Handle assigning credits
  const handleAssignCredits = async () => {
    try {
      // Validate input
      if (!amount || parseFloat(amount) <= 0) {
        setError('Please enter a valid amount greater than zero');
        return;
      }

      // Start loading
      setLoading(true);
      
      // Get auth token
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }
      
      // Set authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Create form data
      const formData = new FormData();
      formData.append('amount', amount);
      
      // Make API call
      console.log(`Assigning ${amount} credits to user ID: ${userId}`);
      const response = await axios.post(`${API_URL}/admin/users/${userId}/assign-credits`, formData);
      
      // Handle success
      console.log('Credits assigned successfully:', response.data);
      
      // Close dialog
      setOpen(false);
      
      // Call success callback if provided
      if (typeof onSuccess === 'function') {
        onSuccess();
      }
    } catch (err) {
      console.error('Error assigning credits:', err);
      setError(err.response?.data?.detail || 'Error assigning credits');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Button to open the dialog */}
      <Button
        variant="contained"
        color="success"
        startIcon={<AddIcon />}
        onClick={handleOpen}
        disabled={disabled || !userId}
        size="small"
      >
        Assign Credits
      </Button>

      {/* Dialog for assigning credits */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <AddIcon sx={{ mr: 1 }} />
            Assign Credits
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Assign additional credits to {userName || 'user'}
          </DialogContentText>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Current Balance: <strong>{typeof userCredits === 'number' ? userCredits : 0}</strong> credits
            </Typography>
          </Box>
          <TextField
            autoFocus
            margin="dense"
            label="Credits to Assign"
            type="number"
            fullWidth
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            InputProps={{
              inputProps: { min: 0.1, step: 0.1 },
              startAdornment: <InputAdornment position="start">+</InputAdornment>,
            }}
            helperText="Enter the amount of credits to add to the user's account"
            error={!!error}
          />
          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleAssignCredits} color="success" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Assign Credits'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AssignCredits;
