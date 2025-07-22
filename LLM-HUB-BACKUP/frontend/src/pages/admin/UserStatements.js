import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Alert,
  Chip,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Autocomplete
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  FileDownload as FileDownloadIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';

// API URL from environment variable
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const UserStatements = () => {
  const { theme } = useTheme();
  
  // State for users and selected user
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userSearch, setUserSearch] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  // State for statements
  const [statements, setStatements] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // State for filters
  const [openFilters, setOpenFilters] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [transactionType, setTransactionType] = useState('all');
  
  // Fetch users when component mounts
  useEffect(() => {
    fetchUsers();
  }, []);
  
  // Fetch statements when selected user changes
  useEffect(() => {
    if (selectedUser) {
      fetchUserStatements();
    } else {
      setStatements([]);
      setSummary(null);
    }
  }, [selectedUser, page, rowsPerPage]);
  
  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      setError(null);
      
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setError('Authentication token not found');
        setLoadingUsers(false);
        return;
      }
      
      // Set auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Fetch all users
      const response = await axios.get(`${API_URL}/admin/users`, {
        params: {
          limit: 100,  // Get a reasonable number of users
          search: userSearch || undefined
        }
      });
      
      setUsers(response.data.users);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };
  
  // Fetch statements for selected user
  const fetchUserStatements = async () => {
    if (!selectedUser) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setError('Authentication token not found');
        setLoading(false);
        return;
      }
      
      // Set auth header with token
      const headers = {
        'Authorization': `Bearer ${token}`
      };
      
      // Prepare query params
      const params = {
        skip: page * rowsPerPage,
        limit: rowsPerPage
      };
      
      // Add date filters if provided
      if (startDate) {
        params.start_date = new Date(startDate).toISOString();
      }
      if (endDate) {
        params.end_date = new Date(endDate).toISOString();
      }
      
      // Add transaction type filter if provided
      if (transactionType && transactionType !== 'all') {
        params.transaction_type = transactionType;
      }
      
      console.log(`Fetching statements for user ID: ${selectedUser.id}`);
      console.log('Request params:', params);
      
      // Fetch statements for the selected user
      const response = await axios.get(
        `${API_URL}/admin/user-statements/${selectedUser.id}`, 
        { headers, params }
      );
      
      console.log('User statements API response:', response.data);
      
      // Check if response contains items
      if (response.data && Array.isArray(response.data.items)) {
        setStatements(response.data.items);
        console.log(`Received ${response.data.items.length} statement records`);
      } else {
        console.warn('No statement items found in response or invalid format');
        console.log('Response structure:', JSON.stringify(response.data));
        setStatements([]);
      }
      
      // Set summary data if available
      if (response.data && response.data.summary) {
        setSummary(response.data.summary);
      } else {
        setSummary(null);
      }
    } catch (err) {
      console.error('Error fetching user statements:', err);
      if (err.response) {
        console.error('Error response:', err.response.data);
        console.error('Status code:', err.response.status);
      }
      setError(`Failed to load statements: ${err.message}`);
      setStatements([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Handle user selection
  const handleUserChange = (event, newValue) => {
    setSelectedUser(newValue);
    setPage(0);
  };
  
  // Handle search for users
  const handleUserSearch = (event) => {
    setUserSearch(event.target.value);
  };
  
  // Handle filter dialog
  const handleOpenFilters = () => {
    setOpenFilters(true);
  };
  
  const handleCloseFilters = () => {
    setOpenFilters(false);
  };
  
  const applyFilters = () => {
    setPage(0);
    fetchUserStatements();
    handleCloseFilters();
  };
  
  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
    setTransactionType('all');
    setPage(0);
    fetchUserStatements();
    handleCloseFilters();
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Get transaction type chip
  const getTransactionTypeChip = (type) => {
    switch (type) {
      case 'purchase':
        return <Chip label="Purchase" color="success" size="small" />;
      case 'usage':
        return <Chip label="Usage" color="primary" size="small" />;
      case 'refund':
        return <Chip label="Refund" color="secondary" size="small" />;
      case 'admin_adjustment':
        return <Chip label="Admin Adjustment" color="warning" size="small" />;
      default:
        return <Chip label={type} size="small" />;
    }
  };
  
  // Export to CSV
  const exportAsCSV = () => {
    if (!statements.length) return;
    
    // Create CSV content
    const headers = ['Date', 'Type', 'Description', 'Credit', 'Debit', 'Purchase', 'Opening', 'Closing'];
    const csvContent = [
      headers.join(','),
      ...statements.map(stmt => [
        formatDate(stmt.timestamp),
        stmt.transaction_type,
        `"${stmt.description.replace(/"/g, '""')}"`,
        stmt.credit,
        stmt.debit,
        stmt.purchase_amount,
        stmt.opening_balance,
        stmt.closing_balance
      ].join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `statement_${selectedUser?.name || 'user'}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        User Statements
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        View statement history for any user
      </Typography>
      
      <Divider sx={{ mb: 4 }} />
      
      {/* User Selection */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, bgcolor: theme === 'dark' ? '#1e1e1e' : 'white' }}>
        <Typography variant="h6" gutterBottom>
          Select User
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Autocomplete
              options={users}
              getOptionLabel={(option) => `${option.name} (${option.email})`}
              value={selectedUser}
              onChange={handleUserChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search for a user"
                  variant="outlined"
                  fullWidth
                  onChange={handleUserSearch}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingUsers ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<SearchIcon />}
                onClick={fetchUsers}
                disabled={loadingUsers}
              >
                Search Users
              </Button>
              {selectedUser && (
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={fetchUserStatements}
                  disabled={loading}
                >
                  Refresh Statements
                </Button>
              )}
              {selectedUser && statements.length > 0 && (
                <Button
                  variant="outlined"
                  startIcon={<FileDownloadIcon />}
                  onClick={exportAsCSV}
                >
                  Export CSV
                </Button>
              )}
              {selectedUser && (
                <Button
                  variant="outlined"
                  startIcon={<FilterListIcon />}
                  onClick={handleOpenFilters}
                >
                  Filters
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Summary Cards */}
      {selectedUser && summary && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Card elevation={3} sx={{ bgcolor: theme === 'dark' ? '#1e1e1e' : 'white' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  User Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Name
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {selectedUser.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {selectedUser.email}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      User ID
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {selectedUser.id}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Current Credits
                    </Typography>
                    <Typography variant="body1" gutterBottom fontWeight="bold">
                      {selectedUser.credits?.toLocaleString() || '0'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card elevation={3} sx={{ bgcolor: theme === 'dark' ? '#1e1e1e' : 'white' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Statement Summary
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Total Credits
                    </Typography>
                    <Typography variant="body1" gutterBottom color="success.main">
                      +{summary.total_credits?.toLocaleString() || '0'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Total Debits
                    </Typography>
                    <Typography variant="body1" gutterBottom color="error.main">
                      -{summary.total_debits?.toLocaleString() || '0'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Total Purchases
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {summary.total_purchases?.toLocaleString() || '0'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Net Change
                    </Typography>
                    <Typography 
                      variant="body1" 
                      gutterBottom 
                      color={summary.net_change >= 0 ? 'success.main' : 'error.main'}
                      fontWeight="bold"
                    >
                      {summary.net_change >= 0 ? '+' : ''}{summary.net_change?.toLocaleString() || '0'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      
      {/* Statement Table */}
      {selectedUser && (
        <TableContainer component={Paper} elevation={3} sx={{ bgcolor: theme === 'dark' ? '#1e1e1e' : 'white' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Credit</TableCell>
                <TableCell align="right">Debit</TableCell>
                <TableCell align="right">Purchase</TableCell>
                <TableCell align="right">Opening</TableCell>
                <TableCell align="right">Closing</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={40} />
                  </TableCell>
                </TableRow>
              ) : statements.length > 0 ? (
                statements.map((statement) => (
                  <TableRow key={statement.id}>
                    <TableCell>{formatDate(statement.timestamp)}</TableCell>
                    <TableCell>{getTransactionTypeChip(statement.transaction_type)}</TableCell>
                    <TableCell>{statement.description}</TableCell>
                    <TableCell align="right">
                      {statement.credit > 0 ? `+${statement.credit.toLocaleString()}` : '0.00'}
                    </TableCell>
                    <TableCell align="right">
                      {statement.debit > 0 ? `-${statement.debit.toLocaleString()}` : '0.00'}
                    </TableCell>
                    <TableCell align="right">
                      {statement.purchase_amount > 0 ? statement.purchase_amount.toLocaleString() : '0.00'}
                    </TableCell>
                    <TableCell align="right">{statement.opening_balance.toLocaleString()}</TableCell>
                    <TableCell align="right">{statement.closing_balance.toLocaleString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No statement records found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {statements.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={statements.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          )}
        </TableContainer>
      )}
      
      {/* Filters Dialog */}
      <Dialog open={openFilters} onClose={handleCloseFilters} maxWidth="sm" fullWidth>
        <DialogTitle>Filter Statements</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Start Date"
                type="date"
                fullWidth
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="End Date"
                type="date"
                fullWidth
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
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
    </Box>
  );
};

export default UserStatements;
