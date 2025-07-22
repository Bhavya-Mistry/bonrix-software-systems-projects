import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Box,
  Tooltip,
  Typography
} from '@mui/material';

const ModelSelector = ({ model, setModel, disabled = false }) => {
  // Available models grouped by provider
  const models = {
    OpenAI: [
      { id: 'gpt-4', name: 'GPT-4', description: 'Most powerful model, higher cost' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Good balance of capability and cost' }
    ],
    Mistral: [
      { id: 'mistral-medium', name: 'Mistral Medium', description: 'Powerful open model' },
      { id: 'mistral-small', name: 'Mistral Small', description: 'Efficient open model' },
      { id: 'mistral-tiny', name: 'Mistral Tiny', description: 'Fast, cost-effective model' },
      { id: 'mistral-7b', name: 'Mistral 7B', description: 'Lightweight model' }
    ],
    Gemini: [
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: 'Google Gemini: Fast, efficient, and multimodal' }
    ],
    LLaMA: [
      { id: 'llama2', name: 'LLaMA 2', description: 'Open source model' },
      { id: 'llama3', name: 'LLaMA 3', description: 'Latest open source model' }
    ]
  };

  return (
    <FormControl fullWidth variant="outlined" disabled={disabled} className="model-selector">
      <InputLabel id="model-select-label">AI Model</InputLabel>
      <Select
        labelId="model-select-label"
        id="model-select"
        value={model}
        onChange={(e) => setModel(e.target.value)}
        label="AI Model"
      >
        {Object.entries(models).map(([provider, providerModels]) => [
          <MenuItem key={provider} disabled divider>
            <Typography variant="overline">{provider}</Typography>
          </MenuItem>,
          ...providerModels.map((model) => (
            <MenuItem key={model.id} value={model.id}>
              <Tooltip title={model.description} placement="right" arrow>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="body2">{model.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {model.description}
                  </Typography>
                </Box>
              </Tooltip>
            </MenuItem>
          ))
        ]).flat()}
      </Select>
      <FormHelperText>Select the AI model to use for this task</FormHelperText>
    </FormControl>
  );
};

export default ModelSelector;
