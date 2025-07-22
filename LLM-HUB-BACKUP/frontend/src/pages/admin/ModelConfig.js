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
  Tooltip,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  PowerSettingsNew as PowerIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';

// API URL from environment variable
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const ModelConfig = () => {
  const { theme } = useTheme();
  
  // State
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  const [formData, setFormData] = useState({
    model_name: '',
    provider: '',
    token_cost_multiplier: '1.0',
    description: '',
    is_active: true
  });
  const [actionLoading, setActionLoading] = useState(false);
  
  // Fetch models
  const fetchModels = async () => {
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
      
      // Fetch models
      const response = await axios.get(`${API_URL}/admin/model-configs`);
      
      setModels(response.data);
    } catch (err) {
      console.error('Error fetching models:', err);
      setError('Failed to load model configurations');
    } finally {
      setLoading(false);
    }
  };
  
  // Initial fetch
  useEffect(() => {
    fetchModels();
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
      model_name: '',
      provider: '',
      token_cost_multiplier: '1.0',
      description: '',
      is_active: true
    });
    setCreateDialogOpen(true);
  };
  
  // Handle edit dialog open
  const handleEditDialogOpen = (model) => {
    setSelectedModel(model);
    setFormData({
      model_name: model.model_name,
      provider: model.provider,
      token_cost_multiplier: model.token_cost_multiplier.toString(),
      description: model.description || '',
      is_active: model.is_active === 1
    });
    setEditDialogOpen(true);
  };
  
  // Handle toggle model status
  const handleToggleStatus = async (model) => {
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
      form.append('is_active', model.is_active === 1 ? 'false' : 'true');
      form.append('token_cost_multiplier', model.token_cost_multiplier.toString());
      form.append('description', model.description || '');
      
      // Update model
      await axios.put(`${API_URL}/admin/model-configs/${model.id}`, form);
      
      // Refresh models
      fetchModels();
    } catch (err) {
      console.error('Error toggling model status:', err);
      setError('Failed to update model status');
    } finally {
      setActionLoading(false);
    }
  };
  
  // Handle create model
  const handleCreateModel = async () => {
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
      form.append('model_name', formData.model_name);
      form.append('provider', formData.provider);
      form.append('token_cost_multiplier', formData.token_cost_multiplier);
      form.append('description', formData.description);
      
      // Create model
      await axios.post(`${API_URL}/admin/model-configs`, form);
      
      // Close dialog
      setCreateDialogOpen(false);
      
      // Refresh models
      fetchModels();
    } catch (err) {
      console.error('Error creating model:', err);
      setError('Failed to create model configuration');
    } finally {
      setActionLoading(false);
    }
  };
  
  // Handle update model
  const handleUpdateModel = async () => {
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
      form.append('is_active', formData.is_active ? 'true' : 'false');
      form.append('token_cost_multiplier', formData.token_cost_multiplier);
      form.append('description', formData.description);
      
      // Update model
      await axios.put(`${API_URL}/admin/model-configs/${selectedModel.id}`, form);
      
      // Close dialog
      setEditDialogOpen(false);
      
      // Refresh models
      fetchModels();
    } catch (err) {
      console.error('Error updating model:', err);
      setError('Failed to update model configuration');
    } finally {
      setActionLoading(false);
    }
  };
  
  // Group models by provider
  const modelsByProvider = models.reduce((acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  }, {});
  
  if (loading && models.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Model Configuration
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Manage LLM models and their settings
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
          Add New Model
        </Button>
      </Box>
      
      {/* Models by Provider */}
      {Object.keys(modelsByProvider).length > 0 ? (
        Object.entries(modelsByProvider).map(([provider, providerModels]) => (
          <Box key={provider} sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Chip
                label={provider.toUpperCase()}
                color="primary"
                size="small"
                sx={{ mr: 2 }}
              />
              Models
            </Typography>
            
            <TableContainer component={Paper} sx={{ bgcolor: theme === 'dark' ? '#1e1e1e' : 'white' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Model Name</TableCell>
                    <TableCell>Cost Multiplier</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Last Updated</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {providerModels.map((model) => (
                    <TableRow key={model.id}>
                      <TableCell>{model.id}</TableCell>
                      <TableCell>{model.model_name}</TableCell>
                      <TableCell>{model.token_cost_multiplier}x</TableCell>
                      <TableCell>{model.description || '-'}</TableCell>
                      <TableCell>
                        <Chip
                          label={model.is_active === 1 ? 'Active' : 'Disabled'}
                          color={model.is_active === 1 ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{new Date(model.updated_at).toLocaleString()}</TableCell>
                      <TableCell>
                        <Tooltip title="Edit Model">
                          <IconButton
                            size="small"
                            onClick={() => handleEditDialogOpen(model)}
                            disabled={actionLoading}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={model.is_active === 1 ? 'Disable Model' : 'Enable Model'}>
                          <IconButton
                            size="small"
                            color={model.is_active === 1 ? 'default' : 'success'}
                            onClick={() => handleToggleStatus(model)}
                            disabled={actionLoading}
                          >
                            <PowerIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ))
      ) : (
        <Alert severity="info">
          No model configurations found. Add your first model using the "Add New Model" button.
        </Alert>
      )}
      
      {/* Create Model Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Model</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                name="model_name"
                label="Model Name"
                value={formData.model_name}
                onChange={handleInputChange}
                fullWidth
                required
                margin="normal"
                placeholder="e.g., gpt-4, mistral-7b"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Provider</InputLabel>
                <Select
                  name="provider"
                  value={formData.provider}
                  onChange={handleInputChange}
                  label="Provider"
                >
                  <MenuItem value="openai">OpenAI</MenuItem>
                  <MenuItem value="mistral">Mistral AI</MenuItem>
                  <MenuItem value="groq">Groq</MenuItem>
                  <MenuItem value="anthropic">Anthropic</MenuItem>
                  <MenuItem value="cohere">Cohere</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="token_cost_multiplier"
                label="Token Cost Multiplier"
                type="number"
                value={formData.token_cost_multiplier}
                onChange={handleInputChange}
                fullWidth
                required
                margin="normal"
                placeholder="e.g., 1.0"
                inputProps={{ step: "0.1", min: "0.1" }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                value={formData.description}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={3}
                margin="normal"
                placeholder="Optional description of the model"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateModel}
            variant="contained"
            disabled={actionLoading || !formData.model_name || !formData.provider || !formData.token_cost_multiplier}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Add Model'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit Model Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Model Configuration</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Model Name"
                value={formData.model_name}
                fullWidth
                margin="normal"
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Provider"
                value={formData.provider}
                fullWidth
                margin="normal"
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="token_cost_multiplier"
                label="Token Cost Multiplier"
                type="number"
                value={formData.token_cost_multiplier}
                onChange={handleInputChange}
                fullWidth
                required
                margin="normal"
                inputProps={{ step: "0.1", min: "0.1" }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                value={formData.description}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={3}
                margin="normal"
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
                label={formData.is_active ? "Model Active" : "Model Disabled"}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleUpdateModel}
            variant="contained"
            disabled={actionLoading || !formData.token_cost_multiplier}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Update Model'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ModelConfig;
