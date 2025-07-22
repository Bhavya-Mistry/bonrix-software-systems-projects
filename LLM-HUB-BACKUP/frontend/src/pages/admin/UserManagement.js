import React, { useState, useEffect } from 'react';
import AssignCredits from './AssignCredits';
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
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Alert,
  Chip,
  Tooltip,
  Grid,
  InputAdornment,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Visibility as VisibilityIcon,
  FileDownload as FileDownloadIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';

// API URL from environment variable
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const UserManagement = () => {
  // Get theme from context
  const { theme } = useTheme();
  
  // State - with safe defaults
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetailsOpen, setUserDetailsOpen] = useState(false);
  const [banUserOpen, setBanUserOpen] = useState(false);
  
  // CRUD operation states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editCreditsOpen, setEditCreditsOpen] = useState(false);
  const [newCredits, setNewCredits] = useState('');
  
  // New user form state
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    credits: 0,
    is_admin: false
  });
  
  // Edit user form state
  const [editUser, setEditUser] = useState({
    id: null,
    name: '',
    email: '',
    credits: 0,
    is_admin: false
  });
  
  // Fetch users
  const fetchUsers = async () => {
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
      
      // Fetch users with pagination and search
      const response = await axios.get(`${API_URL}/admin/users`, {
        params: {
          skip: page * rowsPerPage,
          limit: rowsPerPage,
          search: searchQuery || undefined
        }
      });
      
      // Ensure we have valid user data before setting state
      if (response.data && Array.isArray(response.data.users)) {
        // Filter out any invalid users (without id)
        const validUsers = response.data.users.filter(user => user && user.id);
        setUsers(validUsers);
        setTotalUsers(response.data.total || validUsers.length);
      } else {
        setUsers([]);
        setTotalUsers(0);
        console.warn('Invalid user data received from API');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
      setUsers([]);
      setTotalUsers(0);
    } finally {
      setLoading(false);
    }
  };
  
  // Initial fetch
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // Initialize with safe defaults to prevent null reference errors
    setSelectedUser(null);
    setNewCredits('');
    
    fetchUsers();
  }, [page, rowsPerPage, searchQuery]);
  
  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Handle search
  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };
  
  // Handle view user details
  const handleViewUserDetails = (user) => {
    setSelectedUser(user);
    setUserDetailsOpen(true);
  };
  
  // Handle close user details
  const handleCloseUserDetails = () => {
    setUserDetailsOpen(false);
    setSelectedUser(null);
  };
  
  // Handle open create user dialog
  const handleOpenCreateDialog = () => {
    setNewUser({
      name: '',
      email: '',
      password: '',
      credits: 0,
      is_admin: false
    });
    setCreateDialogOpen(true);
  };
  
  // Handle close create user dialog
  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
  };
  
  // Handle create user form change
  const handleCreateUserChange = (event) => {
    const { name, value, type, checked } = event.target;
    setNewUser({
      ...newUser,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Handle create user submit
  const handleCreateUser = async () => {
    try {
      setActionLoading(true);
      
      // Create form data
      const formData = new FormData();
      formData.append('name', newUser.name);
      formData.append('email', newUser.email);
      formData.append('password', newUser.password);
      formData.append('credits', newUser.credits);
      formData.append('is_admin', newUser.is_admin);
      
      // Send request
      const token = localStorage.getItem('admin_token');
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      await axios.post(`${API_URL}/admin/users/create`, formData);
      
      // Close dialog and refresh users
      setCreateDialogOpen(false);
      fetchUsers();
      
      // Show success message
      setError(null);
    } catch (err) {
      console.error('Error creating user:', err);
      setError(err.response?.data?.detail || 'Error creating user');
    } finally {
      setActionLoading(false);
    }
  };
  
  // Handle open edit user dialog
  const handleOpenEditDialog = (user) => {
    setEditUser({
      id: user.id,
      name: user.name,
      email: user.email,
      credits: user.credits,
      is_admin: user.is_admin === 1
    });
    setEditDialogOpen(true);
  };
  
  // Handle close edit user dialog
  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
  };
  
  // Handle edit user form change
  const handleEditUserChange = (event) => {
    const { name, value, type, checked } = event.target;
    setEditUser({
      ...editUser,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Handle edit credits
  const handleEditCredits = (user) => {
    setSelectedUser(user);
    setNewCredits(user.credits);
    setEditCreditsOpen(true);
  };

  // Handle close edit credits dialog
  const handleCloseEditCredits = () => {
    setEditCreditsOpen(false);
    setSelectedUser(null);
    setNewCredits('');
  };

  // These functions have been replaced by the AssignCredits component
  // and are kept here as comments for reference
  /*
  const handleAssignCredits = (userId, userName, userCredits) => {
    // This functionality has been moved to the AssignCredits component
  };

  const handleCloseAssignCredits = () => {
    // This functionality has been moved to the AssignCredits component
  };
  */
  
  // Handle update credits
  const handleUpdateCredits = async () => {
    try {
      setActionLoading(true);
      
      // Create form data
      const formData = new FormData();
      formData.append('credits', newCredits);
      
      // Send request
      const token = localStorage.getItem('admin_token');
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      await axios.put(`${API_URL}/admin/users/${selectedUser.id}/credits`, formData);
      
      // Close dialog and refresh users
      setEditCreditsOpen(false);
      setSelectedUser(null);
      setNewCredits('');
      fetchUsers();
      
      // Show success message
      setError(null);
    } catch (err) {
      console.error('Error updating credits:', err);
      setError(err.response?.data?.detail || 'Error updating credits');
    } finally {
      setActionLoading(false);
    }
  };

  // This function has been replaced by the AssignCredits component
  // and is kept here as a comment for reference
  /*
  const handleAssignCreditsSubmit = async () => {
    // This functionality has been moved to the AssignCredits component
  };
  */
  
  // Handle ban user confirm
  const handleBanUserConfirm = async () => {
    try {
      setActionLoading(true);
      
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setError('Authentication token not found');
        setActionLoading(false);
        return;
      }
      
      // Set auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Create form data
      const formData = new FormData();
      formData.append('is_active', 'false');
      
      // Update user status
      await axios.put(`${API_URL}/admin/users/${selectedUser.id}/status`, formData);
      
      // Close dialog
      setBanUserOpen(false);
      setSelectedUser(null);
      
      // Refresh users
      fetchUsers();
      
      // Show success message
      setError(null);
    } catch (err) {
      console.error('Error banning user:', err);
      setError(err.response?.data?.detail || 'Error banning user');
    } finally {
      setActionLoading(false);
    }
  };
  
  // Handle edit user submit
  const handleUpdateUser = async () => {
    try {
      setActionLoading(true);
      
      // Create form data
      const formData = new FormData();
      formData.append('credits', editUser.credits);
      
      // Send request to update credits
      const token = localStorage.getItem('admin_token');
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      await axios.post(`${API_URL}/admin/users/${editUser.id}/credits`, formData);
      
      // Close dialog and refresh users
      setEditDialogOpen(false);
      fetchUsers();
      
      // Show success message
      setError(null);
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err.response?.data?.detail || 'Error updating user');
    } finally {
      setActionLoading(false);
    }
  };
  
  // Handle open delete user dialog
  const handleOpenDeleteDialog = (user) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };
  
  // Handle close delete user dialog
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedUser(null);
  };
  
  // Handle delete user
  const handleDeleteUser = async () => {
    try {
      setActionLoading(true);
      
      if (!selectedUser || !selectedUser.id) {
        setError('Invalid user selected for deletion');
        setActionLoading(false);
        return;
      }
      
      // Send request
      const token = localStorage.getItem('admin_token');
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      await axios.delete(`${API_URL}/admin/users/${selectedUser.id}`);
      
      // Close dialog and refresh users
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
      
      // Show success message
      setError(null);
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err.response?.data?.detail || 'Error deleting user');
    } finally {
      setActionLoading(false);
    }
  };
  
  // Handle view user details
  const handleViewUser = async (userId) => {
    // Validate userId before proceeding
    if (!userId) {
      console.error('Invalid userId provided to handleViewUser');
      setError('Invalid user ID');
      return;
    }

    try {
      setActionLoading(true);
      setError(null);
      
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setError('Authentication token not found');
        setActionLoading(false);
        return;
      }
      
      // Set auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Fetch user details
      const response = await axios.get(`${API_URL}/admin/users/${userId}`);
      
      setSelectedUser(response.data);
      setUserDetailsOpen(true);
    } catch (err) {
      console.error('Error fetching user details:', err);
      setError('Failed to load user details');
    } finally {
      setActionLoading(false);
    }
  };
  
  // Handle save credits
  const handleSaveCredits = async () => {
    try {
      setActionLoading(true);
      
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setError('Authentication token not found');
        setActionLoading(false);
        return;
      }
      
      // Set auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Create form data
      const formData = new FormData();
      formData.append('credits', newCredits);
      
      // Update user credits
      await axios.put(`${API_URL}/admin/users/${selectedUser.id}/credits`, formData);
      
      // Close dialog
      setEditCreditsOpen(false);
      
      // Refresh users
      fetchUsers();
    } catch (err) {
      console.error('Error updating credits:', err);
      setError('Failed to update credits');
    } finally {
      setActionLoading(false);
    }
  };
  
  // Handle ban user
  const handleBanUser = (user) => {
    setSelectedUser(user);
    setBanUserOpen(true);
  };
  
  // Handle confirm ban
  const handleConfirmBan = async () => {
    try {
      setActionLoading(true);
      
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setError('Authentication token not found');
        setActionLoading(false);
        return;
      }
      
      // Set auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Create form data
      const formData = new FormData();
      formData.append('is_active', 'false');
      
      // Update user status
      await axios.put(`${API_URL}/admin/users/${selectedUser.id}/status`, formData);
      
      // Close dialog
      setBanUserOpen(false);
      
      // Refresh users
      fetchUsers();
    } catch (err) {
      console.error('Error banning user:', err);
      setError('Failed to ban user');
    } finally {
      setActionLoading(false);
    }
  };
  
  // Handle unban user
  const handleUnbanUser = async (userId) => {
    try {
      setActionLoading(true);
      
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setError('Authentication token not found');
        setActionLoading(false);
        return;
      }
      
      // Set auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Create form data
      const formData = new FormData();
      formData.append('is_active', 'true');
      
      // Update user status
      await axios.put(`${API_URL}/admin/users/${userId}/status`, formData);
      
      // Refresh users
      fetchUsers();
    } catch (err) {
      console.error('Error unbanning user:', err);
      setError('Failed to unban user');
    } finally {
      setActionLoading(false);
    }
  };
  
  // Handle export to CSV
  const handleExportCSV = () => {
    // Create CSV content
    const headers = ['ID', 'Name', 'Email', 'Credits', 'Credits Purchased', 'Signup Date', 'Admin'];
    const csvContent = [
      headers.join(','),
      ...users.map(user => [
        user.id,
        `"${user.name.replace(/"/g, '""')}"`,
        `"${user.email.replace(/"/g, '""')}"`,
        user.credits,
        user.credits_purchased,
        new Date(user.signup_date).toLocaleDateString(),
        user.is_admin ? 'Yes' : 'No'
      ].join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `users_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) {
      return 'N/A';
    }
    return new Date(dateString).toLocaleString();
  };
  
  // Check if user is banned (negative credits)
  const isUserBanned = (user) => {
    if (!user || user.credits === undefined || user.credits === null) {
      return false;
    }
    return user.credits < 0;
  };
  
  if (loading && users.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        User Management
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Manage platform users and their credits
      </Typography>
      
      <Divider sx={{ mb: 4 }} />
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* Search and Actions */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search by name or email"
            value={searchQuery}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
          >
            Add User
          </Button>
          <Button
            variant="contained"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportCSV}
            disabled={users.length === 0}
          >
            Export to CSV
          </Button>
        </Grid>
      </Grid>
      
      {/* Users Table */}
      <TableContainer component={Paper} sx={{ bgcolor: theme === 'dark' ? '#1e1e1e' : 'white', '& .MuiTableCell-root': { position: 'relative' }, '& .MuiIconButton-root': { position: 'relative', zIndex: 10 } }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Credits</TableCell>
              <TableCell>Total Purchased</TableCell>
              <TableCell>Signup Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.filter(user => user && user.id).map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{(user.credits !== undefined && user.credits !== null) ? Number(user.credits).toLocaleString() : '0'}</TableCell>
                <TableCell>{(user.credits_purchased !== undefined && user.credits_purchased !== null) ? Number(user.credits_purchased).toLocaleString() : '0'}</TableCell>
                <TableCell>{user.signup_date ? formatDate(user.signup_date) : 'N/A'}</TableCell>
                <TableCell>
                  {isUserBanned(user) ? (
                    <Chip
                      label="Banned"
                      color="error"
                      size="small"
                    />
                  ) : user.is_admin ? (
                    <Chip
                      label="Admin"
                      color="primary"
                      size="small"
                    />
                  ) : (
                    <Chip
                      label="Active"
                      color="success"
                      size="small"
                    />
                  )}
                </TableCell>
                <TableCell>
                  {/* View Details Button */}
                  <Tooltip title="View Details">
                    <IconButton
                      size="small"
                      onClick={() => {
                        if (user && user.id) {
                          handleViewUser(user.id);
                        }
                      }}
                      disabled={actionLoading || !user || !user.id}
                      sx={{ cursor: 'pointer' }}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  
                  {/* Edit Credits Button */}
                  <Tooltip title="Edit Credits">  
                    <IconButton
                      size="small"
                      onClick={() => {
                        if (user && user.id) {
                          // Create a safe copy of the user object with default values
                          const safeUser = {
                            id: user.id,
                            name: user.name || 'User',
                            email: user.email || '',
                            credits: typeof user.credits === 'number' ? user.credits : 0
                          };
                          handleEditCredits(safeUser);
                        }
                      }}
                      sx={{ ml: 1, cursor: 'pointer' }}
                      disabled={actionLoading || !user || !user.id}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  
                  {/* Assign Credits Component */}
                  <Box component="span" sx={{ ml: 1, display: 'inline-block', position: 'relative', zIndex: 10 }}>
                    {user && (
                      <AssignCredits
                        userId={user.id}
                        userName={user.name}
                        userCredits={user.credits !== undefined ? user.credits : 0}
                        onSuccess={fetchUsers}
                        disabled={actionLoading || !user.id}
                      />
                    )}
                  </Box>
                  
                  {/* Edit User Button */}
                  <Tooltip title="Edit User">
                    <IconButton
                      size="small"
                      onClick={() => {
                        if (user && user.id) {
                          handleOpenEditDialog(user);
                        }
                      }}
                      disabled={actionLoading || !user || !user.id}
                      sx={{ cursor: 'pointer' }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  
                  {/* Delete User Button */}
                  <Tooltip title="Delete User">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => {
                        if (user && user.id) {
                          setSelectedUser(user);
                          setDeleteDialogOpen(true);
                        }
                      }}
                      disabled={actionLoading || !user || !user.id || user.is_admin === 1}
                      sx={{ cursor: 'pointer' }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  
                  {user && isUserBanned(user) ? (
                    <Tooltip title="Unban User">
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => {
                          if (user && user.id) {
                            handleUnbanUser(user.id);
                          }
                        }}
                        disabled={actionLoading || !user || !user.id}
                        sx={{ cursor: 'pointer' }}
                      >
                        <CheckCircleIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Tooltip title="Ban User">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          if (user && user.id) {
                            handleBanUser(user);
                          }
                        }}
                        disabled={actionLoading || !user || !user.id || user.is_admin}
                        sx={{ cursor: 'pointer' }}
                      >
                        <BlockIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalUsers}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
      
      {/* User Details Dialog */}
      <Dialog
        open={userDetailsOpen}
        onClose={() => setUserDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>User Details</DialogTitle>
        <DialogContent dividers>
          {selectedUser && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" color="text.secondary">
                    ID
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedUser.user.id}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Name
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedUser.user.name}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedUser.user.email}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Credits
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedUser.user.credits.toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Total Credits Purchased
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedUser.user.credits_purchased.toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Signup Date
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatDate(selectedUser.user.signup_date)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Status
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedUser.user.is_admin ? 'Admin' : (selectedUser.user.credits < 0 ? 'Banned' : 'Active')}
                  </Typography>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="h6" gutterBottom>
                Recent Transactions
              </Typography>
              <TableContainer component={Paper} sx={{ mb: 3, bgcolor: theme === 'dark' ? '#1e1e1e' : 'white' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Method</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedUser.recent_transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>{tx.id}</TableCell>
                        <TableCell>{tx.amount.toLocaleString()}</TableCell>
                        <TableCell>{tx.method}</TableCell>
                        <TableCell>
                          <Chip
                            label={tx.status}
                            color={tx.status === 'completed' ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{formatDate(tx.timestamp)}</TableCell>
                      </TableRow>
                    ))}
                    {selectedUser.recent_transactions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          No transactions found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Typography variant="h6" gutterBottom>
                Recent Tasks
              </Typography>
              <TableContainer component={Paper} sx={{ bgcolor: theme === 'dark' ? '#1e1e1e' : 'white' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Task Type</TableCell>
                      <TableCell>Model</TableCell>
                      <TableCell>Tokens</TableCell>
                      <TableCell>Credits</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedUser.recent_tasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>{task.id}</TableCell>
                        <TableCell>{task.task_type}</TableCell>
                        <TableCell>{task.model_used}</TableCell>
                        <TableCell>{task.tokens_used.toLocaleString()}</TableCell>
                        <TableCell>{task.credit_cost.toLocaleString()}</TableCell>
                        <TableCell>{formatDate(task.timestamp)}</TableCell>
                      </TableRow>
                    ))}
                    {selectedUser.recent_tasks.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          No tasks found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit Credits Dialog */}
      <Dialog
        open={editCreditsOpen}
        onClose={() => setEditCreditsOpen(false)}
      >
        <DialogTitle>Edit User Credits</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Update the credit balance for {selectedUser?.name}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Credits"
            type="number"
            fullWidth
            variant="outlined"
            value={newCredits}
            onChange={(e) => setNewCredits(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditCreditsOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveCredits} 
            variant="contained"
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Ban User Dialog */}
      <Dialog open={banUserOpen} onClose={() => setBanUserOpen(false)}>
        <DialogTitle>Ban User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to ban {selectedUser?.name}? This will prevent them from using the platform.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBanUserOpen(false)} disabled={actionLoading}>Cancel</Button>
          <Button onClick={handleConfirmBan} color="error" disabled={actionLoading}>
            {actionLoading ? <CircularProgress size={24} /> : 'Ban User'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Create User Dialog */}
      <Dialog open={createDialogOpen} onClose={handleCloseCreateDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <PersonIcon sx={{ mr: 1 }} />
            Create New User
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={newUser.name}
                  onChange={handleCreateUserChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={newUser.email}
                  onChange={handleCreateUserChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={newUser.password}
                  onChange={handleCreateUserChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Credits"
                  name="credits"
                  type="number"
                  value={newUser.credits}
                  onChange={handleCreateUserChange}
                  InputProps={{
                    inputProps: { min: 0 }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={newUser.is_admin}
                      onChange={handleCreateUserChange}
                      name="is_admin"
                      color="primary"
                    />
                  }
                  label="Admin User"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog} disabled={actionLoading}>Cancel</Button>
          <Button onClick={handleCreateUser} variant="contained" color="primary" disabled={actionLoading || !newUser.name || !newUser.email || !newUser.password}>
            {actionLoading ? <CircularProgress size={24} /> : 'Create User'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <EditIcon sx={{ mr: 1 }} />
            Edit User
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={editUser.name}
                  onChange={handleEditUserChange}
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={editUser.email}
                  onChange={handleEditUserChange}
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Credits"
                  name="credits"
                  type="number"
                  value={editUser.credits}
                  onChange={handleEditUserChange}
                  InputProps={{
                    inputProps: { min: 0 }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={editUser.is_admin}
                      onChange={handleEditUserChange}
                      name="is_admin"
                      color="primary"
                      disabled
                    />
                  }
                  label="Admin User"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog} disabled={actionLoading}>Cancel</Button>
          <Button onClick={handleUpdateUser} variant="contained" color="primary" disabled={actionLoading}>
            {actionLoading ? <CircularProgress size={24} /> : 'Update User'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete User Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {selectedUser?.name}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={actionLoading}>Cancel</Button>
          <Button onClick={handleDeleteUser} color="error" disabled={actionLoading}>
            {actionLoading ? <CircularProgress size={24} /> : 'Delete User'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit Credits Dialog */}
      <Dialog open={editCreditsOpen} onClose={handleCloseEditCredits}>
        <DialogTitle>Edit User Credits</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Update credits for {selectedUser?.name}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Credits"
            type="number"
            fullWidth
            value={newCredits}
            onChange={(e) => setNewCredits(e.target.value)}
            InputProps={{
              inputProps: { min: 0 }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditCredits} disabled={actionLoading}>Cancel</Button>
          <Button onClick={handleUpdateCredits} color="primary" variant="contained" disabled={actionLoading}>
            {actionLoading ? <CircularProgress size={24} /> : 'Update Credits'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* The Assign Credits Dialog has been replaced by the standalone AssignCredits component */}
    </Box>
  );
};

export default UserManagement;
