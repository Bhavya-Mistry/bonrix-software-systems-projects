import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Button,
  TextField,
  Grid,
  Divider,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  
  // Form state
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    // Add more fields as needed
  });

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Toggle edit mode
  const toggleEdit = () => {
    if (editing) {
      // Reset form data if canceling
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        // Reset other fields
      });
    }
    setEditing(!editing);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // This would be an API call to update the user profile
      // For now, we'll just simulate a successful update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setNotification({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success'
      });
      setEditing(false);
    } catch (error) {
      setNotification({
        open: true,
        message: 'Failed to update profile',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Close notification
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Calculate initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Box sx={{ py: 4, px: { xs: 2, md: 4 } }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        User Profile
      </Typography>
      
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'center', md: 'flex-start' }, mb: 4 }}>
          <Avatar 
            sx={{ 
              width: 120, 
              height: 120, 
              fontSize: '3rem',
              bgcolor: 'primary.main',
              mb: { xs: 2, md: 0 },
              mr: { md: 4 }
            }}
          >
            {getInitials(user?.name)}
          </Avatar>
          
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              {user?.name}
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              {user?.email}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Member since: {new Date().toLocaleDateString()}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1">
                Available Credits: <strong>{user?.credits}</strong>
              </Typography>
            </Box>
          </Box>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" component="h3" gutterBottom>
                Personal Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!editing}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!editing || true} // Email is typically not editable
                required
              />
            </Grid>
            
            {/* Add more fields as needed */}
            
            <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              {editing ? (
                <>
                  <Button 
                    variant="outlined" 
                    color="secondary" 
                    onClick={toggleEdit}
                    startIcon={<CancelIcon />}
                    sx={{ mr: 2 }}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    type="submit"
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    disabled={loading}
                  >
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button 
                  variant="outlined" 
                  color="primary" 
                  onClick={toggleEdit}
                  startIcon={<EditIcon />}
                >
                  Edit Profile
                </Button>
              )}
            </Grid>
          </Grid>
        </form>
      </Paper>
      
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile;
