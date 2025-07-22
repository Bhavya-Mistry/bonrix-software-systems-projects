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
const drawerWidth = 240;

const Layout = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  
  // State for drawer and user menu
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [anchorEl, setAnchorEl] = useState(null);
  const [pageLoaded, setPageLoaded] = useState(false);
  
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
          my: 2,
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
            mt: 1, 
            display: 'flex', 
            alignItems: 'center',
            p: 1,
            borderRadius: 2,
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
        elevation={0}
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: theme === 'dark' 
            ? 'linear-gradient(90deg, #303f9f 0%, #5c6bc0 100%)'
            : 'linear-gradient(90deg, #3f51b5 0%, #5c6bc0 100%)',
          backdropFilter: 'blur(8px)',
          transition: 'all 0.3s ease'
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
              <Box component="span">
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
        variant={isMobile ? "temporary" : "persistent"}
        open={drawerOpen}
        onClose={handleDrawerToggle}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            border: 'none',
            backgroundImage: theme === 'dark' 
              ? 'linear-gradient(180deg, rgba(30, 60, 114, 0.05) 0%, rgba(42, 82, 152, 0) 100%)'
              : 'none',
            boxShadow: theme === 'dark' 
              ? '2px 0 20px rgba(0, 0, 0, 0.3)' 
              : '2px 0 20px rgba(0, 0, 0, 0.05)',
            transition: 'box-shadow 0.3s ease, transform 0.3s ease',
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
          p: 3,
          width: { md: `calc(100% - ${drawerOpen ? drawerWidth : 0}px)` },
          ml: { md: drawerOpen ? `${drawerWidth}px` : 0 },
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
            sx={{ 
              mt: 4, 
              mb: 4,
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
