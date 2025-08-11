import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, Box } from '@mui/material';
// No longer using MUI date pickers
import { useTheme } from './context/ThemeContext';
import { useAuth } from './context/AuthContext';
import { ModelProvider } from './context/ModelContext';

// Layout components
import Layout from './components/Layout';

// Page components
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import TaskSelector from './pages/TaskSelector';
import ResumeAnalysis from './pages/tasks/ResumeAnalysis';
import ObjectDetection from './pages/tasks/ObjectDetection';
import InvoiceExtraction from './pages/tasks/InvoiceExtraction';
import TextSummarization from './pages/tasks/TextSummarization';
import SentimentAnalysis from './pages/tasks/SentimentAnalysis';
import CustomPrompt from './pages/tasks/CustomPrompt';
import Wallet from './pages/Wallet';
import Statement from './pages/Statement';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

// Admin components
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Admin protected route component
const AdminProtectedRoute = ({ children }) => {
  // Check for admin token
  const adminToken = localStorage.getItem('admin_token');
  
  if (!adminToken) {
    return <Navigate to="/admin-login" replace />;
  }
  
  return children;
};

function App() {
  const { theme } = useTheme();
  
  return (
    <Box sx={{ 
      bgcolor: theme === 'dark' ? '#121212' : '#f5f5f5',
      minHeight: '100vh'
    }}>
      <CssBaseline />
      <ModelProvider>
        <Routes>
          {/* User Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Admin Routes */}
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin-dashboard/*" element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          } />
          
          {/* User Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="tasks" element={<TaskSelector />} />
            <Route path="tasks/resume-analysis" element={<ResumeAnalysis />} />
            <Route path="tasks/object-detection" element={<ObjectDetection />} />
            <Route path="tasks/invoice-extraction" element={<InvoiceExtraction />} />
            <Route path="tasks/text-summarization" element={<TextSummarization />} />
            <Route path="tasks/sentiment-analysis" element={<SentimentAnalysis />} />
            <Route path="tasks/custom-prompt" element={<CustomPrompt />} />
            <Route path="wallet" element={<Wallet />} />
            <Route path="statement" element={<Statement />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </ModelProvider>
    </Box>
  );
}

export default App;