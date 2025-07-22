import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the model context
const ModelContext = createContext();

// Model provider component
export const ModelProvider = ({ children }) => {
  // Get saved model preferences from localStorage or use defaults
  const [modelPreferences, setModelPreferences] = useState(() => {
    const savedPreferences = localStorage.getItem('windsurf_model_preferences');
    return savedPreferences ? JSON.parse(savedPreferences) : {
      // Default models for each task
      resume_analysis: 'gpt-3.5-turbo',
      object_detection: 'mistral-medium',
      invoice_extraction: 'gpt-3.5-turbo',
      text_summarization: 'mistral-medium',
      sentiment_analysis: 'gpt-3.5-turbo',
      custom_prompt: 'gpt-4'
    };
  });

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
    ],
    Gemini: [
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: 'Google Gemini: Fast, efficient, and multimodal' }
    ]
  };

  // Save preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem('windsurf_model_preferences', JSON.stringify(modelPreferences));
  }, [modelPreferences]);

  // Get model details by id
  const getModelDetails = (modelId) => {
    for (const provider in models) {
      const model = models[provider].find(m => m.id === modelId);
      if (model) {
        return { ...model, provider };
      }
    }
    return null;
  };

  // Get selected model for a specific task
  const getSelectedModelForTask = (taskType) => {
    return modelPreferences[taskType] || 'gpt-3.5-turbo'; // Default fallback
  };

  // Set selected model for a specific task
  const setSelectedModelForTask = (taskType, modelId) => {
    setModelPreferences(prev => ({
      ...prev,
      [taskType]: modelId
    }));
  };

  // Context value
  const value = {
    models,
    getModelDetails,
    getSelectedModelForTask,
    setSelectedModelForTask
  };

  return (
    <ModelContext.Provider value={value}>
      {children}
    </ModelContext.Provider>
  );
};

// Custom hook for using the model context
export const useModel = () => {
  const context = useContext(ModelContext);
  if (!context) {
    throw new Error('useModel must be used within a ModelProvider');
  }
  return context;
};
