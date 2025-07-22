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

const TaskLogs = () => {
  const { theme } = useTheme();
  
  // State
  const [taskLogs, setTaskLogs] = useState([]);
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
  const [taskType, setTaskType] = useState('');
  const [modelUsed, setModelUsed] = useState('');
  
  // Fetch task logs
  const fetchTaskLogs = async () => {
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
      if (taskType) {
        params.task_type = taskType;
      }
      if (modelUsed) {
        params.model_used = modelUsed;
      }
      
      // Fetch task logs with pagination and filters
      const response = await axios.get(`${API_URL}/admin/task-logs`, { params });
      
      setTaskLogs(response.data.task_logs);
      setTotalLogs(response.data.total);
    } catch (err) {
      console.error('Error fetching task logs:', err);
      setError('Failed to load task logs');
    } finally {
      setLoading(false);
    }
  };
  
  // Initial fetch
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchTaskLogs();
  }, [page, rowsPerPage, startDate, endDate, taskType, modelUsed]);
  
  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Handle view task log details
  const handleViewTaskLog = async (logId) => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setError('Authentication token not found');
        setLoading(false);
        return;
      }
      
      // Set auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Fetch task log details
      const response = await axios.get(`${API_URL}/admin/task-logs/${logId}`);
      
      setSelectedLog(response.data);
      setDetailsOpen(true);
    } catch (err) {
      console.error('Error fetching task log details:', err);
      setError('Failed to load task log details');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle view JSON result
  const handleViewJson = () => {
    setDetailsOpen(false);
    setJsonViewOpen(true);
  };
  
  // Handle export to CSV
  const handleExportCSV = () => {
    // Create CSV content
    const headers = ['ID', 'User Email', 'Task Type', 'Model Used', 'Tokens Used', 'Credit Cost', 'Timestamp'];
    const csvContent = [
      headers.join(','),
      ...taskLogs.map(log => [
        log.id,
        `"${log.user_email.replace(/"/g, '""')}"`,
        log.task_type,
        log.model_used,
        log.tokens_used,
        log.credit_cost,
        new Date(log.timestamp).toLocaleString()
      ].join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `task_logs_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Handle reset filters
  const handleResetFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setTaskType('');
    setModelUsed('');
    setPage(0);
  };
  
  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };
  
  if (loading && taskLogs.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Task Logs Viewer
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        View and analyze task execution logs
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
              <InputLabel>Task Type</InputLabel>
              <Select
                value={taskType}
                onChange={(e) => setTaskType(e.target.value)}
                label="Task Type"
              >
                <MenuItem value="">All Task Types</MenuItem>
                <MenuItem value="resume_analysis">Resume Analysis</MenuItem>
                <MenuItem value="object_detection">Object Detection</MenuItem>
                <MenuItem value="invoice_extraction">Invoice Extraction</MenuItem>
                <MenuItem value="text_summarization">Text Summarization</MenuItem>
                <MenuItem value="sentiment_analysis">Sentiment Analysis</MenuItem>
                <MenuItem value="custom_prompt">Custom Prompt</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Model</InputLabel>
              <Select
                value={modelUsed}
                onChange={(e) => setModelUsed(e.target.value)}
                label="Model"
              >
                <MenuItem value="">All Models</MenuItem>
                <MenuItem value="gpt-4">GPT-4</MenuItem>
                <MenuItem value="gpt-3.5-turbo">GPT-3.5 Turbo</MenuItem>
                <MenuItem value="mistral-7b">Mistral 7B</MenuItem>
                <MenuItem value="claude-2">Claude 2</MenuItem>
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
              disabled={taskLogs.length === 0}
            >
              Export to CSV
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Task Logs Table */}
      <TableContainer component={Paper} sx={{ bgcolor: theme === 'dark' ? '#1e1e1e' : 'white' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Task Type</TableCell>
              <TableCell>Model</TableCell>
              <TableCell>Tokens</TableCell>
              <TableCell>Credits</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {taskLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{log.id}</TableCell>
                <TableCell>{log.user_email}</TableCell>
                <TableCell>
                  <Chip
                    label={log.task_type.replace('_', ' ')}
                    color="primary"
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>{log.model_used}</TableCell>
                <TableCell>{log.tokens_used.toLocaleString()}</TableCell>
                <TableCell>{log.credit_cost.toLocaleString()}</TableCell>
                <TableCell>{formatDate(log.timestamp)}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleViewTaskLog(log.id)}
                    disabled={loading}
                  >
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {taskLogs.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No task logs found
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
      
      {/* Task Log Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Task Log Details</DialogTitle>
        <DialogContent dividers>
          {selectedLog && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Task ID
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedLog.id}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  User
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedLog.user_email} (ID: {selectedLog.user_id})
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Task Type
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedLog.task_type}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Model Used
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedLog.model_used}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Tokens Used
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedLog.tokens_used.toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Credit Cost
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedLog.credit_cost.toLocaleString()}
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
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<CodeIcon />}
                    onClick={handleViewJson}
                    disabled={!selectedLog.result_json}
                  >
                    View JSON Result
                  </Button>
                </Box>
              </Grid>
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
        <DialogTitle>JSON Result</DialogTitle>
        <DialogContent dividers>
          {selectedLog && selectedLog.result_json && (
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
              {JSON.stringify(selectedLog.result_json, null, 2)}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={() => {
              // Create download link for JSON
              const blob = new Blob([JSON.stringify(selectedLog.result_json, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.setAttribute('href', url);
              link.setAttribute('download', `task_result_${selectedLog.id}.json`);
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

export default TaskLogs;
