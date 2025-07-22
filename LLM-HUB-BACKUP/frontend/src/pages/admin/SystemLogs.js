import React, { useState, useEffect, useCallback } from 'react';
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
  TextField
} from '@mui/material';
// Using simple TextField for date input instead of DatePicker
import {
  Visibility as VisibilityIcon,
  FileDownload as FileDownloadIcon,
  Code as CodeIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';

// API URL from environment variable
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const SystemLogs = () => {
  const { theme } = useTheme();
  
  // State
  const [logs, setLogs] = useState([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedLog, setSelectedLog] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [jsonViewOpen, setJsonViewOpen] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [logType, setLogType] = useState('');
  const [source, setSource] = useState('');
  
  // Fetch system logs
  const fetchLogs = async () => {
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
      if (logType) {
        params.log_type = logType;
      }
      if (source) {
        params.source = source;
      }
      
      // Fetch system logs with pagination and filters
      const response = await axios.get(`${API_URL}/admin/system-logs`, { params });
      
      setLogs(response.data.logs);
      setTotalLogs(response.data.total);
    } catch (err) {
      console.error('Error fetching system logs:', err);
      setError('Failed to load system logs');
    } finally {
      setLoading(false);
    }
  };
  
  // Initial fetch
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchLogs();
  }, [startDate, endDate, logType, source]);
  
  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Handle view log details
  const handleViewLog = (log) => {
    setSelectedLog(log);
    setDetailsOpen(true);
  };
  
  // Handle view JSON details
  const handleViewJson = () => {
    setDetailsOpen(false);
    setJsonViewOpen(true);
  };
  
  // Handle export to CSV
  const handleExportCSV = () => {
    // Create CSV content
    const headers = ['ID', 'Type', 'Source', 'Message', 'User Email', 'Timestamp'];
    const csvContent = [
      headers.join(','),
      ...logs.map(log => [
        log.id,
        log.log_type,
        log.source,
        `"${log.message.replace(/"/g, '""')}"`,
        log.user_email || 'N/A',
        new Date(log.timestamp).toLocaleString()
      ].join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `system_logs_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Handle reset filters
  const handleResetFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setLogType('');
    setSource('');
    setPage(0);
  };
  
  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };
  
  // Get log type color
  const getLogTypeColor = (type) => {
    switch (type) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'default';
    }
  };
  
  if (loading && logs.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        System Logs & Monitoring
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Monitor system events and errors
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
              <InputLabel>Log Type</InputLabel>
              <Select
                value={logType}
                onChange={(e) => setLogType(e.target.value)}
                label="Log Type"
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="error">Error</MenuItem>
                <MenuItem value="warning">Warning</MenuItem>
                <MenuItem value="info">Info</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Source</InputLabel>
              <Select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                label="Source"
              >
                <MenuItem value="">All Sources</MenuItem>
                <MenuItem value="payment">Payment</MenuItem>
                <MenuItem value="model_api">Model API</MenuItem>
                <MenuItem value="credit_system">Credit System</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="auth">Authentication</MenuItem>
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
              disabled={logs.length === 0}
            >
              Export to CSV
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* System Logs Table */}
      <TableContainer component={Paper} sx={{ bgcolor: theme === 'dark' ? '#1e1e1e' : 'white' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Source</TableCell>
              <TableCell>Message</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Timestamp</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{log.id}</TableCell>
                <TableCell>
                  <Chip
                    label={log.log_type}
                    color={getLogTypeColor(log.log_type)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{log.source}</TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      maxWidth: 300,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {log.message}
                  </Typography>
                </TableCell>
                <TableCell>{log.user_email || 'N/A'}</TableCell>
                <TableCell>{formatDate(log.timestamp)}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleViewLog(log)}
                  >
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {logs.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No system logs found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalLogs}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
      
      {/* Log Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>System Log Details</DialogTitle>
        <DialogContent dividers>
          {selectedLog && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Log ID
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedLog.id}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Timestamp
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formatDate(selectedLog.timestamp)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Log Type
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <Chip
                    label={selectedLog.log_type}
                    color={getLogTypeColor(selectedLog.log_type)}
                    size="small"
                  />
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Source
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedLog.source}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Message
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedLog.message}
                </Typography>
              </Grid>
              {selectedLog.user_id && (
                <>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      User ID
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {selectedLog.user_id}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      User Email
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {selectedLog.user_email || 'N/A'}
                    </Typography>
                  </Grid>
                </>
              )}
              {selectedLog.details && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<CodeIcon />}
                      onClick={handleViewJson}
                    >
                      View Details JSON
                    </Button>
                  </Box>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      
      {/* JSON Viewer Dialog */}
      <Dialog
        open={jsonViewOpen}
        onClose={() => setJsonViewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>JSON Details</DialogTitle>
        <DialogContent dividers>
          {selectedLog && selectedLog.details && (
            <Box
              component="pre"
              sx={{
                p: 2,
                bgcolor: theme === 'dark' ? '#121212' : '#f5f5f5',
                borderRadius: 1,
                overflow: 'auto',
                maxHeight: '60vh',
                '&::-webkit-scrollbar': {
                  width: '8px',
                  height: '8px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: theme === 'dark' ? '#555' : '#bbb',
                  borderRadius: '4px',
                },
              }}
            >
              {JSON.stringify(JSON.parse(selectedLog.details), null, 2)}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={() => {
              // Create download link for JSON
              const blob = new Blob([selectedLog.details], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.setAttribute('href', url);
              link.setAttribute('download', `log_details_${selectedLog.id}.json`);
              link.style.visibility = 'hidden';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            startIcon={<FileDownloadIcon />}
          >
            Download JSON
          </Button>
          <Button onClick={() => setJsonViewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SystemLogs;
