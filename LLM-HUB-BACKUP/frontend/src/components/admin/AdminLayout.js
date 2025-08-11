import React, { useState, useEffect } from 'react';
import { useSessionTimeout } from '../../utils/adminSessionTimeout';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Container,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Receipt as ReceiptIcon,
  Assignment as AssignmentIcon,
  CreditCard as CreditCardIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Tune as TuneIcon,
  Warning as WarningIcon,
  SupervisorAccount as SupervisorAccountIcon,
  ChevronLeft as ChevronLeftIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';


// API URL from environment variable
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Drawer width
const drawerWidth = 240;

const AdminLayout = ({ children }) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Use session timeout hook to handle admin session timeout
  useSessionTimeout();
  
  // State
  const [open, setOpen] = useState(false);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [adminInfo, setAdminInfo] = useState(null);
  const [sessionTimeoutDialog, setSessionTimeoutDialog] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  // Effect to handle scroll and apply styles
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
  
  // Check if admin is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('admin_token');
      
      if (!token) {
        navigate('/admin-login');
        return;
      }
      
      try {
        // Set auth header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Fetch admin info
        const response = await axios.get(`${API_URL}/users/me`);
        setAdminInfo(response.data);
      } catch (err) {
        console.error('Admin auth error:', err);
        localStorage.removeItem('admin_token');
        navigate('/admin-login');
      }
    };
    
    checkAuth();
  }, [navigate]);
  
  // Session timeout warning
  useEffect(() => {
    if (!localStorage.getItem('admin_token')) return;
    
    // Check for session timeout warning (5 minutes before timeout)
    const WARNING_BEFORE = 5 * 60 * 1000; // 5 minutes in milliseconds
    const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
    
    const checkSessionTimeout = () => {
      const lastActivity = localStorage.getItem('lastActivity');
      if (!lastActivity) return;
      
      const now = Date.now();
      const lastActivityTime = parseInt(lastActivity, 10);
      const timeSinceLastActivity = now - lastActivityTime;
      
      // If session is about to expire (within 5 minutes), show warning
      if (timeSinceLastActivity > (SESSION_TIMEOUT - WARNING_BEFORE) && 
          timeSinceLastActivity < SESSION_TIMEOUT) {
        setSessionTimeoutDialog(true);
        setRemainingTime(SESSION_TIMEOUT - timeSinceLastActivity);
      }
      
      // If session has expired, logout
      if (timeSinceLastActivity >= SESSION_TIMEOUT) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('lastActivity');
        navigate('/admin-login?timeout=true');
      }
    };
    
    // Check every minute
    const intervalId = setInterval(checkSessionTimeout, 60000);
    
    // Initial check
    checkSessionTimeout();
    
    return () => clearInterval(intervalId);
  }, [navigate]);
  
  // Handle drawer toggle
  const toggleDrawer = () => {
    setOpen(!open);
  };
  
  // Handle user menu open
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };
  
  // Handle user menu close
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };
  
  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    delete axios.defaults.headers.common['Authorization'];
    navigate('/admin-login');
  };
  
  // Navigation items
  const navItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin-dashboard' },
    { text: 'User Management', icon: <PeopleIcon />, path: '/admin-dashboard/users' },
    { text: 'User Statements', icon: <ReceiptIcon />, path: '/admin-dashboard/user-statements' },
    { text: 'Transactions', icon: <ReceiptIcon />, path: '/admin-dashboard/transactions' },
    { text: 'Task Logs', icon: <AssignmentIcon />, path: '/admin-dashboard/task-logs' },
    { text: 'Credit Packages', icon: <CreditCardIcon />, path: '/admin-dashboard/credit-packages' },
    { text: 'System Logs', icon: <WarningIcon />, path: '/admin-dashboard/system-logs' },
    { text: 'Admin Roles', icon: <SupervisorAccountIcon />, path: '/admin-dashboard/admin-roles' },
  ];
  
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* App Bar */}
      <AppBar
        position="fixed"
        elevation={scrolled ? 4 : 2}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          transition: 'all 0.4s ease-in-out',
          backdropFilter: 'blur(10px)',
          ...(!scrolled
            ? {
                width: '100%',
                borderRadius: '0px !important', // Forcing sharp corners
                top: 0,
                mx: 0,
                background: theme === 'dark' ? '#121212' : '#f5f5f5',
              }
            : {
                top: '10px',
                width: 'calc(100% - 32px)',
                borderRadius: '16px',
                mx: '16px',
                background: theme === 'dark' ? 'rgba(50, 50, 50, 0.8)' : 'rgba(255, 255, 255, 0.8)',
              }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={toggleDrawer}
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
          
          <Box sx={{ flexGrow: 1, cursor: 'pointer' }} onClick={() => navigate('/admin-dashboard')}>
            <Typography variant="h6" noWrap component="div">
              Windsurf Admin Dashboard
            </Typography>
          </Box>
          
          {adminInfo && (
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar sx={{ bgcolor: 'secondary.main' }}>
                    {adminInfo.name.charAt(0)}
                  </Avatar>
                </IconButton>
              </Tooltip>
              
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                <MenuItem disabled>
                  <Typography textAlign="center">{adminInfo.name}</Typography>
                </MenuItem>
                <MenuItem disabled>
                  <Typography textAlign="center">{adminInfo.email}</Typography>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  <Typography textAlign="center">Logout</Typography>
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      
      {/* Drawer */}
      <Drawer
        variant="temporary"
        open={open}
        onClose={toggleDrawer}
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
                  width: drawerWidth,
                  height: '100%',
                  top: 0,
                  left: 0,
                  borderRadius: 0,
                  boxShadow: 'none',
                  background: theme === 'dark' ? '#1e1e1e' : '#ffffff',
                }
              : {
                  width: drawerWidth,
                  height: 'calc(100vh - 20px)',
                  top: '10px',
                  left: '16px',
                  borderRadius: '16px',
                  boxShadow: theme === 'dark'
                    ? '0 8px 24px rgba(0,0,0,0.3)'
                    : '0 8px 24px rgba(0,0,0,0.1)',
                  background: theme === 'dark' ? '#1e1e1e' : '#ffffff',
                }),
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', mt: 2 }}>
          <List>
            {navItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  component={RouterLink}
                  to={item.path}
                  selected={location.pathname === item.path}
                >
                  <ListItemIcon
                    sx={{
                      color: location.pathname === item.path
                        ? 'primary.main'
                        : 'text.secondary'
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      color: location.pathname === item.path
                        ? 'primary.main'
                        : 'text.primary'
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      
      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: '100%',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        <Container maxWidth="xl">
          {children}
        </Container>
      </Box>
      
      {/* Session Timeout Dialog */}
      <Dialog
        open={sessionTimeoutDialog}
        onClose={() => setSessionTimeoutDialog(false)}
        aria-labelledby="session-timeout-dialog-title"
        aria-describedby="session-timeout-dialog-description"
      >
        <DialogTitle id="session-timeout-dialog-title">
          Session Timeout Warning
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="session-timeout-dialog-description">
            Your session will expire in {Math.ceil(remainingTime / 60000)} minutes due to inactivity. 
            Would you like to continue your session?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            localStorage.removeItem('admin_token');
            navigate('/admin-login');
          }} color="error">
            Logout Now
          </Button>
          <Button onClick={() => {
            // Reset the session timeout
            localStorage.setItem('lastActivity', Date.now().toString());
            setSessionTimeoutDialog(false);
          }} color="primary" autoFocus>
            Continue Session
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminLayout;
