import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  Container
} from '@mui/material';
// Using standard TextField with type='date' instead of MUI date pickers
import DownloadIcon from '@mui/icons-material/Download';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// API URL from environment variable
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const StatementHistory = () => {
  // Get auth context
  const { user, isAuthenticated } = useAuth();
  
  // State for statement data and loading
  const [statements, setStatements] = useState([]);
  const [filteredStatements, setFilteredStatements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  
  // State for filters
  const [openFilters, setOpenFilters] = useState(false);
  const [period, setPeriod] = useState('month');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [transactionType, setTransactionType] = useState('all');
  
  // Fetch statement data when component mounts or authentication changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchStatementData();
      // Auto-refresh has been disabled per user request
    }
  }, [isAuthenticated]);
  
  // Calculate cumulative totals whenever statements change
  useEffect(() => {
    if (statements.length > 0) {
      calculateCumulativeTotals(statements);
    }
  }, [statements]);
  
  // State for refresh button loading
  const [refreshing, setRefreshing] = useState(false);

  // Fetch statement data
  const fetchStatementData = async (forceRefresh = false) => {
    if (!isAuthenticated) {
      console.log('User not authenticated, skipping data fetch');
      return;
    }
    
    try {
      if (forceRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      console.log('Fetching statement history from:', `${API_URL}/statement/history`);
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        setLoading(false);
        setRefreshing(false);
        return;
      }
      
      // Set up headers with authentication token
      const headers = {
        'Authorization': `Bearer ${token}`
      };
      
      // Add cache-busting parameter for force refresh
      const cacheBuster = forceRefresh ? `?_=${new Date().getTime()}` : '';
      
      // Fetch statement history
      console.log('Sending request with headers:', headers);
      const statementsResponse = await axios.get(`${API_URL}/statement/history${cacheBuster}`, { headers });
      console.log('Statement history response:', statementsResponse.data);
      console.log('Statement items count:', statementsResponse.data.items ? statementsResponse.data.items.length : 0);
      
      const statementData = statementsResponse.data.items || [];
      setStatements(statementData);
      
      // Calculate cumulative totals
      if (statementData.length > 0) {
        calculateCumulativeTotals(statementData);
      } else {
        setFilteredStatements([]);
      }
      
      // Summary is now calculated directly in calculateCumulativeTotals function
      console.log('Summary calculated from statement data');
      
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Error fetching statement data:', error);
      console.error('Error details:', error.response ? error.response.data : 'No response data');
      
      // Handle specific error cases
      if (error.response) {
        if (error.response.status === 401) {
          console.error('Authentication error: Token may be invalid or expired');
        } else if (error.response.status === 403) {
          console.error('Authorization error: User does not have permission');
        } else if (error.response.status === 404) {
          console.error('Resource not found: API endpoint may be incorrect');
        }
      }
      
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Force refresh function with cache busting
  const forceRefresh = () => {
    console.log('Force refreshing statement data...');
    fetchStatementData(true);
  };
  
  // Calculate cumulative totals and summary data for statements
  const calculateCumulativeTotals = (data) => {
    // Sort by timestamp (oldest first) to calculate running totals
    const sortedData = [...data].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    let runningDebitTotal = 0;
    let totalCreditsAdded = 0;
    let totalCreditsUsed = 0;
    
    sortedData.forEach(item => {
      // Calculate cumulative debit
      runningDebitTotal += parseFloat(item.debit || 0);
      item.cumulativeDebit = runningDebitTotal.toFixed(2);
      
      // Add to summary totals
      totalCreditsAdded += parseFloat(item.credit || 0);
      totalCreditsUsed += parseFloat(item.debit || 0);
    });
    
    // Update summary data
    setSummary({
      total_credits_added: totalCreditsAdded.toFixed(2),
      total_credits_used: totalCreditsUsed.toFixed(2),
      net_change: (totalCreditsAdded - totalCreditsUsed).toFixed(2),
      transaction_count: data.length,
      total_transactions: data.length
    });
    
    // Sort back to newest first for display
    const displayData = sortedData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    setFilteredStatements(displayData);
    return displayData;
  };
  
  // Apply filters
  const applyFilters = () => {
    setOpenFilters(false);
    
    let filteredData = [...statements];
    
    // Apply transaction type filter
    if (transactionType !== 'all') {
      filteredData = filteredData.filter(item => item.transaction_type === transactionType);
    }
    
    // Apply date range filter if custom period is selected
    if (period === 'custom' && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Set to end of day
      
      filteredData = filteredData.filter(item => {
        const itemDate = new Date(item.timestamp);
        return itemDate >= start && itemDate <= end;
      });
    } else if (period !== 'all') {
      // Apply predefined period filter
      const now = new Date();
      let startDate;
      
      if (period === 'week') {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
      } else if (period === 'month') {
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
      } else if (period === 'year') {
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000); // 365 days ago
      }
      
      filteredData = filteredData.filter(item => new Date(item.timestamp) >= startDate);
    }
    
    // Calculate cumulative totals and update filtered statements
    calculateCumulativeTotals(filteredData);
  };
  
  // Reset filters
  const resetFilters = () => {
    setPeriod('month');
    setStartDate(null);
    setEndDate(null);
    setTransactionType('all');
    fetchStatementData();
    setOpenFilters(false);
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  // Get transaction type chip color
  const getTransactionTypeChip = (type) => {
    switch (type) {
      case 'purchase':
        return <Chip label="Purchase" size="small" color="success" />;
      case 'usage':
        return <Chip label="Usage" size="small" color="primary" />;
      case 'refund':
        return <Chip label="Refund" size="small" color="warning" />;
      case 'admin_adjustment':
        return <Chip label="Admin Adjustment" size="small" color="secondary" />;
      default:
        return <Chip label={type} size="small" />;
    }
  };
  
  // Format debit
  const formatDebit = (amount) => {
    return Math.abs(amount).toFixed(2);
  };
  
  // Format credit
  const formatCredit = (amount) => {
    return Math.abs(amount).toFixed(2);
  };
  
  // Export statement as CSV
  const exportAsCSV = () => {
    if (statements.length === 0) return;
    
    // Prepare CSV header and data
    const headers = [
      'ID',
      'Date',
      'Username',
      'Email',
      'Type',
      'Description',
      'Reference ID',
      'Credit',
      'Debit',
      'Purchase Amount',
      'Opening Balance',
      'Closing Balance'
    ];
    
    const csvData = statements.map(statement => [
      statement.id,
      formatDate(statement.timestamp),
      statement.username,
      statement.email,
      statement.transaction_type,
      statement.description,
      statement.reference_id || '',
      statement.credit,
      statement.debit,
      statement.purchase_amount,
      statement.opening_balance,
      statement.closing_balance
    ]);
    
    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'statement_history.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <Box sx={{ width: '100%', overflowX: 'visible' }}>
      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Summary Cards */}
          <Grid container spacing={2} sx={{ mb: 3, pl: 0, pr: 0, width: '100%', ml: -2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                borderRadius: '10px', 
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                border: '1px solid',
                borderColor: 'divider',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '4px',
                  height: '100%',
                  background: 'linear-gradient(180deg, #4caf50 0%, #81c784 100%)'
                }
              }}>
                <CardContent sx={{ pl: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ fontWeight: 500, letterSpacing: '0.1px' }}>
                    Total Credits Added
                  </Typography>
                  <Typography variant="h4" sx={{ 
                    color: 'success.main', 
                    fontWeight: 'bold',
                    letterSpacing: '-0.5px'
                  }}>
                    {summary?.total_credits_added || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                borderRadius: '10px', 
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                border: '1px solid',
                borderColor: 'divider',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '4px',
                  height: '100%',
                  background: 'linear-gradient(180deg, #f44336 0%, #e57373 100%)'
                }
              }}>
                <CardContent sx={{ pl: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ fontWeight: 500, letterSpacing: '0.1px' }}>
                    Total Credits Used
                  </Typography>
                  <Typography variant="h4" sx={{ 
                    color: 'error.main', 
                    fontWeight: 'bold',
                    letterSpacing: '-0.5px'
                  }}>
                    {summary?.total_credits_used || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                borderRadius: '10px', 
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                border: '1px solid',
                borderColor: 'divider',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '4px',
                  height: '100%',
                  background: 'linear-gradient(180deg, #2196f3 0%, #64b5f6 100%)'
                }
              }}>
                <CardContent sx={{ pl: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ fontWeight: 500, letterSpacing: '0.1px' }}>
                    Net Change
                  </Typography>
                  <Typography variant="h4" sx={{ 
                    color: summary?.net_change >= 0 ? 'success.main' : 'error.main', 
                    fontWeight: 'bold',
                    letterSpacing: '-0.5px'
                  }}>
                    {summary?.net_change >= 0 ? '' : '-'}{Math.abs(summary?.net_change || 0)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                borderRadius: '10px', 
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                border: '1px solid',
                borderColor: 'divider',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '4px',
                  height: '100%',
                  background: 'linear-gradient(180deg, #9c27b0 0%, #ba68c8 100%)'
                }
              }}>
                <CardContent sx={{ pl: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ fontWeight: 500, letterSpacing: '0.1px' }}>
                    Total Transactions
                  </Typography>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 'bold',
                    letterSpacing: '-0.5px'
                  }}>
                    {summary?.total_transactions || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          {/* Statement Controls */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" component="h2">
              Statement History
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                size="small"
                startIcon={refreshing ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
                onClick={forceRefresh}
                disabled={refreshing}
                sx={{ 
                  mr: 1, 
                  borderRadius: '30px',
                  background: 'linear-gradient(45deg, #FF6B98 30%, #5B9BD5 90%)',
                  boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
                  color: 'white',
                  fontWeight: 'bold',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #FF5A8D 30%, #4A8AC4 90%)',
                  }
                }}
              >
                {refreshing ? 'Refreshing...' : 'Refresh Data'}
              </Button>
              <IconButton onClick={() => setOpenFilters(true)} size="small" title="Filter">
                <FilterListIcon />
              </IconButton>
              <IconButton onClick={exportAsCSV} size="small" title="Export">
                <DownloadIcon />
              </IconButton>
            </Box>
          </Box>
          
          {statements.length === 0 && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              mb: 2, 
              p: 1, 
              borderRadius: '8px', 
              bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(66, 66, 66, 0.2)' : 'rgba(0, 0, 0, 0.03)',
              border: '1px solid',
              borderColor: 'divider'
            }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, letterSpacing: '0.1px' }}>
                No statement data available yet. Your transaction history will appear here.
              </Typography>
            </Box>
          )}
          
          {/* Statement Table */}
          <Box sx={{ mt: 2, mb: 2, width: '100%', overflow: 'hidden', ml: -2 }}>
            <Paper 
              sx={{ 
                borderRadius: '10px',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                overflow: 'hidden',
                maxWidth: 'calc(100% + 20px)'
              }}
            >
              <Box sx={{ overflowX: 'auto', display: 'flex', flexDirection: 'column', pr: 2 }}>
                <Table size="small" sx={{ minWidth: '900px', tableLayout: 'fixed', width: '100%' }}>
                  <TableHead>
                    <TableRow sx={{ 
                      bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                      '& th': { 
                        fontWeight: 600,
                        letterSpacing: '0.25px',
                        borderBottom: '2px solid',
                        borderColor: 'divider',
                        padding: '3px 4px',
                        whiteSpace: 'nowrap',
                        fontSize: '0.65rem'
                      }
                    }}>
                      <TableCell align="center">Date</TableCell>
                      <TableCell align="center">Type</TableCell>
                      <TableCell align="center">Desc</TableCell>
                      <TableCell align="center">Credit</TableCell>
                      <TableCell align="center">Debit</TableCell>
                      <TableCell align="center">Purch</TableCell>
                      <TableCell align="center" style={{ fontWeight: 'bold', fontSize: '1rem' }}>
                        Opening<br/>Balance
                      </TableCell>
                      <TableCell align="center" style={{ fontWeight: 'bold', fontSize: '1rem' }}>
                        Closing<br/>Balance
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredStatements.length > 0 ? (
                      filteredStatements.map((statement) => (
                        <TableRow 
                          key={statement.id}
                          sx={{ 
                            '&:hover': { 
                              bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)'
                            },
                            transition: 'background-color 0.2s ease',
                            '& td': {
                              padding: '3px 4px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              fontSize: '0.65rem'
                            }
                          }}
                        >
                          <TableCell>{formatDate(statement.timestamp)}</TableCell>
                          <TableCell>{getTransactionTypeChip(statement.transaction_type)}</TableCell>
                          <TableCell>{statement.description}</TableCell>
                          <TableCell align="right" sx={{
                            color: statement.credit > 0 ? 'success.main' : 'text.primary',
                            fontWeight: statement.credit > 0 ? 'bold' : 'normal'
                          }}>
                            {formatCredit(statement.credit)}
                          </TableCell>
                          <TableCell align="right" sx={{
                            color: statement.debit > 0 ? 'error.main' : 'text.primary',
                            fontWeight: statement.debit > 0 ? 'bold' : 'normal'
                          }}>
                            {formatDebit(statement.debit)}
                          </TableCell>
                          <TableCell align="right">
                            {statement.purchase_amount > 0 ? statement.purchase_amount.toFixed(2) : '0.00'}
                          </TableCell>
                          <TableCell align="right">
                            {statement.opening_balance.toFixed(2)}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'medium' }}>
                            {statement.closing_balance.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      statements.length === 0 && !loading && (
                        <TableRow>
                          <TableCell colSpan={10} align="center" sx={{ py: 3, borderBottom: 0 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                              <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main', mb: 1 }}>
                                No Statement Data Available
                              </Typography>
                              <Typography variant="body2" color="text.secondary" align="center" sx={{ maxWidth: '80%', mb: 1 }}>
                                Your transaction history will appear here once you have made purchases or used credits.
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'secondary.main', fontWeight: 500, mb: 1 }}>
                                To generate statement data, you can:
                              </Typography>
                              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', maxWidth: '80%' }}>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                  • Purchase credits from the Wallet section
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                  • Use credits for LLM tasks
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                  • Contact an administrator to add credits to your account
                                </Typography>
                              </Box>
                              <Button
                                variant="contained"
                                size="medium"
                                startIcon={refreshing ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
                                onClick={forceRefresh}
                                disabled={refreshing}
                                sx={{ 
                                  mt: 2, 
                                  borderRadius: '30px',
                                  background: 'linear-gradient(45deg, #FF6B98 30%, #5B9BD5 90%)',
                                  boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
                                  color: 'white',
                                  fontWeight: 'bold',
                                  '&:hover': {
                                    background: 'linear-gradient(45deg, #FF5A8D 30%, #4A8AC4 90%)',
                                  }
                                }}
                              >
                                {refreshing ? 'Refreshing...' : 'Refresh Now'}
                              </Button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      )
                    )}
                    {statements.length === 0 && loading && (
                      // Empty placeholder rows
                      Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={index} sx={{ 
                          '& td': { 
                            padding: '3px 4px', 
                            borderBottom: index === 4 ? 0 : '1px solid', 
                            borderColor: 'divider',
                            fontSize: '0.65rem'
                          } 
                        }}>
                          <TableCell sx={{ borderBottom: index === 4 ? 0 : '1px solid', borderColor: 'divider' }}>-</TableCell>
                          <TableCell sx={{ borderBottom: index === 4 ? 0 : '1px solid', borderColor: 'divider' }}>-</TableCell>
                          <TableCell sx={{ borderBottom: index === 4 ? 0 : '1px solid', borderColor: 'divider' }}>-</TableCell>
                          <TableCell sx={{ borderBottom: index === 4 ? 0 : '1px solid', borderColor: 'divider' }}>-</TableCell>
                          <TableCell sx={{ borderBottom: index === 4 ? 0 : '1px solid', borderColor: 'divider' }}>-</TableCell>
                          <TableCell align="right" sx={{ borderBottom: index === 4 ? 0 : '1px solid', borderColor: 'divider', width: '70px' }}>-</TableCell>
                          <TableCell align="right" sx={{ borderBottom: index === 4 ? 0 : '1px solid', borderColor: 'divider', width: '70px' }}>-</TableCell>
                          <TableCell align="right" sx={{ borderBottom: index === 4 ? 0 : '1px solid', borderColor: 'divider', width: '70px' }}>-</TableCell>
                          <TableCell align="right" sx={{ borderBottom: index === 4 ? 0 : '1px solid', borderColor: 'divider', width: '70px' }}>-</TableCell>
                          <TableCell align="right" sx={{ borderBottom: index === 4 ? 0 : '1px solid', borderColor: 'divider', width: '70px' }}>-</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Box>
            </Paper>
          </Box>
          
          {/* Filter Dialog */}
          <Dialog open={openFilters} onClose={() => setOpenFilters(false)} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ pb: 1 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" sx={{ fontWeight: 500 }}>Filter Statement History</Typography>
                <IconButton onClick={() => setOpenFilters(false)} size="small">
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            
            <DialogContent>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel id="period-label">Time Period</InputLabel>
                    <Select
                      labelId="period-label"
                      value={period}
                      label="Time Period"
                      onChange={(e) => setPeriod(e.target.value)}
                    >
                      <MenuItem value="week">Last 7 Days</MenuItem>
                      <MenuItem value="month">Last 30 Days</MenuItem>
                      <MenuItem value="year">Last 365 Days</MenuItem>
                      <MenuItem value="all">All Time</MenuItem>
                      <MenuItem value="custom">Custom Range</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                {period === 'custom' && (
                  <>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Start Date"
                        type="date"
                        fullWidth
                        value={startDate ? startDate.toISOString().split('T')[0] : ''}
                        onChange={(e) => {
                          const date = e.target.value ? new Date(e.target.value) : null;
                          setStartDate(date);
                        }}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                          }
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="End Date"
                        type="date"
                        fullWidth
                        value={endDate ? endDate.toISOString().split('T')[0] : ''}
                        onChange={(e) => {
                          const date = e.target.value ? new Date(e.target.value) : null;
                          setEndDate(date);
                        }}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                          }
                        }}
                      />
                    </Grid>
                  </>
                )}
                
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel id="type-label">Transaction Type</InputLabel>
                    <Select
                      labelId="type-label"
                      value={transactionType}
                      label="Transaction Type"
                      onChange={(e) => setTransactionType(e.target.value)}
                    >
                      <MenuItem value="all">All Transactions</MenuItem>
                      <MenuItem value="purchase">Purchases Only</MenuItem>
                      <MenuItem value="usage">Usage Only</MenuItem>
                      <MenuItem value="refund">Refunds Only</MenuItem>
                      <MenuItem value="admin_adjustment">Admin Adjustments Only</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </DialogContent>
            
            <DialogActions>
              <Button onClick={resetFilters} color="inherit">
                Reset
              </Button>
              <Button onClick={applyFilters} variant="contained">
                Apply Filters
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  );
};

export default StatementHistory;
