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
  TextField,
  FormControlLabel,
  Switch,
  Tooltip,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  SupervisorAccount as SupervisorAccountIcon,
  AdminPanelSettings as AdminPanelIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';

// API URL from environment variable
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const AdminRoles = () => {
  const { theme } = useTheme();
  
  // State
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    is_super_admin: false
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Fetch admins
  const fetchAdmins = async () => {
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
      
      // Fetch users with admin flag
      const response = await axios.get(`${API_URL}/admin/users`, {
        params: {
          is_admin: true
        }
      });
      
      // Filter only admin users
      const adminUsers = response.data.users.filter(user => user.is_admin === 1);
      setAdmins(adminUsers);
    } catch (err) {
      console.error('Error fetching admins:', err);
      setError('Failed to load admin users');
    } finally {
      setLoading(false);
    }
  };
  
  // Initial fetch
  useEffect(() => {
    fetchAdmins();
  }, []);
  
  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle switch change
  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };
  
  // Handle create dialog open
  const handleCreateDialogOpen = () => {
    setFormData({
      email: '',
      name: '',
      password: '',
      is_super_admin: false
    });
    setCreateDialogOpen(true);
  };
  
  // Handle edit dialog open
  const handleEditDialogOpen = (admin) => {
    setSelectedAdmin(admin);
    setFormData({
      email: admin.email,
      name: admin.name,
      password: '',
      is_super_admin: admin.is_super_admin === 1
    });
    setEditDialogOpen(true);
  };
  
  // Handle delete dialog open
  const handleDeleteDialogOpen = (admin) => {
    setSelectedAdmin(admin);
    setDeleteDialogOpen(true);
  };
  
  // Handle create admin
  const handleCreateAdmin = async () => {
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
      
      // Check if user already exists
      const checkResponse = await axios.get(`${API_URL}/admin/users`, {
        params: {
          search: formData.email
        }
      });
      
      let userId;
      
      if (checkResponse.data.users.some(user => user.email === formData.email)) {
        // User exists, update to admin
        const existingUser = checkResponse.data.users.find(user => user.email === formData.email);
        userId = existingUser.id;
        
        // Update user to admin
        const updateForm = new FormData();
        updateForm.append('is_admin', 'true');
        updateForm.append('is_super_admin', formData.is_super_admin ? 'true' : 'false');
        
        await axios.put(`${API_URL}/admin/users/${userId}/admin-status`, updateForm);
      } else {
        // Create new user with admin flag
        const createForm = new FormData();
        createForm.append('email', formData.email);
        createForm.append('name', formData.name);
        createForm.append('password', formData.password);
        createForm.append('is_admin', 'true');
        createForm.append('is_super_admin', formData.is_super_admin ? 'true' : 'false');
        
        const createResponse = await axios.post(`${API_URL}/admin/users/create-admin`, createForm);
        userId = createResponse.data.user_id;
      }
      
      // Close dialog
      setCreateDialogOpen(false);
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Admin user created successfully',
        severity: 'success'
      });
      
      // Refresh admins
      fetchAdmins();
    } catch (err) {
      console.error('Error creating admin:', err);
      setSnackbar({
        open: true,
        message: 'Failed to create admin user',
        severity: 'error'
      });
    } finally {
      setActionLoading(false);
    }
  };
  
  // Handle update admin
  const handleUpdateAdmin = async () => {
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
      const form = new FormData();
      form.append('name', formData.name);
      form.append('is_super_admin', formData.is_super_admin ? 'true' : 'false');
      
      // If password is provided, update it
      if (formData.password) {
        form.append('password', formData.password);
      }
      
      // Update admin
      await axios.put(`${API_URL}/admin/users/${selectedAdmin.id}/update-admin`, form);
      
      // Close dialog
      setEditDialogOpen(false);
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Admin user updated successfully',
        severity: 'success'
      });
      
      // Refresh admins
      fetchAdmins();
    } catch (err) {
      console.error('Error updating admin:', err);
      setSnackbar({
        open: true,
        message: 'Failed to update admin user',
        severity: 'error'
      });
    } finally {
      setActionLoading(false);
    }
  };
  
  // Handle remove admin
  const handleRemoveAdmin = async () => {
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
      const form = new FormData();
      form.append('is_admin', 'false');
      
      // Remove admin privileges
      await axios.put(`${API_URL}/admin/users/${selectedAdmin.id}/admin-status`, form);
      
      // Close dialog
      setDeleteDialogOpen(false);
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Admin privileges removed successfully',
        severity: 'success'
      });
      
      // Refresh admins
      fetchAdmins();
    } catch (err) {
      console.error('Error removing admin:', err);
      setSnackbar({
        open: true,
        message: 'Failed to remove admin privileges',
        severity: 'error'
      });
    } finally {
      setActionLoading(false);
    }
  };
  
  // Handle close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };
  
  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };
  
  if (loading && admins.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Admin Role Management
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Manage admin users and their permissions
      </Typography>
      
      <Divider sx={{ mb: 4 }} />
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* Actions */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateDialogOpen}
        >
          Add New Admin
        </Button>
      </Box>
      
      {/* Admins Table */}
      <TableContainer component={Paper} sx={{ bgcolor: theme === 'dark' ? '#1e1e1e' : 'white' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {admins.map((admin) => (
              <TableRow key={admin.id}>
                <TableCell>{admin.id}</TableCell>
                <TableCell>{admin.name}</TableCell>
                <TableCell>{admin.email}</TableCell>
                <TableCell>
                  {admin.is_super_admin === 1 ? (
                    <Chip
                      icon={<SupervisorAccountIcon />}
                      label="Super Admin"
                      color="secondary"
                      size="small"
                    />
                  ) : (
                    <Chip
                      icon={<AdminPanelIcon />}
                      label="Admin"
                      color="primary"
                      size="small"
                    />
                  )}
                </TableCell>
                <TableCell>{formatDate(admin.signup_date)}</TableCell>
                <TableCell>
                  <Tooltip title="Edit Admin">
                    <IconButton
                      size="small"
                      onClick={() => handleEditDialogOpen(admin)}
                      disabled={actionLoading}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Remove Admin Privileges">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteDialogOpen(admin)}
                      disabled={actionLoading}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {admins.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No admin users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Create Admin Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Admin</DialogTitle>
        <DialogContent dividers>
          <Alert severity="info" sx={{ mb: 2 }}>
            If the email already exists, the user will be promoted to admin. Otherwise, a new admin user will be created.
          </Alert>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                name="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                fullWidth
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Name"
                value={formData.name}
                onChange={handleInputChange}
                fullWidth
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="password"
                label="Password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                fullWidth
                required
                margin="normal"
                helperText="Minimum 6 characters"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    name="is_super_admin"
                    checked={formData.is_super_admin}
                    onChange={handleSwitchChange}
                    color="secondary"
                  />
                }
                label="Super Admin (full access to all features)"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateAdmin}
            variant="contained"
            disabled={actionLoading || !formData.email || !formData.name || !formData.password}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Create Admin'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit Admin Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Admin</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Email"
                value={formData.email}
                fullWidth
                margin="normal"
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Name"
                value={formData.name}
                onChange={handleInputChange}
                fullWidth
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="password"
                label="New Password (leave blank to keep current)"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                helperText="Leave blank to keep current password"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    name="is_super_admin"
                    checked={formData.is_super_admin}
                    onChange={handleSwitchChange}
                    color="secondary"
                  />
                }
                label="Super Admin (full access to all features)"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleUpdateAdmin}
            variant="contained"
            disabled={actionLoading || !formData.name}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Update Admin'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Remove Admin Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Remove Admin Privileges</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove admin privileges from {selectedAdmin?.name}? They will still be able to use the platform as a regular user.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleRemoveAdmin}
            color="error"
            variant="contained"
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Remove Admin'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminRoles;
