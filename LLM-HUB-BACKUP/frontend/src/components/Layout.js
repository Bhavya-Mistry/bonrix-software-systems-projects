import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Container,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  useMediaQuery,
  Fade,
  Zoom,
  Paper,
  ListItemButton
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Psychology as TasksIcon,
  AccountBalanceWallet as WalletIcon,
  Logout as LogoutIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  ReceiptLong as ReceiptLongIcon
} from '@mui/icons-material';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

// Drawer width
const drawerWidth = 240 ;

const Layout = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  
  // State for drawer and user menu
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Effect to handle scroll and apply styles to AppBar
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    document.addEventListener('scroll', handleScroll);
    return () => {
      document.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);
  
  // Add animation delay when page loads
  useEffect(() => {
    setPageLoaded(true);
  }, []);
  
  // Toggle drawer
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  // User menu handlers
  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };
  
  // Handle logout
  const handleLogout = () => {
    handleUserMenuClose();
    logout();
    navigate('/login');
  };
  
  // Navigation items
  const navItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Wallet', icon: <WalletIcon />, path: '/wallet' },
    { text: 'Statement', icon: <ReceiptLongIcon />, path: '/statement' }
  ];
  
  // Drawer content
  const drawer = (
    <>
      <Toolbar sx={{ 
        background: theme === 'dark' 
          ? 'linear-gradient(135deg, #303f9f 0%, #5c6bc0 100%)'
          : 'linear-gradient(135deg, #3f51b5 0%, #5c6bc0 100%)',
        color: '#fff',
        borderRadius: '0 0 16px 0',
        mb: 1
      }}>
        <Typography 
          variant="h5" 
          component="div" 
          sx={{ 
            fontWeight: 'bold',
            letterSpacing: '0.5px',
            textShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
        >
          Windsurf
        </Typography>
      </Toolbar>
      
      {user && (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          mt: 0,  // Remove top margin
          mb: 1,  // Reduce bottom margin
          px: 2
        }}>
          <Avatar 
            sx={{ 
              width: 64, 
              height: 64, 
              mb: 1,
              bgcolor: muiTheme.palette.primary.main,
              border: '2px solid',
              borderColor: 'primary.light',
              boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
              transition: 'all 0.3s ease'
            }}
            className="user-avatar"
          >
            {user?.name?.charAt(0) || <PersonIcon />}
          </Avatar>
          <Typography variant="subtitle1" fontWeight="bold">
            {user?.name || 'User'}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: '100%' }}>
            {user?.email || ''}
          </Typography>
          <Box sx={{ 
            mt: 0.5,  // Reduce top margin
            display: 'flex', 
            alignItems: 'center',
            p: 0.8,  // Slightly reduce padding
            borderRadius: 1.5,  // Slightly smaller border radius
            bgcolor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
          }}>
            <WalletIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
            <Typography variant="body2">
              <strong>{user.credits.toFixed(0)}</strong> credits
            </Typography>
          </Box>
        </Box>
      )}
      
      <Divider sx={{ mx: 2 }} />
      
      <List sx={{ px: 1, mt: 1 }}>
        {navItems.map((item, index) => (
          <Zoom 
            key={item.text} 
            in={pageLoaded} 
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            <ListItem 
              disablePadding 
              sx={{ mb: 1 }}
            >
              <ListItemButton
                onClick={() => navigate(item.path)}
                selected={location.pathname === item.path}
                sx={{
                  borderRadius: 2,
                  transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  '&.Mui-selected': {
                    backgroundColor: theme === 'dark' 
                      ? 'rgba(77, 171, 245, 0.15)' 
                      : 'rgba(33, 150, 243, 0.1)',
                    color: 'primary.main',
                    '&:hover': {
                      backgroundColor: theme === 'dark' 
                        ? 'rgba(77, 171, 245, 0.25)' 
                        : 'rgba(33, 150, 243, 0.2)',
                    }
                  },
                  '&:hover': {
                    backgroundColor: theme === 'dark' 
                      ? 'rgba(255, 255, 255, 0.05)' 
                      : 'rgba(0, 0, 0, 0.04)',
                    transform: 'translateY(-2px)',
                  }
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    color: location.pathname === item.path ? 'primary.main' : 'inherit',
                    minWidth: 40
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ 
                    fontWeight: location.pathname === item.path ? 600 : 400 
                  }}
                />
              </ListItemButton>
            </ListItem>
          </Zoom>
        ))}
      </List>
      
      <Box sx={{ flexGrow: 1 }} />
      
      <Divider sx={{ mx: 2, mb: 2 }} />
      
      <Box sx={{ px: 3, mb: 2 }}>
        <Tooltip title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
          <Paper
            elevation={0}
            onClick={toggleTheme}
            sx={{
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 2,
              cursor: 'pointer',
              bgcolor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                transform: 'translateY(-2px)'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {theme === 'light' ? (
                <>
                  <DarkModeIcon sx={{ mr: 1 }} />
                  <Typography variant="body2">Switch to Dark Mode</Typography>
                </>
              ) : (
                <>
                  <LightModeIcon sx={{ mr: 1 }} />
                  <Typography variant="body2">Switch to Light Mode</Typography>
                </>
              )}
            </Box>
          </Paper>
        </Tooltip>
      </Box>
    </>
  );
  
  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar 
        position="fixed" 
        elevation={scrolled ? 4 : 2} // More elevation when floating
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          transition: 'all 0.4s ease-in-out',
          backdropFilter: 'blur(10px)',
          // Conditional styles based on scroll state
          ...(!scrolled
            ? {
                // Initial state: full-width, sharp rectangle
                width: '100%',
                borderRadius: '0px !important', // Forcing sharp corners
                top: 0,
                mx: 0,
                background: theme === 'dark' 
                  ? '#121212'
                  : '#f5f5f5',
              }
            : {
                // Scrolled state: floating, rounded
                top: '10px',
                width: 'calc(100% - 32px)',
                borderRadius: '16px',
                mx: '16px',
                background: theme === 'dark' 
                  ? 'rgba(50, 50, 50, 0.8)' 
                  : 'rgba(245, 245, 245, 0.8)',
              }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2,
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'rotate(90deg)'
              } 
            }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              fontWeight: 'bold',
              letterSpacing: '0.5px',
              textShadow: '0 2px 4px rgba(0,0,0,0.2)',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Fade in={pageLoaded} timeout={800}>
              <Box 
                component="span" 
                onClick={() => navigate('/dashboard')}
                sx={{ cursor: 'pointer' }}
              >
                AI-TOOLKIT
              </Box>
            </Fade>
          </Typography>
          
          {/* Notification Icon removed */}
          
          {/* Wallet Icon (without badge) */}
          {user && (
            <Zoom in={pageLoaded} style={{ transitionDelay: '300ms' }}>
              <IconButton
                color="inherit"
                sx={{ mr: 2 }}
                onClick={() => navigate('/wallet')}
              >
                <WalletIcon />
              </IconButton>
            </Zoom>
          )}
          
          {/* Theme Toggle */}
          <Zoom in={pageLoaded} style={{ transitionDelay: '400ms' }}>
            <Tooltip title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
              <IconButton 
                color="inherit" 
                onClick={toggleTheme} 
                sx={{ 
                  mr: 1,
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'rotate(180deg)'
                  }
                }}
              >
                {theme === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
              </IconButton>
            </Tooltip>
          </Zoom>
          
          {/* Settings button removed */}
          
          {/* User Menu */}
          <Zoom in={pageLoaded} style={{ transitionDelay: '600ms' }}>
            <Box>
              <Tooltip title="Account settings">
                <IconButton
                  onClick={handleUserMenuOpen}
                  size="small"
                  sx={{ 
                    ml: 1,
                    border: '2px solid rgba(255,255,255,0.5)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      border: '2px solid rgba(255,255,255,0.8)'
                    }
                  }}
                  aria-controls={Boolean(anchorEl) ? 'account-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={Boolean(anchorEl) ? 'true' : undefined}
                  className="user-avatar"
                >
                  <Avatar 
                    sx={{ 
                      width: 32, 
                      height: 32, 
                      bgcolor: theme === 'dark' ? '#4dabf5' : muiTheme.palette.primary.main,
                      fontWeight: 'bold'
                    }}
                  >
                    {user?.name?.charAt(0) || <PersonIcon />}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                id="account-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleUserMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                  elevation: 3,
                  sx: {
                    borderRadius: 2,
                    minWidth: 180,
                    overflow: 'visible',
                    mt: 1.5,
                    '&:before': {
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      top: 0,
                      right: 14,
                      width: 10,
                      height: 10,
                      bgcolor: 'background.paper',
                      transform: 'translateY(-50%) rotate(45deg)',
                      zIndex: 0,
                    },
                  },
                }}
              >
                {user && (
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {user.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user.email}
                    </Typography>
                  </Box>
                )}
                <Divider />
                <MenuItem onClick={() => navigate('/profile')} sx={{ borderRadius: 1, mx: 1, mt: 1 }}>
                  <ListItemIcon>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  Profile
                </MenuItem>
                <MenuItem onClick={() => navigate('/wallet')} sx={{ borderRadius: 1, mx: 1 }}>
                  <ListItemIcon>
                    <WalletIcon fontSize="small" />
                  </ListItemIcon>
                  Wallet
                </MenuItem>
                <MenuItem onClick={() => navigate('/settings')} sx={{ borderRadius: 1, mx: 1 }}>
                  <ListItemIcon>
                    <SettingsIcon fontSize="small" />
                  </ListItemIcon>
                  Settings
                </MenuItem>
                <Divider sx={{ my: 1 }} />
                <MenuItem 
                  onClick={handleLogout} 
                  sx={{ 
                    borderRadius: 1, 
                    mx: 1, 
                    mb: 1,
                    color: 'error.main',
                    '&:hover': {
                      bgcolor: 'error.light',
                      color: 'error.dark'
                    }
                  }}
                >
                  <ListItemIcon sx={{ color: 'error.main' }}>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          </Zoom>
        </Toolbar>
      </AppBar>
      
      {/* Drawer */}
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            border: 'none',
            overflow: 'hidden',
            transition: 'all 0.4s ease-in-out',
            ...(!scrolled
              ? {
                  // Initial state: full-height, sharp rectangle
                  width: drawerWidth,
                  height: '100%',
                  top: 0,
                  left: 0,
                  borderRadius: 0,
                  boxShadow: 'none',
                  background: theme === 'dark' ? '#1e1e1e' : '#ffffff',
                }
              : {
                  // Scrolled state: floating, rounded
                  width: drawerWidth,
                  height: 'calc(100vh - 20px)',
                  top: '10px',
                  left: '16px', // Align with navbar's 16px margin
                  borderRadius: '16px',
                  boxShadow: theme === 'dark'
                    ? '0 8px 24px rgba(0,0,0,0.3)'
                    : '0 8px 24px rgba(0,0,0,0.1)',
                  background: theme === 'dark' ? '#1e1e1e' : '#ffffff',
                }),
          },
        }}
      >
        {drawer}
      </Drawer>
      
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0,  // Remove all padding
          pt: 3, // Add back only top padding
          pr: 3, // Add back right padding
          pb: 3, // Add back bottom padding
          width: `calc(100% - ${drawerOpen ? drawerWidth : 0}px)`,
          ml: `${drawerOpen ? drawerWidth : 0}px`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          minHeight: '100vh',
          background: theme === 'dark' 
            ? 'radial-gradient(circle at 10% 20%, rgba(30, 60, 114, 0.1) 0%, rgba(42, 82, 152, 0) 80%)'
            : 'none',
        }}
      >
        <Toolbar /> {/* Spacer to push content below app bar */}
        <Fade in={pageLoaded} timeout={800}>
          <Container
            maxWidth="lg"
            disableGutters
            sx={{
              mt: 4,
              mb: 4,
              px: drawerOpen ? 0 : 2,
              position: 'relative',
              zIndex: 1,
            }}
          >
            <Outlet />
          </Container>
        </Fade>
        
        {/* Background decorative elements */}
        {theme === 'dark' && (
          <>
            <Box 
              sx={{ 
                position: 'absolute', 
                top: '10%', 
                right: '5%', 
                width: '300px', 
                height: '300px', 
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(33, 150, 243, 0.05) 0%, rgba(33, 150, 243, 0) 70%)',
                filter: 'blur(40px)',
                zIndex: 0,
                animation: 'float 15s infinite ease-in-out',
              }} 
            />
            <Box 
              sx={{ 
                position: 'absolute', 
                bottom: '15%', 
                left: '10%', 
                width: '250px', 
                height: '250px', 
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(240, 98, 146, 0.03) 0%, rgba(240, 98, 146, 0) 70%)',
                filter: 'blur(40px)',
                zIndex: 0,
                animation: 'float 20s infinite ease-in-out reverse',
              }} 
            />
          </>
        )}
      </Box>
    </Box>
  );
};

export default Layout;