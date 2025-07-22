import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Link,
  Paper,
  Alert,
  IconButton,
  InputAdornment,
  Divider
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  AdminPanelSettings as AdminPanelSettingsIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Login = () => {
  const { login, error } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!email || !password) {
      setFormError('Please fill in all fields');
      return;
    }
    
    // Clear previous errors
    setFormError('');
    setLoading(true);
    
    // Attempt login
    const success = await login(email, password);
    
    setLoading(false);
    
    if (success) {
      navigate('/');
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
            <Typography component="h1" variant="h4" sx={{ fontWeight: 'bold' }}>
              AI-TOOLKIT
            </Typography>

          </Box>
          
          <Typography component="h2" variant="h5" sx={{ mb: 2 }}>
            Sign In
          </Typography>
          
          {(error || formError) && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError || error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
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
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
            
            <Grid container justifyContent="center">
              <Grid item>
                <Link component={RouterLink} to="/register" variant="body2">
                  Don't have an account? Sign Up
                </Link>
              </Grid>
            </Grid>
            
            <Divider sx={{ mt: 3, mb: 2 }} />
            
            <Box sx={{ textAlign: 'center' }}>
              <Button
                component={RouterLink}
                to="/admin-login"
                variant="outlined"
                size="small"
                startIcon={<AdminPanelSettingsIcon />}
                sx={{ textTransform: 'none' }}
              >
                Admin Login
              </Button>
            </Box>
          </Box>
          
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button
              size="small"
              onClick={toggleTheme}
              sx={{ textTransform: 'none' }}
            >
              Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
