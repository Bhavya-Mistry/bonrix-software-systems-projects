import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Switch,
  FormControlLabel,
  Divider,
  Grid,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useModel } from '../context/ModelContext';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { models, getModelDetails, getSelectedModelForTask, setSelectedModelForTask } = useModel();
  
  // Flatten models for display in select dropdown
  const flattenedModels = Object.entries(models).reduce((acc, [provider, providerModels]) => {
    return [...acc, ...providerModels.map(model => ({...model, provider}))];
  }, []);
  
  // Settings state
  const [settings, setSettings] = useState({
    emailNotifications: true,
    defaultModel: getSelectedModelForTask('custom_prompt'),
    autoSaveInterval: 5,
    showCreditWarnings: true
  });
  
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Handle settings change
  const handleSettingChange = (setting, value) => {
    setSettings({
      ...settings,
      [setting]: value
    });
    
    // If changing the default model, update the context
    if (setting === 'defaultModel') {
      setSelectedModelForTask('custom_prompt', value);
    }
    
    // Show notification
    setNotification({
      open: true,
      message: 'Setting updated successfully',
      severity: 'success'
    });
  };
  
  // Close notification
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };
  
  return (
    <Box sx={{ py: 4, px: { xs: 2, md: 4 } }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        User Settings
      </Typography>
      
      <Grid container spacing={3}>
        {/* Appearance Settings */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Appearance
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <List>
              <ListItem>
                <ListItemText 
                  primary="Dark Mode" 
                  secondary="Toggle between light and dark theme"
                />
                <ListItemSecondaryAction>
                  <Switch 
                    edge="end"
                    checked={theme === 'dark'}
                    onChange={toggleTheme}
                    color="primary"
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </Paper>
        </Grid>
        
        {/* Model Settings */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" component="h2" gutterBottom>
              AI Model Preferences
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="default-model-label">Default AI Model</InputLabel>
              <Select
                labelId="default-model-label"
                id="default-model"
                value={settings.defaultModel}
                label="Default AI Model"
                onChange={(e) => handleSettingChange('defaultModel', e.target.value)}
              >
                {flattenedModels.map((model) => (
                  <MenuItem key={model.id} value={model.id}>
                    {model.name} ({model.provider})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Your default model will be pre-selected for all AI tasks.
            </Typography>
          </Paper>
        </Grid>
        
        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Notifications
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <List>
              <ListItem>
                <ListItemText 
                  primary="Email Notifications" 
                  secondary="Receive email updates about your account and tasks"
                />
                <ListItemSecondaryAction>
                  <Switch 
                    edge="end"
                    checked={settings.emailNotifications}
                    onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                    color="primary"
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <ListItem>
                <ListItemText 
                  primary="Credit Warnings" 
                  secondary="Show warnings when credits are running low"
                />
                <ListItemSecondaryAction>
                  <Switch 
                    edge="end"
                    checked={settings.showCreditWarnings}
                    onChange={(e) => handleSettingChange('showCreditWarnings', e.target.checked)}
                    color="primary"
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </Paper>
        </Grid>
        
        {/* Application Settings */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Application
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <TextField
                label="Auto-save Interval (minutes)"
                type="number"
                value={settings.autoSaveInterval}
                onChange={(e) => handleSettingChange('autoSaveInterval', parseInt(e.target.value))}
                InputProps={{ inputProps: { min: 1, max: 60 } }}
              />
            </FormControl>
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Set how often your work is automatically saved.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;
