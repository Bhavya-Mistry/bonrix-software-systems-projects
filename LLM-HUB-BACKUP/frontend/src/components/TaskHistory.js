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
  TablePagination,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import axios from 'axios';

// API URL from environment variable
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const TaskHistory = () => {
  // State for task logs and loading
  const [taskLogs, setTaskLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  // Fetch task logs on component mount
  useEffect(() => {
    const fetchTaskLogs = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(`${API_URL}/users/tasks`);
        console.log('Task Logs Response:', response.data);
        
        // Sort task logs by timestamp in descending order (newest first)
        const sortedLogs = response.data.sort((a, b) => {
          return new Date(b.timestamp) - new Date(a.timestamp);
        });
        
        setTaskLogs(sortedLogs);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching task history:', err);
        setError('Failed to load task history. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchTaskLogs();
  }, []);
  
  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
  
  // Get task type display name
  const getTaskTypeDisplay = (taskType) => {
    const taskTypes = {
      'resume_analysis': 'Resume Analysis',
      'object_detection': 'Object Detection',
      'invoice_extraction': 'Invoice Extraction',
      'text_summarization': 'Text Summarization',
      'sentiment_analysis': 'Sentiment Analysis',
      'custom_prompt': 'Custom Prompt'
    };
    
    return taskTypes[taskType] || taskType;
  };
  
  // Get model display name
  const getModelDisplay = (model) => {
    if (model.includes('gpt-4')) return 'GPT-4';
    if (model.includes('gpt-3.5')) return 'GPT-3.5';
    if (model.includes('mistral')) return 'Mistral AI';
    if (model.includes('claude')) return 'Claude';
    return model;
  };
  
  // Get chip color based on task type
  const getTaskTypeColor = (taskType) => {
    const colors = {
      'resume_analysis': 'primary',
      'object_detection': 'secondary',
      'invoice_extraction': 'success',
      'text_summarization': 'info',
      'sentiment_analysis': 'warning',
      'custom_prompt': 'default'
    };
    
    return colors[taskType] || 'default';
  };

  // Aggregate task data for graph
  const aggregateTaskData = () => {
    const taskCount = {};
    taskLogs.forEach((task) => {
      const type = getTaskTypeDisplay(task.task_type);
      taskCount[type] = (taskCount[type] || 0) + 1;
    });
    return taskCount;
  };

  // Format task data for graph
  const formatDataForGraph = () => {
    const taskData = aggregateTaskData();
    return Object.entries(taskData).map(([type, count]) => ({
      type,
      count
    }));
  };

  // Example usage of aggregateTaskData and formatDataForGraph
  console.log('Aggregated Task Data:', aggregateTaskData());
  console.log('Graph Data:', formatDataForGraph());

  return (
    <Paper elevation={1} sx={{ p: 3, mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Task History
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
      ) : (
        <>
          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Task Type</TableCell>
                  <TableCell>Model Used</TableCell>
                  <TableCell>Tokens</TableCell>
                  <TableCell align="right">Credits Used</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {taskLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No task history found. Complete a task to see it here.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  taskLogs
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>{formatDate(task.timestamp)}</TableCell>
                        <TableCell>
                          <Chip 
                            label={getTaskTypeDisplay(task.task_type)} 
                            color={getTaskTypeColor(task.task_type)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{getModelDisplay(task.model_used)}</TableCell>
                        <TableCell>{task.tokens_used.toLocaleString()}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                          -{task.credit_cost.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={taskLogs.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}
    </Paper>
  );
};

export default TaskHistory;
