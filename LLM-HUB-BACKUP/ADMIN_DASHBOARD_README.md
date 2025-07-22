# LLM Hub Admin Dashboard

This document provides an overview of the Admin Dashboard for the LLM Hub platform, including setup instructions, features, and usage guidelines.

## Overview

The Admin Dashboard is a comprehensive interface for platform administrators to manage and monitor the LLM Hub platform. It provides tools for user management, transaction tracking, system configuration, and more.

## Features

1. **Dashboard Overview**
   - Real-time statistics on users, credits, revenue
   - Active user metrics (24h, 7d)
   - Top used LLM models visualization

2. **User Management**
   - View all users and their details
   - Edit user credit balances
   - Deactivate/ban users
   - Export user data to CSV/Excel

3. **Transaction History**
   - View all platform transactions
   - Filter by date, payment method, status
   - Export transaction data

4. **Task Logs Viewer**
   - Monitor tasks performed by users
   - View detailed task information
   - Filter logs by user, task type, date

5. **Credit Packages Management**
   - Create, edit, and delete credit packages
   - Set promotional discounts
   - Toggle package availability

6. **Model Configuration**
   - Manage available LLM models
   - Configure token cost multipliers
   - Enable/disable specific models

7. **Admin Settings**
   - Configure API keys for services
   - Set currency conversion rates
   - Create platform announcements

8. **System Logs & Monitoring**
   - View system events and errors
   - Filter logs by severity, source
   - Monitor platform health

9. **Admin Role Management**
   - Create and manage admin users
   - Assign different permission levels
   - Super Admin and Moderator roles

## Setup Instructions

### Database Setup

1. Run the database migration to add the required tables:
   ```bash
   cd backend
   alembic upgrade head
   ```

2. Create a superadmin user:
   ```bash
   cd backend
   python setup_admin.py
   ```
   Follow the prompts to create your admin credentials.

### Accessing the Admin Dashboard

1. Navigate to `/admin-login` in your browser
2. Log in with your admin credentials
3. You will be redirected to the admin dashboard

## Security Considerations

- Admin access is restricted to users with the `is_admin` flag set to 1
- JWT tokens are used for authentication with limited validity (24 hours)
- Sensitive settings (API keys) are marked as secure and stored encrypted
- All admin actions are logged in the system logs for audit purposes
- Rate limiting is implemented on admin login attempts to prevent brute force attacks
- Admin sessions automatically timeout after 30 minutes of inactivity
- Two-factor authentication can be enabled for admin accounts
- IP-based access restrictions can be configured for the admin dashboard

### Security Best Practices

1. **Strong Passwords**: Ensure all admin users have strong, unique passwords
2. **Regular Rotation**: Change admin credentials regularly (every 90 days recommended)
3. **Least Privilege**: Grant only necessary permissions to admin users based on their role
4. **Audit Logs**: Regularly review system logs for suspicious activities
5. **Updates**: Keep all dependencies and packages updated to patch security vulnerabilities
6. **Secure Communication**: Always access the admin dashboard over HTTPS
7. **Backup**: Regularly backup the database and configuration

## Development Notes

### Frontend

- Built with React.js and Material UI
- Admin components are in `frontend/src/pages/admin/`
- Admin layout and shared components in `frontend/src/components/admin/`

### Backend

- Admin API endpoints in `backend/api/admin.py`
- Database models in `backend/models/database.py`
- Authentication utils in `backend/utils/auth.py`

## Troubleshooting

- If you encounter issues with admin login, check that the user has `is_admin=1` in the database
- For database migration issues, check the alembic version history
- JWT token issues may require clearing browser storage and logging in again
