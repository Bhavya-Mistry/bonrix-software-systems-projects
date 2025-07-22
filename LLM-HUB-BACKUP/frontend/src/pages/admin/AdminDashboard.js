import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import DashboardOverview from './DashboardOverview';
import UserManagement from './UserManagement';
import UserStatements from './UserStatements';
import TransactionHistory from './TransactionHistory';
import TaskLogs from './TaskLogs';
import CreditPackages from './CreditPackages';
import ModelConfig from './ModelConfig';
import SystemLogs from './SystemLogs';
import AdminSettings from './AdminSettings';
import AdminRoles from './AdminRoles';

const AdminDashboard = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<DashboardOverview />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/user-statements" element={<UserStatements />} />
        <Route path="/transactions" element={<TransactionHistory />} />
        <Route path="/task-logs" element={<TaskLogs />} />
        <Route path="/credit-packages" element={<CreditPackages />} />
        <Route path="/model-config" element={<ModelConfig />} />
        <Route path="/system-logs" element={<SystemLogs />} />
        <Route path="/settings" element={<AdminSettings />} />
        <Route path="/admin-roles" element={<AdminRoles />} />
        <Route path="*" element={<Navigate to="/admin-dashboard" replace />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminDashboard;
