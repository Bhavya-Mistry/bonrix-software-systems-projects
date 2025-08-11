import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Box,
  Paper,
  Divider,
  CircularProgress,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Fade,
  Zoom,
  Grow,
  useTheme as useMuiTheme,
  alpha,
  Avatar,
  IconButton,
  Tooltip
} from '@mui/material';
import TaskCard from '../components/TaskCard';
import {
  Psychology as TasksIcon,
  AccountBalanceWallet as WalletIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon,
  MoreVert as MoreIcon,
  Refresh as RefreshIcon,
  ArrowUpward as ArrowUpIcon,
  ShowChart as ChartIcon,
  Bolt as BoltIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, ChartTooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement);

// API URL from environment variable
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Chart options with theme support
const getChartOptions = (isDark) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        padding: 20,
        usePointStyle: true,
        font: {
          size: 12,
        },
        color: isDark ? '#e0e0e0' : '#666666'
      }
    },
    tooltip: {
      backgroundColor: isDark ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)',
      titleColor: isDark ? '#ffffff' : '#333333',
      bodyColor: isDark ? '#e0e0e0' : '#666666',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 8,
      titleFont: {
        size: 14,
        weight: 'bold'
      },
      bodyFont: {
        size: 13
      },
      displayColors: true,
      boxPadding: 5
    }
  }
});

