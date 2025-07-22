import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Radio,
  RadioGroup,
  FormControlLabel,
  Divider,
  Paper
} from '@mui/material';
import { useModel } from '../context/ModelContext';

const ModelSettings = ({ open, onClose, taskType, onModelSelect }) => {
  const { models, getSelectedModelForTask, setSelectedModelForTask } = useModel();
  const selectedModel = getSelectedModelForTask(taskType);

  const handleModelChange = (event) => {
    const newModel = event.target.value;
    setSelectedModelForTask(taskType, newModel);
    if (onModelSelect) {
      onModelSelect(newModel);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Typography variant="h6">Select AI Model</Typography>
        <Typography variant="subtitle2" color="text.secondary">
          {taskType ? taskType.replace(/_/g, ' ').replace(/-/g, ' ').split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ') : 'Task'}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" paragraph>
          Select the AI model to use for this task. Different models have different capabilities and costs.
        </Typography>

        <RadioGroup 
          value={selectedModel} 
          onChange={handleModelChange}
        >
          {Object.entries(models).map(([provider, providerModels]) => (
            <Box key={provider} sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                {provider}
              </Typography>
              <Paper variant="outlined" sx={{ p: 1 }}>
                {providerModels.map((model, index) => (
                  <React.Fragment key={model.id}>
                    <FormControlLabel
                      value={model.id}
                      control={<Radio />}
                      label={
                        <Box>
                          <Typography variant="body2">{model.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {model.description}
                          </Typography>
                        </Box>
                      }
                      sx={{ py: 0.5, display: 'flex', alignItems: 'flex-start' }}
                    />
                    {index < providerModels.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </Paper>
            </Box>
          ))}
        </RadioGroup>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModelSettings;
