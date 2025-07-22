import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Divider,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  Alert
} from '@mui/material';
import {
  People as PeopleIcon,
  CreditCard as CreditCardIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

// API URL from environment variable
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const DashboardOverview = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total_users: 0,
    total_credits_purchased: 0,
    total_revenue_inr: 0,
    total_revenue_usd: 0,
    active_users_24h: 0,
    active_users_7d: 0,
    top_models: []
  });

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        if (!token) {
          setError('Authentication token not found');
          setLoading(false);
          return;
        }

        // Set auth header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Fetch dashboard stats
        const response = await axios.get(`${API_URL}/admin/dashboard/stats`);
        setStats(response.data);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Prepare chart data
  const modelUsageData = stats.top_models.map(model => ({
    name: model.model,
    value: model.count
  }));

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Format currency
  const formatCurrency = (value, currency) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(value);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard Overview
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Real-time statistics and platform performance metrics
      </Typography>

      <Divider sx={{ mb: 4 }} />

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: theme === 'dark' ? '#1e1e1e' : 'white',
              borderLeft: '4px solid #3f51b5'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PeopleIcon sx={{ color: '#3f51b5', mr: 1 }} />
              <Typography variant="h6" component="div">
                Total Users
              </Typography>
            </Box>
            <Typography variant="h3" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
              {stats.total_users.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: theme === 'dark' ? '#1e1e1e' : 'white',
              borderLeft: '4px solid #f44336'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CreditCardIcon sx={{ color: '#f44336', mr: 1 }} />
              <Typography variant="h6" component="div">
                Total Credits
              </Typography>
            </Box>
            <Typography variant="h3" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
              {stats.total_credits_purchased.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: theme === 'dark' ? '#1e1e1e' : 'white',
              borderLeft: '4px solid #ff9800'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AccessTimeIcon sx={{ color: '#ff9800', mr: 1 }} />
              <Typography variant="h6" component="div">
                Active Users
              </Typography>
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                {stats.active_users_24h.toLocaleString()}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {stats.active_users_7d.toLocaleString()} in last 7 days
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ bgcolor: theme === 'dark' ? '#1e1e1e' : 'white' }}>
            <CardHeader title="Top Used LLM Models" />
            <Divider />
            <CardContent sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={modelUsageData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {modelUsageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} uses`, 'Usage']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ bgcolor: theme === 'dark' ? '#1e1e1e' : 'white' }}>
            <CardHeader title="Model Usage Comparison" />
            <Divider />
            <CardContent sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={modelUsageData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" name="Usage Count" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardOverview;
