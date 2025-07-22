import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  IconButton,
  InputAdornment,
  Link
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';

// API URL from environment variable
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const AdminLogin = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    // Clear previous errors
    setError('');
    setLoading(true);
    
    try {
      // For OAuth2 token endpoint, we still need to use URLSearchParams
      // as it expects x-www-form-urlencoded format
      const response = await axios.post(`${API_URL}/admin/login`, 
        new URLSearchParams({
          'username': email,
          'password': password
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      
      const { access_token } = response.data;
      
      // Save token to localStorage with admin flag
      localStorage.setItem('admin_token', access_token);
      
      // Redirect to admin dashboard
      navigate('/admin-dashboard');
    } catch (err) {
      console.error('Admin login error:', err);
      // Ensure error is always a string
      let errorMessage = 'Login failed. Please check your credentials or admin permissions.';
      
      if (err.response?.data?.detail) {
        // If the error is an object, convert it to a string
        if (typeof err.response.data.detail === 'object') {
          errorMessage = JSON.stringify(err.response.data.detail);
        } else {
          errorMessage = err.response.data.detail;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            borderRadius: 2,
            bgcolor: theme === 'dark' ? '#1e1e1e' : 'white'
          }}
        >
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <AdminIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography component="h1" variant="h4" sx={{ fontWeight: 'bold' }}>
              Windsurf Admin
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Platform Management
            </Typography>
          </Box>
          
          <Typography component="h2" variant="h5" sx={{ mb: 2 }}>
            Admin Sign In
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Admin Email"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5, bgcolor: 'primary.dark' }}
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In as Admin'}
            </Button>
            
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Link href="/" variant="body2">
                Return to User Login
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default AdminLogin;
