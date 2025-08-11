import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, alpha } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

// Create context
const ThemeContext = createContext();

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext);

// Theme provider component
export const ThemeProvider = ({ children }) => {
  // Get theme preference from localStorage or default to 'light'
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });
  
  // Toggle theme function
  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      return newTheme;
    });
  };
  
  // Create MUI theme based on current theme
  const muiTheme = createTheme({
    palette: {
      mode: theme,
      // Modern tech-focused primary color - deep blue with a hint of purple
      primary: {
        main: theme === 'dark' ? '#6366F1' : '#4F46E5',
        light: theme === 'dark' ? '#818CF8' : '#6366F1',
        dark: theme === 'dark' ? '#4F46E5' : '#4338CA',
      },
      // Complementary secondary color - slate gray with blue undertones
      secondary: {
        main: theme === 'dark' ? '#94A3B8' : '#64748B',
        light: theme === 'dark' ? '#CBD5E1' : '#94A3B8',
        dark: theme === 'dark' ? '#64748B' : '#475569',
      },
      // Neutral background colors for minimalist design
      background: {
        default: theme === 'dark' ? '#0F172A' : '#F8FAFC',
        paper: theme === 'dark' ? '#1E293B' : '#FFFFFF',
        card: theme === 'dark' ? '#1E293B' : '#FFFFFF',
      },
      // Improved text contrast for better readability
      text: {
        primary: theme === 'dark' ? '#F1F5F9' : '#1E293B',
        secondary: theme === 'dark' ? '#CBD5E1' : '#64748B',
      },
      // Semantic colors with tech aesthetic
      success: {
        main: theme === 'dark' ? '#10B981' : '#059669',
      },
      info: {
        main: theme === 'dark' ? '#0EA5E9' : '#0284C7',
      },
      warning: {
        main: theme === 'dark' ? '#F59E0B' : '#D97706',
      },
      error: {
        main: theme === 'dark' ? '#EF4444' : '#DC2626',
      },
    },
    typography: {
      // Modern tech-focused font stack
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
        letterSpacing: '-0.025em',
      },
      h2: {
        fontWeight: 700,
        letterSpacing: '-0.025em',
      },
      h3: {
        fontWeight: 600,
        letterSpacing: '-0.02em',
      },
      h4: {
        fontWeight: 600,
        letterSpacing: '-0.015em',
      },
      h5: {
        fontWeight: 600,
        letterSpacing: '-0.01em',
      },
      h6: {
        fontWeight: 600,
        letterSpacing: '-0.005em',
      },
      subtitle1: {
        fontWeight: 500,
        letterSpacing: 0,
      },
      button: {
        fontWeight: 600,
        letterSpacing: '0.01em',
      },
    },
    shape: {
      // More subtle rounded corners for a cleaner, more minimal look
      borderRadius: 8,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarWidth: 'thin',
            '&::-webkit-scrollbar': {
              width: '6px',
              height: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: theme === 'dark' ? '#1E293B' : '#1E293B',
            },
            '&::-webkit-scrollbar-thumb': {
              background: theme === 'dark' ? '#475569' : '#CBD5E1',
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: theme === 'dark' ? '#64748B' : '#94A3B8',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            boxShadow: theme === 'dark' 
              ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
              : '0 4px 12px rgba(0, 0, 0, 0.05)',
            transition: 'all 0.2s ease',
            overflow: 'hidden',
            backgroundColor: theme === 'dark' ? '#1E293B' : '#FFFFFF',
            border: theme === 'dark' ? '1px solid #334155' : '1px solid #E2E8F0',
            '&:hover': {
              boxShadow: theme === 'dark' 
                ? '0 8px 16px rgba(0, 0, 0, 0.4)' 
                : '0 8px 16px rgba(0, 0, 0, 0.08)',
              transform: 'translateY(-2px)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            border: theme === 'dark' ? '1px solid #334155' : '1px solid #E2E8F0',
          },
          elevation1: {
            boxShadow: theme === 'dark' 
              ? '0 1px 3px rgba(0, 0, 0, 0.3)' 
              : '0 1px 3px rgba(0, 0, 0, 0.05)',
          },
          elevation2: {
            boxShadow: theme === 'dark' 
              ? '0 2px 6px rgba(0, 0, 0, 0.3)' 
              : '0 2px 6px rgba(0, 0, 0, 0.05)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            textTransform: 'none',
            fontWeight: 600,
            padding: '6px 16px',
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: theme === 'dark' 
                ? '0 4px 8px rgba(0, 0, 0, 0.3)' 
                : '0 4px 8px rgba(0, 0, 0, 0.08)',
            },
          },
          contained: {
            boxShadow: theme === 'dark' 
              ? '0 2px 4px rgba(0, 0, 0, 0.3)' 
              : '0 2px 4px rgba(0, 0, 0, 0.05)',
          },
          outlined: {
            borderWidth: '1px',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
            borderBottom: theme === 'dark' ? '1px solid #334155' : '1px solid #E2E8F0',
            backgroundImage: 'none',
            backgroundColor: theme === 'dark' ? '#0F172A' : '#4F46E5',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 4,
            transition: 'all 0.2s ease',
            fontWeight: 500,
            '&:hover': {
              transform: 'translateY(-1px)',
            },
          },
          outlined: {
            borderWidth: '1px',
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            transition: 'background-color 0.2s ease',
            margin: '2px 0',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 6,
              transition: 'all 0.2s ease',
              '&:hover': {
                boxShadow: theme === 'dark' 
                  ? '0 2px 4px rgba(0, 0, 0, 0.2)' 
                  : '0 2px 4px rgba(0, 0, 0, 0.03)',
              },
              '&.Mui-focused': {
                boxShadow: theme === 'dark' 
                  ? `0 0 0 2px ${alpha('#6366F1', 0.4)}` 
                  : `0 0 0 2px ${alpha('#4F46E5', 0.2)}`,
              },
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 8,
            boxShadow: theme === 'dark' 
              ? '0 20px 25px rgba(0, 0, 0, 0.5), 0 10px 10px rgba(0, 0, 0, 0.4)' 
              : '0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)',
            border: theme === 'dark' ? '1px solid #334155' : '1px solid #E2E8F0',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor: theme === 'dark' ? '#334155' : '#E2E8F0',
          },
          head: {
            fontWeight: 600,
            backgroundColor: theme === 'dark' ? '#1E293B' : '#F8FAFC',
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:last-child td': {
              borderBottom: 0,
            },
            '&:hover': {
              backgroundColor: theme === 'dark' ? 'rgba(99, 102, 241, 0.08)' : 'rgba(79, 70, 229, 0.04)',
            },
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: theme === 'dark' ? '#334155' : '#E2E8F0',
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            minWidth: 100,
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            height: 3,
            borderRadius: '3px 3px 0 0',
          },
        },
      },
    },
  });
  
  // Context value
  const value = {
    theme,
    toggleTheme,
  };
  
  // Set default theme to dark if user prefers dark color scheme
  // useEffect(() => {
  //   if (!localStorage.getItem('theme')) {
  //     const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  //     if (prefersDarkMode) {
  //       setTheme('dark');
  //       localStorage.setItem('theme', 'dark');
  //     }
  //   }
  // }, []);

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  ); 
};
