import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// Create context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// API URL from environment variable
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // Check if token is expired
          const decodedToken = jwtDecode(token);
          const currentTime = Date.now() / 1000;
          
          if (decodedToken.exp < currentTime) {
            // Token is expired, logout
            logout();
            return;
          }
          
          // Set auth header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Fetch user profile
          const response = await axios.get(`${API_URL}/users/me`);
          
          setUser(response.data);
          setIsAuthenticated(true);
        } catch (err) {
          console.error('Auth initialization error:', err);
          logout();
        }
      }
      
      setLoading(false);
    };
    
    initAuth();
  }, []);
  
  // Login function
  const login = async (email, password) => {
    try {
      setError(null);
      
      // For OAuth2 token endpoint, we still need to use URLSearchParams
      // as it expects x-www-form-urlencoded format
      const response = await axios.post(`${API_URL}/token`, 
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
      
      // Save token to localStorage
      localStorage.setItem('token', access_token);
      
      // Set auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      // Fetch user profile
      const userResponse = await axios.get(`${API_URL}/users/me`);
      
      setUser(userResponse.data);
      setIsAuthenticated(true);
      
      return true;
    } catch (err) {
      console.error('Login error:', err);
      // Ensure error is always a string
      let errorMessage = 'Login failed. Please check your credentials.';
      
      if (err.response?.data?.detail) {
        // If the error is an object, convert it to a string
        if (typeof err.response.data.detail === 'object') {
          errorMessage = JSON.stringify(err.response.data.detail);
        } else {
          errorMessage = err.response.data.detail;
        }
      }
      
      setError(errorMessage);
      return false;
    }
  };
  
  // Register function
  const register = async (name, email, password) => {
    try {
      setError(null);
      
      // Create FormData object for multipart/form-data
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('password', password);
      
      // Register user
      await axios.post(`${API_URL}/users/register`, formData);
      
      // Login after registration
      return await login(email, password);
    } catch (err) {
      console.error('Registration error:', err);
      // Ensure error is always a string
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err.response?.data?.detail) {
        // If the error is an object, convert it to a string
        if (typeof err.response.data.detail === 'object') {
          errorMessage = JSON.stringify(err.response.data.detail);
        } else {
          errorMessage = err.response.data.detail;
        }
      }
      
      setError(errorMessage);
      return false;
    }
  };
  
  // Logout function
  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    
    // Remove auth header
    delete axios.defaults.headers.common['Authorization'];
    
    // Reset state
    setUser(null);
    setIsAuthenticated(false);
  };
  
  // Update user profile (name, email, etc.)
  const updateProfile = async (profileData) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication token not found');

      // Set auth header (already set at login, but ensure here)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Create form data to support multipart/form-data backend expectation
      const formData = new FormData();
      Object.entries(profileData).forEach(([key, value]) => {
        formData.append(key, value);
      });

      // Send request to update profile
      const response = await axios.put(`${API_URL}/users/me`, formData);

      // Update local user state with fresh data from backend
      setUser(response.data);
      return { success: true };
    } catch (err) {
      console.error('Update profile error:', err);
      let errorMessage = err.response?.data?.detail || 'Failed to update profile.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Update user credits
  const updateUserCredits = (newCredits) => {
    if (user) {
      setUser({
        ...user,
        credits: newCredits
      });
    }
  };
  
  // Context value
  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    updateUserCredits
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
