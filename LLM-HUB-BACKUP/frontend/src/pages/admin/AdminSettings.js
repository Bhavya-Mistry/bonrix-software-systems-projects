import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Divider,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Grid,
  TextField,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Switch,
  Tooltip,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';

// API URL from environment variable
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const AdminSettings = () => {
  const { theme } = useTheme();
  
  // State
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState(null);
  const [formData, setFormData] = useState({
    key: '',
    value: '',
    description: '',
    is_secure: false
  });
  const [showSecureValue, setShowSecureValue] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Fetch settings
  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setError('Authentication token not found');
        setLoading(false);
        return;
      }
      
      // Set auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Fetch settings
      const response = await axios.get(`${API_URL}/admin/settings`);
      
      // Group settings by category
      const groupedSettings = response.data.reduce((acc, setting) => {
        const category = setting.key.split('.')[0];
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(setting);
        return acc;
      }, {});
      
      setSettings(groupedSettings);
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Failed to load platform settings');
    } finally {
      setLoading(false);
    }
  };
  
  // Initial fetch
  useEffect(() => {
    fetchSettings();
  }, []);
  
  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle switch change
  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };
  
  // Handle create dialog open
  const handleCreateDialogOpen = () => {
    setFormData({
      key: '',
      value: '',
      description: '',
      is_secure: false
    });
    setCreateDialogOpen(true);
  };
  
  // Handle edit dialog open
  const handleEditDialogOpen = (setting) => {
    setSelectedSetting(setting);
    setFormData({
      key: setting.key,
      value: setting.is_secure === 1 ? '' : setting.value,
      description: setting.description || '',
      is_secure: setting.is_secure === 1
    });
    setShowSecureValue(false);
    setEditDialogOpen(true);
  };
  
  // Handle create setting
  const handleCreateSetting = async () => {
    try {
      setActionLoading(true);
      
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setError('Authentication token not found');
        setActionLoading(false);
        return;
      }
      
      // Set auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Create form data
      const form = new FormData();
      form.append('key', formData.key);
      form.append('value', formData.value);
      form.append('description', formData.description);
      form.append('is_secure', formData.is_secure);
      
      // Create setting
      await axios.post(`${API_URL}/admin/settings`, form);
      
      // Close dialog
      setCreateDialogOpen(false);
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Setting created successfully',
        severity: 'success'
      });
      
      // Refresh settings
      fetchSettings();
    } catch (err) {
      console.error('Error creating setting:', err);
      setSnackbar({
        open: true,
        message: 'Failed to create setting',
        severity: 'error'
      });
    } finally {
      setActionLoading(false);
    }
  };
  
  // Handle update setting
  const handleUpdateSetting = async () => {
    try {
      setActionLoading(true);
      
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setError('Authentication token not found');
        setActionLoading(false);
        return;
      }
      
      // Set auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Create form data
      const form = new FormData();
      form.append('value', formData.value);
      form.append('description', formData.description);
      
      // Update setting
      await axios.put(`${API_URL}/admin/settings/${selectedSetting.id}`, form);
      
      // Close dialog
      setEditDialogOpen(false);
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Setting updated successfully',
        severity: 'success'
      });
      
      // Refresh settings
      fetchSettings();
    } catch (err) {
      console.error('Error updating setting:', err);
      setSnackbar({
        open: true,
        message: 'Failed to update setting',
        severity: 'error'
      });
    } finally {
      setActionLoading(false);
    }
  };
  
  // Handle close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };
  
  // Get common settings
  const getCommonSettings = () => {
    const commonKeys = [
      'payment.razorpay_key',
      'payment.stripe_key',
      'payment.inr_to_credit_rate',
      'platform.announcement',
      'platform.support_email'
    ];
    
    return Object.values(settings)
      .flat()
      .filter(setting => commonKeys.includes(setting.key));
  };
  
  if (loading && Object.keys(settings).length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Admin Settings
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Configure platform-wide settings
      </Typography>
      
      <Divider sx={{ mb: 4 }} />
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* Quick Settings */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: theme === 'dark' ? '#1e1e1e' : 'white' }}>
        <Typography variant="h6" gutterBottom>
          Quick Settings
        </Typography>
        <Grid container spacing={3}>
          {getCommonSettings().map((setting) => (
            <Grid item xs={12} md={6} key={setting.id}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {setting.key}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  {setting.is_secure === 1 ? (
                    <Typography variant="body1">••••••••••••</Typography>
                  ) : (
                    <Typography variant="body1">{setting.value}</Typography>
                  )}
                  <IconButton
                    size="small"
                    sx={{ ml: 1 }}
                    onClick={() => handleEditDialogOpen(setting)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Box>
                {setting.description && (
                  <Typography variant="caption" color="text.secondary">
                    {setting.description}
                  </Typography>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>
      
      {/* All Settings */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          All Settings
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateDialogOpen}
        >
          Add New Setting
        </Button>
      </Box>
      
      {Object.entries(settings).map(([category, categorySettings]) => (
        <Paper
          key={category}
          sx={{ p: 3, mb: 3, bgcolor: theme === 'dark' ? '#1e1e1e' : 'white' }}
        >
          <Typography variant="h6" gutterBottom sx={{ textTransform: 'capitalize' }}>
            {category}
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={2}>
            {categorySettings.map((setting) => (
              <Grid item xs={12} key={setting.id}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="subtitle2">
                      {setting.key}
                      {setting.is_secure === 1 && (
                        <Tooltip title="Secure Setting">
                          <VisibilityOffIcon
                            fontSize="small"
                            color="action"
                            sx={{ ml: 1, verticalAlign: 'middle' }}
                          />
                        </Tooltip>
                      )}
                    </Typography>
                    {setting.description && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        {setting.description}
                      </Typography>
                    )}
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {setting.is_secure === 1 ? '••••••••••••' : setting.value}
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleEditDialogOpen(setting)}
                  >
                    Edit
                  </Button>
                </Box>
                <Divider sx={{ mt: 2 }} />
              </Grid>
            ))}
          </Grid>
        </Paper>
      ))}
      
      {/* Create Setting Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Setting</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                name="key"
                label="Setting Key"
                value={formData.key}
                onChange={handleInputChange}
                fullWidth
                required
                margin="normal"
                placeholder="e.g., payment.api_key, platform.announcement"
                helperText="Use dot notation for categories (e.g., payment.api_key)"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="value"
                label="Setting Value"
                value={formData.value}
                onChange={handleInputChange}
                fullWidth
                required
                margin="normal"
                type={formData.is_secure && !showSecureValue ? 'password' : 'text'}
                InputProps={formData.is_secure ? {
                  endAdornment: (
                    <IconButton
                      onClick={() => setShowSecureValue(!showSecureValue)}
                      edge="end"
                    >
                      {showSecureValue ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  )
                } : undefined}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                value={formData.description}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={2}
                margin="normal"
                placeholder="Optional description of this setting"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    name="is_secure"
                    checked={formData.is_secure}
                    onChange={handleSwitchChange}
                    color="primary"
                  />
                }
                label="Secure Setting (for API keys, passwords, etc.)"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateSetting}
            variant="contained"
            disabled={actionLoading || !formData.key || !formData.value}
            startIcon={actionLoading ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            Save Setting
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit Setting Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Setting</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Setting Key"
                value={formData.key}
                fullWidth
                margin="normal"
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="value"
                label="Setting Value"
                value={formData.value}
                onChange={handleInputChange}
                fullWidth
                required
                margin="normal"
                type={formData.is_secure && !showSecureValue ? 'password' : 'text'}
                InputProps={formData.is_secure ? {
                  endAdornment: (
                    <IconButton
                      onClick={() => setShowSecureValue(!showSecureValue)}
                      edge="end"
                    >
                      {showSecureValue ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  )
                } : undefined}
                placeholder={formData.is_secure ? "Enter new value or leave blank to keep current" : ""}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                value={formData.description}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={2}
                margin="normal"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleUpdateSetting}
            variant="contained"
            disabled={actionLoading || (!formData.is_secure && !formData.value)}
            startIcon={actionLoading ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            Update Setting
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminSettings;
