import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Box,
  Paper,
  Divider
} from '@mui/material';
import {
  Description as ResumeIcon,
  Image as ImageIcon,
  Receipt as InvoiceIcon,
  TextFields as TextIcon,
  Mood as SentimentIcon,
  Code as CustomIcon
} from '@mui/icons-material';

const TaskSelector = () => {
  const navigate = useNavigate();
  
  // Task definitions
  const tasks = [
    {
      id: 'resume-analysis',
      title: 'Resume Analysis',
      description: 'Analyze resumes against job descriptions to find the best candidates.',
      icon: <ResumeIcon fontSize="large" />,
      path: '/tasks/resume-analysis',
      color: '#f44336'
    },
    {
      id: 'object-detection',
      title: 'Object Detection',
      description: 'Detect and count objects in images with AI vision.',
      icon: <ImageIcon fontSize="large" />,
      path: '/tasks/object-detection',
      color: '#2196f3'
    },
    {
      id: 'invoice-extraction',
      title: 'Invoice Extraction',
      description: 'Extract structured data from invoice images and PDFs.',
      icon: <InvoiceIcon fontSize="large" />,
      path: '/tasks/invoice-extraction',
      color: '#ff9800'
    },
    {
      id: 'text-summarization',
      title: 'Text Summarization',
      description: 'Generate concise summaries of long-form text.',
      icon: <TextIcon fontSize="large" />,
      path: '/tasks/text-summarization',
      color: '#4caf50'
    },
    {
      id: 'sentiment-analysis',
      title: 'Sentiment Analysis',
      description: 'Analyze sentiment in customer reviews and feedback.',
      icon: <SentimentIcon fontSize="large" />,
      path: '/tasks/sentiment-analysis',
      color: '#9c27b0'
    },
    {
      id: 'custom-prompt',
      title: 'Custom Prompt',
      description: 'Create your own custom AI prompts for any task.',
      icon: <CustomIcon fontSize="large" />,
      path: '/tasks/custom-prompt',
      color: '#607d8b'
    }
  ];
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        AI Tasks
      </Typography>
      
      <Typography variant="body1" paragraph color="text.secondary">
        Select a task to get started with Windsurf's AI capabilities.
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {tasks.map((task) => (
          <Grid item xs={12} sm={6} md={4} key={task.id}>
            <Card 
              className="task-card"
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 20px rgba(0, 0, 0, 0.1)'
                }
              }}
            >
              <CardActionArea 
                onClick={() => navigate(task.path)}
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'stretch',
                  height: '100%'
                }}
              >
                <Box 
                  sx={{ 
                    bgcolor: task.color,
                    color: 'white',
                    p: 2,
                    display: 'flex',
                    justifyContent: 'center'
                  }}
                >
                  {task.icon}
                </Box>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {task.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {task.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Paper elevation={1} sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          About AI Tasks
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body2" paragraph>
          Windsurf provides a variety of AI-powered tasks to help you with different needs. Each task uses our advanced language models to process and analyze different types of data.
        </Typography>
        <Typography variant="body2" paragraph>
          Tasks are billed using our credit system, with costs varying based on the complexity of the task and the model used. You can view your credit balance and purchase more credits from your wallet.
        </Typography>
        <Typography variant="body2">
          All tasks support multiple AI models, including OpenAI's GPT models, Mistral AI, and LLaMA. You can select your preferred model when running a task.
        </Typography>
      </Paper>
    </Box>
  );
};

export default TaskSelector;