const Dashboard = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const muiTheme = useMuiTheme();
  const navigate = useNavigate();
  const isDark = theme === 'dark';
  
  // Refs for animations
  const chartsRef = useRef(null);
  
  // State for task history and transactions
  const [taskHistory, setTaskHistory] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasesDialogOpen, setPurchasesDialogOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [animationReady, setAnimationReady] = useState(false);
  
  // Set animation ready after initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationReady(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
    
    // Add scroll animation for charts
    const handleScroll = () => {
      if (chartsRef.current) {
        const rect = chartsRef.current.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.75) {
          chartsRef.current.classList.add('animate-in');
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Fetch data function
  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      // Fetch task history
      const tasksResponse = await axios.get(`${API_URL}/users/tasks`);
      
      // Sort task history by timestamp in descending order (newest first)
      const sortedTasks = tasksResponse.data.sort((a, b) => {
        return new Date(b.timestamp) - new Date(a.timestamp);
      });
      
      // Log task data for debugging
      console.log('Task history data:', sortedTasks);
      
      // Create a more detailed log of task types and credit costs
      const taskTypeCreditMap = {};
      sortedTasks.forEach(task => {
        const type = task.task_type;
        const cost = parseFloat(task.credit_cost) || 0;
        if (!taskTypeCreditMap[type]) {
          taskTypeCreditMap[type] = 0;
        }
        taskTypeCreditMap[type] += cost;
      });
      console.log('Credit usage by task type:', taskTypeCreditMap);
      
      // Ensure credit_cost is a number for all tasks
      const processedTasks = sortedTasks.map(task => ({
        ...task,
        credit_cost: parseFloat(task.credit_cost) || 0 // Ensure credit_cost is a number
      }));
      
      setTaskHistory(processedTasks);
      
      // Fetch transactions
      const transactionsResponse = await axios.get(`${API_URL}/users/transactions`);
      setTransactions(transactionsResponse.data);
      
      if (isRefresh) {
        setRefreshing(false);
        // Show a success message or notification here if needed
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
      // Show an error message or notification here if needed
    }
  };
  
  // Task type distribution data for pie chart
  const taskTypeData = {
    labels: ['Resume Analysis', 'Object Detection', 'Invoice Extraction', 'Text Summarization', 'Sentiment Analysis', 'Custom Prompt'],
    datasets: [
      {
        data: [
          taskHistory.filter(task => task.task_type === 'resume_analysis').length,
          taskHistory.filter(task => task.task_type === 'object_detection').length,
          taskHistory.filter(task => task.task_type === 'invoice_extraction').length,
          taskHistory.filter(task => task.task_type === 'text_summarization').length,
          taskHistory.filter(task => task.task_type === 'sentiment_analysis').length,
          taskHistory.filter(task => task.task_type === 'custom_prompt').length
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)'
        ],
        borderColor: isDark ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        borderWidth: 2,
        hoverBackgroundColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        hoverBorderColor: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
        hoverBorderWidth: 3,
        borderRadius: 5,
        spacing: 2
      }
    ]
  };
  
  // Calculate credit usage by task type directly
  const calculateCreditUsageByTaskType = () => {
    // Define task types and their display names
    const taskTypes = {
      'resume_analysis': 'Resume Analysis',
      'object_detection': 'Object Detection',
      'invoice_extraction': 'Invoice Extraction',
      'text_summarization': 'Text Summarization',
      'sentiment_analysis': 'Sentiment Analysis',
      'custom_prompt': 'Custom Prompt'
    };
    
    // Initialize credit usage map
    const creditUsage = {};
    Object.keys(taskTypes).forEach(type => {
      creditUsage[type] = 0;
    });
    
    // Calculate credit usage for each task type
    taskHistory.forEach(task => {
      const type = task.task_type;
      const cost = parseFloat(task.credit_cost) || 0;
      if (creditUsage[type] !== undefined) {
        creditUsage[type] += cost;
      }
    });
    
    // Log the calculated credit usage
    console.log('Calculated credit usage:', creditUsage);
    
    // Return the labels and data for the chart
    return {
      labels: Object.values(taskTypes),
      data: Object.keys(taskTypes).map(type => parseFloat(creditUsage[type].toFixed(1)))
    };
  };
  
  // Get credit usage data for the chart
  const creditUsageInfo = calculateCreditUsageByTaskType();
  
  // Credit usage data for bar chart
  const creditUsageData = {
    labels: creditUsageInfo.labels,
    datasets: [
      {
        label: 'Credits Used',
        data: creditUsageInfo.data,
        
        backgroundColor: isDark 
          ? 'rgba(77, 171, 245, 0.7)' 
          : 'rgba(33, 150, 243, 0.7)',
        borderColor: isDark 
          ? 'rgba(77, 171, 245, 0.9)' 
          : 'rgba(33, 150, 243, 0.9)',
        borderWidth: 2,
        borderRadius: 6,
        hoverBackgroundColor: isDark 
          ? 'rgba(77, 171, 245, 0.9)' 
          : 'rgba(33, 150, 243, 0.9)',
        hoverBorderColor: isDark 
          ? 'rgba(255, 255, 255, 0.5)' 
          : 'rgba(0, 0, 0, 0.5)',
        hoverBorderWidth: 3
      }
    ]
  };
  
  // Usage trend data for line chart (mock data - would be replaced with real data)
  const currentDate = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - (6 - i));
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });
  
  const usageTrendData = {
    labels: last7Days,
    datasets: [
      {
        label: 'Daily Usage',
        data: last7Days.map(() => Math.floor(Math.random() * 20) + 5), // Mock data
        borderColor: isDark ? '#f06292' : '#f50057',
        backgroundColor: 'rgba(0, 0, 0, 0)',
        pointBackgroundColor: isDark ? '#f06292' : '#f50057',
        pointBorderColor: isDark ? '#121212' : '#ffffff',
        pointHoverBackgroundColor: isDark ? '#ffffff' : '#000000',
        pointHoverBorderColor: isDark ? '#f06292' : '#f50057',
        pointBorderWidth: 2,
        pointHoverBorderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.3,
        borderWidth: 3
      }
    ]
  };
  
  // Format date (timestamps are already in IST from the backend)
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    
    // Format date in DD/MM/YYYY format
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    // Format time with AM/PM
    let hours = date.getHours();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    // Return formatted date and time
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds} ${ampm}`;
  };
  
  // Get task display name
  const getTaskDisplayName = (taskType) => {
    const taskNames = {
      'resume_analysis': 'Resume Analysis',
      'object_detection': 'Object Detection',
      'invoice_extraction': 'Invoice Extraction',
      'text_summarization': 'Text Summarization',
      'sentiment_analysis': 'Sentiment Analysis',
      'custom_prompt': 'Custom Prompt'
    };
    
    return taskNames[taskType] || taskType;
  };
  
  return (
    <Box sx={{ pt: 2 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 4
      }}>
        <Fade in={animationReady} timeout={800}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 'bold',
              background: isDark 
                ? 'linear-gradient(90deg, #4dabf5 0%, #2196f3 100%)' 
                : 'linear-gradient(90deg, #1976d2 30%, #2196f3 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '0.5px',
              textShadow: isDark ? '0 2px 10px rgba(33, 150, 243, 0.3)' : 'none'
            }}
          >
            Dashboard
          </Typography>
        </Fade>
        
        <Fade in={animationReady} timeout={1000}>
          <Button 
            startIcon={<RefreshIcon />} 
            onClick={() => fetchData(true)} 
            disabled={refreshing}
            variant="outlined"
            color="primary"
            sx={{ 
              borderRadius: 2,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
              }
            }}
          >
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </Fade>
      </Box>
      
      {loading ? (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh' 
        }}>
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" sx={{ mt: 2, opacity: 0.7 }}>
            Loading your dashboard...
          </Typography>
        </Box>
      ) : (
        <>
          {/* Quick Stats */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <WalletIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Credits</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {user?.credits.toFixed(0)}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={() => navigate('/wallet')}
                  >
                    Buy More
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small"
                    color="secondary"
                    onClick={() => setPurchasesDialogOpen(true)}
                  >
                    Previous Purchases
                  </Button>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TasksIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Tasks</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {taskHistory.length}
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small" 
                  sx={{ mt: 1 }}
                  onClick={() => navigate('/tasks')}
                >
                  New Task
                </Button>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <HistoryIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Transactions</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {transactions.length}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Total purchases
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Usage</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {taskHistory.reduce((sum, task) => sum + task.credit_cost, 0).toFixed(0)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Credits spent
                </Typography>
              </Paper>
            </Grid>
          </Grid>
          
          {/* Task Cards */}
          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            AI Tasks
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={4}>
              <TaskCard
                title="Resume Analysis"
                description="Analyze resumes against job descriptions to find the best candidates."
                taskType="resume_analysis"
                route="/tasks/resume-analysis"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TaskCard
                title="Object Detection"
                description="Detect and count objects in images with AI vision."
                taskType="object_detection"
                route="/tasks/object-detection"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TaskCard
                title="Invoice Extraction"
                description="Extract structured data from invoice images and PDFs."
                taskType="invoice_extraction"
                route="/tasks/invoice-extraction"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TaskCard
                title="Text Summarization"
                description="Generate concise summaries of long-form text."
                taskType="text_summarization"
                route="/tasks/text-summarization"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TaskCard
                title="Sentiment Analysis"
                description="Analyze sentiment in customer reviews and feedback."
                taskType="sentiment_analysis"
                route="/tasks/sentiment-analysis"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TaskCard
                title="Custom Prompt"
                description="Create your own custom AI prompts for any task."
                taskType="custom_prompt"
                route="/tasks/custom-prompt"
              />
            </Grid>
          </Grid>
          
          {/* Analytics Section */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Task Distribution
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Pie data={taskTypeData} options={{ maintainAspectRatio: false }} />
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Credit Usage by Task
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Bar 
                    data={creditUsageData} 
                    options={{ 
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true
                        }
                      }
                    }} 
                  />
                </Box>
              </Paper>
            </Grid>
          </Grid>
          
          {/* Recent Activity */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Recent Tasks
                </Typography>
                <List>
                  {taskHistory.slice(0, 5).map((task) => (
                    <ListItem key={task.id} divider>
                      <ListItemText
                        primary={getTaskDisplayName(task.task_type)}
                        secondary={formatDate(task.timestamp)}
                      />
                      <ListItemSecondaryAction>
                        <Chip 
                          label={`${task.credit_cost.toFixed(1)} credits`} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                  {taskHistory.length === 0 && (
                    <ListItem>
                      <ListItemText primary="No tasks yet" secondary="Try running your first AI task" />
                    </ListItem>
                  )}
                </List>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Recent Transactions
                </Typography>
                <List>
                  {transactions.slice(0, 5).map((transaction) => (
                    <ListItem key={transaction.id} divider>
                      <ListItemText
                        primary={`${transaction.amount} credits purchased`}
                        secondary={formatDate(transaction.timestamp)}
                      />
                      <ListItemSecondaryAction>
                        <Chip 
                          label={transaction.method} 
                          size="small" 
                          color="secondary" 
                          variant="outlined"
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                  {transactions.length === 0 && (
                    <ListItem>
                      <ListItemText primary="No transactions yet" secondary="Purchase credits to get started" />
                    </ListItem>
                  )}
                </List>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
      
      {/* Previous Purchases Dialog */}
      <Dialog 
        open={purchasesDialogOpen} 
        onClose={() => setPurchasesDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Previous Purchases Statement</DialogTitle>
        <DialogContent>
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'primary.light' }}>
                  <TableCell>Transaction ID</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Credits</TableCell>
                  <TableCell>Payment Method</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.length > 0 ? (
                  transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.id}</TableCell>
                      <TableCell>{formatDate(transaction.timestamp)}</TableCell>
                      <TableCell>+{transaction.amount}</TableCell>
                      <TableCell>
                        <Chip 
                          label={transaction.method} 
                          size="small" 
                          color="secondary" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label="Completed" 
                          size="small" 
                          color="success" 
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No purchase history available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          {transactions.length > 0 && (
            <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1, color: 'text.primary' }}>
              <Typography variant="h6" gutterBottom>Summary</Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2">Total Purchases:</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" align="right">{transactions.length}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">Total Credits Purchased:</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" align="right">
                    {transactions.reduce((sum, transaction) => sum + transaction.amount, 0)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPurchasesDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;
