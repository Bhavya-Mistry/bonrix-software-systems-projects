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
  InputAdornment
} from '@mui/material';
// Using simple TextField for date input instead of DatePicker
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  FileDownload as FileDownloadIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';

// API URL from environment variable
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const TransactionHistory = () => {
  const { theme } = useTheme();
  
  // State
  const [transactions, setTransactions] = useState([]);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [status, setStatus] = useState('');
  
  // Fetch transactions
  const fetchTransactions = async () => {
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
      
      // Prepare query params
      const params = {
        skip: page * rowsPerPage,
        limit: rowsPerPage
      };
      
      // Add filters if provided
      if (startDate) {
        params.start_date = startDate.toISOString();
      }
      if (endDate) {
        params.end_date = endDate.toISOString();
      }
      if (paymentMethod) {
        params.payment_method = paymentMethod;
      }
      if (status) {
        params.status = status;
      }
      
      // Fetch transactions with pagination and filters
      const response = await axios.get(`${API_URL}/admin/transactions`, { params });
      
      setTransactions(response.data.transactions);
      setTotalTransactions(response.data.total);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };
  
  // Initial fetch
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchTransactions();
  }, [page, rowsPerPage, startDate, endDate, paymentMethod, status]);
  
  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Handle view transaction details
  const handleViewTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setDetailsOpen(true);
  };
  
  // Handle export to CSV
  const handleExportCSV = () => {
    // Create CSV content
    const headers = ['ID', 'User Email', 'Amount', 'Method', 'Status', 'Payment ID', 'Timestamp'];
    const csvContent = [
      headers.join(','),
      ...transactions.map(tx => [
        tx.id,
        `"${tx.user_email.replace(/"/g, '""')}"`,
        tx.amount,
        tx.method,
        tx.status,
        tx.payment_id || '',
        new Date(tx.timestamp).toLocaleString()
      ].join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Handle reset filters
  const handleResetFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setPaymentMethod('');
    setStatus('');
    setPage(0);
  };
  
  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };
  
  // Format currency
  const formatCurrency = (value, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  if (loading && transactions.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Transaction History
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        View and filter all payment transactions
      </Typography>
      
      <Divider sx={{ mb: 4 }} />
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: theme === 'dark' ? '#1e1e1e' : 'white' }}>
        <Typography variant="h6" gutterBottom>
          Filters
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              label="Start Date"
              type="date"
              value={startDate ? startDate.toISOString().split('T')[0] : ''}
              onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : null)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              label="End Date"
              type="date"
              value={endDate ? endDate.toISOString().split('T')[0] : ''}
              onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : null)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                label="Payment Method"
              >
                <MenuItem value="">All Methods</MenuItem>
                <MenuItem value="razorpay">Razorpay</MenuItem>
                <MenuItem value="stripe">Stripe</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                label="Status"
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={handleResetFilters}
              sx={{ mr: 1 }}
            >
              Reset Filters
            </Button>
            <Button
              variant="contained"
              startIcon={<FileDownloadIcon />}
              onClick={handleExportCSV}
              disabled={transactions.length === 0}
            >
              Export to CSV
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Transactions Table */}
      <TableContainer component={Paper} sx={{ bgcolor: theme === 'dark' ? '#1e1e1e' : 'white' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Method</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{transaction.id}</TableCell>
                <TableCell>{transaction.user_email}</TableCell>
                <TableCell>{transaction.amount.toLocaleString()} credits</TableCell>
                <TableCell>{transaction.method}</TableCell>
                <TableCell>
                  <Chip
                    label={transaction.status}
                    color={
                      transaction.status === 'completed' ? 'success' :
                      transaction.status === 'pending' ? 'warning' : 'error'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>{formatDate(transaction.timestamp)}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleViewTransaction(transaction)}
                  >
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {transactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No transactions found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalTransactions}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
      
      {/* Transaction Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Transaction Details</DialogTitle>
        <DialogContent dividers>
          {selectedTransaction && (
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Transaction ID
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedTransaction.id}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  User ID
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedTransaction.user_id}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  User Email
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedTransaction.user_email}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Amount
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedTransaction.amount.toLocaleString()} credits
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Payment Method
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedTransaction.method}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <Chip
                    label={selectedTransaction.status}
                    color={
                      selectedTransaction.status === 'completed' ? 'success' :
                      selectedTransaction.status === 'pending' ? 'warning' : 'error'
                    }
                    size="small"
                  />
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Payment ID
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedTransaction.payment_id || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Timestamp
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formatDate(selectedTransaction.timestamp)}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TransactionHistory;
