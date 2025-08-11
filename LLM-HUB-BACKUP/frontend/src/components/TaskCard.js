import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardActionArea,
  Typography,
  IconButton,
  Box,
  Tooltip,
  Chip,
  useTheme as useMuiTheme,
  alpha,
  Zoom
} from '@mui/material';
import { Settings as SettingsIcon, ArrowForward as ArrowIcon } from '@mui/icons-material';
import { useModel } from '../context/ModelContext';
import { useTheme } from '../context/ThemeContext';
import ModelSettings from './ModelSettings';

const TaskCard = ({ title, description, taskType, route, index = 0 }) => {
  const navigate = useNavigate();
  const { getSelectedModelForTask, getModelDetails } = useModel();
  const { theme } = useTheme();
  const muiTheme = useMuiTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const isDark = theme === 'dark';
  
  // Get the selected model for this task
  const selectedModelId = getSelectedModelForTask(taskType);
  const selectedModel = getModelDetails(selectedModelId);
  
  // Set animation delay based on index
  useEffect(() => {
    // Stagger the animations
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100 + (index * 100));
    
    return () => clearTimeout(timer);
  }, [index]);
  
  // Handle settings icon click
  const handleSettingsClick = (event) => {
    event.stopPropagation(); // Prevent card click from triggering
    setSettingsOpen(true);
  };
  
  // Handle card click
  const handleCardClick = () => {
    navigate(route);
  };

  return (
    <>
      <Zoom in={isVisible} style={{ transitionDelay: `${index * 50}ms` }}>
        <Card 
          className="task-card" 
          style={{ '--index': index }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          sx={{
            position: 'relative',
            overflow: 'hidden',
            background: isDark 
              ? `linear-gradient(135deg, ${alpha(muiTheme.palette.background.card, 0.8)} 0%, ${alpha(muiTheme.palette.background.card, 1)} 100%)` 
              : 'white',
            boxShadow: isDark 
              ? '0 8px 24px rgba(0, 0, 0, 0.3)' 
              : '0 8px 24px rgba(0, 0, 0, 0.1)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: `linear-gradient(135deg, ${alpha(muiTheme.palette.primary.main, 0.1)} 0%, ${alpha(muiTheme.palette.primary.main, 0)} 100%)`,
              opacity: isHovered ? 1 : 0,
              transition: 'opacity 0.3s ease',
              zIndex: 1
            }
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 2 }}>
            <CardActionArea 
              onClick={handleCardClick}
              sx={{
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: isDark 
                    ? 'rgba(255, 255, 255, 0.05)' 
                    : 'rgba(0, 0, 0, 0.02)'
                }
              }}
            >
              <CardContent sx={{ pb: 2, pt: 3, px: 3 }}>
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ 
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
  mb: 1.5,
  color: isDark ? '#fff' : 'text.primary',
  transition: 'transform 0.3s ease',
  transform: isHovered ? 'translateX(5px)' : 'translateX(0)',
}}
                >
                  {title}
                  <ArrowIcon 
                    sx={{ 
  ml: 1, 
  opacity: isHovered ? 1 : 0, 
  transform: isHovered ? 'translateX(0)' : 'translateX(-10px)',
  transition: 'opacity 0.3s ease, transform 0.3s ease',
  fontSize: '0.9em',
  color: isDark ? '#fff' : 'text.primary'
}} 
                  />
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ 
                    opacity: 0.8,
                    minHeight: '2.5rem',
                    transition: 'opacity 0.3s ease',
                    '&:hover': { opacity: 1 }
                  }}
                >
                  {description}
                </Typography>
              </CardContent>
            </CardActionArea>
            
            {/* Settings icon in top-right corner */}
            <Tooltip title="Select AI Model">
              <IconButton 
                size="small"
                onClick={handleSettingsClick}
                sx={{ 
                  position: 'absolute', 
                  top: 8, 
                  right: 8,
                  backgroundColor: isDark 
                    ? alpha(muiTheme.palette.background.paper, 0.3) 
                    : alpha(muiTheme.palette.background.paper, 0.7),
                  backdropFilter: 'blur(4px)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: isDark 
                      ? alpha(muiTheme.palette.background.paper, 0.5) 
                      : alpha(muiTheme.palette.background.paper, 0.9),
                    transform: 'rotate(30deg)'
                  }
                }}
              >
                <SettingsIcon 
                  fontSize="small" 
                  sx={{ color: 'text.primary' }} 
                />
              </IconButton>
            </Tooltip>
            
            {/* Model chip at bottom */}
            {selectedModel && (
              <Box 
                sx={{ 
                  position: 'absolute', 
                  bottom: 8, 
                  right: 8,
                  transition: 'transform 0.3s ease',
                  transform: isHovered ? 'translateY(-4px)' : 'translateY(0)'
                }}
              >
                <Chip
                  label={selectedModel.name}
                  size="small"
                  variant="outlined"
                  color="primary"
                  sx={{
                    fontWeight: 500,
                    backdropFilter: 'blur(4px)',
                    backgroundColor: isDark 
                      ? alpha(muiTheme.palette.background.paper, 0.3) 
                      : alpha(muiTheme.palette.background.paper, 0.7),
                    borderColor: isDark 
                      ? alpha(muiTheme.palette.primary.main, 0.5) 
                      : muiTheme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: isDark 
                        ? alpha(muiTheme.palette.background.paper, 0.5) 
                        : alpha(muiTheme.palette.background.paper, 0.9),
                    }
                  }}
                />
              </Box>
            )}
          </Box>
        </Card>
      </Zoom>
      
      {/* Model settings dialog */}
      <ModelSettings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        taskType={taskType}
      />
    </>
  );
};

export default TaskCard;
