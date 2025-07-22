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
  Switch,
  FormControlLabel,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocalOffer as OfferIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';

// API URL from environment variable
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const CreditPackages = () => {
  const { theme } = useTheme();
  
  // State
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    credits: '',
    price_inr: '',
    price_usd: '',
    is_active: true,
    is_promotional: false,
    discount_percentage: '0'
  });
  const [actionLoading, setActionLoading] = useState(false);
  
  // Fetch credit packages
  const fetchPackages = async () => {
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
      
      // Fetch credit packages
      const response = await axios.get(`${API_URL}/admin/credit-packages`);
      
      setPackages(response.data);
    } catch (err) {
      console.error('Error fetching credit packages:', err);
      setError('Failed to load credit packages');
    } finally {
      setLoading(false);
    }
  };
  
  // Initial fetch
  useEffect(() => {
    fetchPackages();
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
      name: '',
      credits: '',
      price_inr: '',
      price_usd: '',
      is_active: true,
      is_promotional: false,
      discount_percentage: '0'
    });
    setCreateDialogOpen(true);
  };
  
  // Handle edit dialog open
  const handleEditDialogOpen = (pkg) => {
    setSelectedPackage(pkg);
    setFormData({
      name: pkg.name,
      credits: pkg.credits.toString(),
      price_inr: pkg.price_inr.toString(),
      price_usd: pkg.price_usd.toString(),
      is_active: pkg.is_active === 1,
      is_promotional: pkg.is_promotional === 1,
      discount_percentage: pkg.discount_percentage.toString()
    });
    setEditDialogOpen(true);
  };
  
  // Handle delete dialog open
  const handleDeleteDialogOpen = (pkg) => {
    setSelectedPackage(pkg);
    setDeleteDialogOpen(true);
  };
  
  // Handle create package
  const handleCreatePackage = async () => {
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
      form.append('credits', formData.credits);
      form.append('price_inr', formData.price_inr);
      form.append('price_usd', formData.price_usd);
      form.append('is_promotional', formData.is_promotional);
      form.append('discount_percentage', formData.discount_percentage);
      
      // Create package
      await axios.post(`${API_URL}/admin/credit-packages`, form);
      
      // Close dialog
      setCreateDialogOpen(false);
      
      // Refresh packages
      fetchPackages();
    } catch (err) {
      console.error('Error creating credit package:', err);
      setError('Failed to create credit package');
    } finally {
      setActionLoading(false);
    }
  };
  
  // Handle update package
  const handleUpdatePackage = async () => {
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
      form.append('credits', formData.credits);
      form.append('price_inr', formData.price_inr);
      form.append('price_usd', formData.price_usd);
      form.append('is_active', formData.is_active);
      form.append('is_promotional', formData.is_promotional);
      form.append('discount_percentage', formData.discount_percentage);
      
      // Update package
      await axios.put(`${API_URL}/admin/credit-packages/${selectedPackage.id}`, form);
      
      // Close dialog
      setEditDialogOpen(false);
      
      // Refresh packages
      fetchPackages();
    } catch (err) {
      console.error('Error updating credit package:', err);
      setError('Failed to update credit package');
    } finally {
      setActionLoading(false);
    }
  };
  
  // Handle delete package
  const handleDeletePackage = async () => {
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
      
      // Delete package
      await axios.delete(`${API_URL}/admin/credit-packages/${selectedPackage.id}`);
      
      // Close dialog
      setDeleteDialogOpen(false);
      
      // Refresh packages
      fetchPackages();
    } catch (err) {
      console.error('Error deleting credit package:', err);
      setError('Failed to delete credit package');
    } finally {
      setActionLoading(false);
    }
  };
  
  // Format currency
  const formatCurrency = (value, currency) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Calculate effective price after discount
  const calculateEffectivePrice = (price, isPromotional, discountPercentage) => {
    if (isPromotional === 1 && discountPercentage > 0) {
      return price * (1 - discountPercentage / 100);
    }
    return price;
  };
  
  if (loading && packages.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Credit Packages Management
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Manage credit packages and pricing
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
          Add New Package
        </Button>
      </Box>
      
      {/* Credit Packages Table */}
      <TableContainer component={Paper} sx={{ bgcolor: theme === 'dark' ? '#1e1e1e' : 'white' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Credits</TableCell>
              <TableCell>Price (INR)</TableCell>
              <TableCell>Price (USD)</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Promotion</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {packages.map((pkg) => (
              <TableRow key={pkg.id}>
                <TableCell>{pkg.id}</TableCell>
                <TableCell>{pkg.name}</TableCell>
                <TableCell>{pkg.credits.toLocaleString()}</TableCell>
                <TableCell>
                  {pkg.is_promotional === 1 && pkg.discount_percentage > 0 ? (
                    <>
                      <Typography
                        variant="body2"
                        sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
                      >
                        {formatCurrency(pkg.price_inr, 'INR')}
                      </Typography>
                      <Typography variant="body1" color="success.main">
                        {formatCurrency(
                          calculateEffectivePrice(pkg.price_inr, pkg.is_promotional, pkg.discount_percentage),
                          'INR'
                        )}
                      </Typography>
                    </>
                  ) : (
                    formatCurrency(pkg.price_inr, 'INR')
                  )}
                </TableCell>
                <TableCell>
                  {pkg.is_promotional === 1 && pkg.discount_percentage > 0 ? (
                    <>
                      <Typography
                        variant="body2"
                        sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
                      >
                        {formatCurrency(pkg.price_usd, 'USD')}
                      </Typography>
                      <Typography variant="body1" color="success.main">
                        {formatCurrency(
                          calculateEffectivePrice(pkg.price_usd, pkg.is_promotional, pkg.discount_percentage),
                          'USD'
                        )}
                      </Typography>
                    </>
                  ) : (
                    formatCurrency(pkg.price_usd, 'USD')
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    label={pkg.is_active === 1 ? 'Active' : 'Inactive'}
                    color={pkg.is_active === 1 ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {pkg.is_promotional === 1 ? (
                    <Chip
                      icon={<OfferIcon />}
                      label={`${pkg.discount_percentage}% Off`}
                      color="secondary"
                      size="small"
                    />
                  ) : (
                    <Chip
                      label="Regular"
                      color="default"
                      size="small"
                      variant="outlined"
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Tooltip title="Edit Package">
                    <IconButton
                      size="small"
                      onClick={() => handleEditDialogOpen(pkg)}
                      disabled={actionLoading}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Package">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteDialogOpen(pkg)}
                      disabled={actionLoading}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {packages.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No credit packages found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Create Package Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Credit Package</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Package Name"
                value={formData.name}
                onChange={handleInputChange}
                fullWidth
                required
                margin="normal"
                placeholder="e.g., Basic, Standard, Premium"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="credits"
                label="Credits"
                type="number"
                value={formData.credits}
                onChange={handleInputChange}
                fullWidth
                required
                margin="normal"
                placeholder="e.g., 500"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="price_inr"
                label="Price (INR)"
                type="number"
                value={formData.price_inr}
                onChange={handleInputChange}
                fullWidth
                required
                margin="normal"
                placeholder="e.g., 999"
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="price_usd"
                label="Price (USD)"
                type="number"
                value={formData.price_usd}
                onChange={handleInputChange}
                fullWidth
                required
                margin="normal"
                placeholder="e.g., 12.99"
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    name="is_promotional"
                    checked={formData.is_promotional}
                    onChange={handleSwitchChange}
                    color="secondary"
                  />
                }
                label="Promotional Offer"
              />
            </Grid>
            {formData.is_promotional && (
              <Grid item xs={12}>
                <TextField
                  name="discount_percentage"
                  label="Discount Percentage"
                  type="number"
                  value={formData.discount_percentage}
                  onChange={handleInputChange}
                  fullWidth
                  margin="normal"
                  placeholder="e.g., 15"
                  InputProps={{
                    endAdornment: <Typography sx={{ ml: 1 }}>%</Typography>,
                  }}
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreatePackage}
            variant="contained"
            disabled={actionLoading || !formData.name || !formData.credits || !formData.price_inr || !formData.price_usd}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Create Package'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit Package Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Credit Package</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Package Name"
                value={formData.name}
                onChange={handleInputChange}
                fullWidth
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="credits"
                label="Credits"
                type="number"
                value={formData.credits}
                onChange={handleInputChange}
                fullWidth
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="price_inr"
                label="Price (INR)"
                type="number"
                value={formData.price_inr}
                onChange={handleInputChange}
                fullWidth
                required
                margin="normal"
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="price_usd"
                label="Price (USD)"
                type="number"
                value={formData.price_usd}
                onChange={handleInputChange}
                fullWidth
                required
                margin="normal"
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleSwitchChange}
                    color="success"
                  />
                }
                label="Active"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    name="is_promotional"
                    checked={formData.is_promotional}
                    onChange={handleSwitchChange}
                    color="secondary"
                  />
                }
                label="Promotional Offer"
              />
            </Grid>
            {formData.is_promotional && (
              <Grid item xs={12}>
                <TextField
                  name="discount_percentage"
                  label="Discount Percentage"
                  type="number"
                  value={formData.discount_percentage}
                  onChange={handleInputChange}
                  fullWidth
                  margin="normal"
                  InputProps={{
                    endAdornment: <Typography sx={{ ml: 1 }}>%</Typography>,
                  }}
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleUpdatePackage}
            variant="contained"
            disabled={actionLoading || !formData.name || !formData.credits || !formData.price_inr || !formData.price_usd}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Update Package'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Package Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Credit Package</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the "{selectedPackage?.name}" package? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeletePackage}
            color="error"
            variant="contained"
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CreditPackages;
