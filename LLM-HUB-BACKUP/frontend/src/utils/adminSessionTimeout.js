/**
 * Admin Session Timeout Utility
 * 
 * This utility handles automatic logout for admin users after a period of inactivity.
 * It tracks user activity and logs out the user after the specified timeout period.
 */

import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// Session timeout in milliseconds (30 minutes)
const SESSION_TIMEOUT = 30 * 60 * 1000;

/**
 * Hook to handle admin session timeout
 * @returns {Object} - Functions to manage the session timeout
 */
export const useSessionTimeout = () => {
  const navigate = useNavigate();

  // Function to reset the timeout timer
  const resetTimer = useCallback(() => {
    if (!localStorage.getItem('admin_token')) return;
    
    // Set last activity timestamp
    localStorage.setItem('lastActivity', Date.now().toString());
  }, []);

  // Function to check if session has timed out
  const checkTimeout = useCallback(() => {
    const adminToken = localStorage.getItem('admin_token');
    if (!adminToken) return;

    const lastActivity = localStorage.getItem('lastActivity');
    if (!lastActivity) {
      resetTimer();
      return;
    }

    const now = Date.now();
    const lastActivityTime = parseInt(lastActivity, 10);
    const timeSinceLastActivity = now - lastActivityTime;

    if (timeSinceLastActivity > SESSION_TIMEOUT) {
      // Session has timed out, log the user out
      localStorage.removeItem('admin_token');
      localStorage.removeItem('lastActivity');
      
      // Navigate to login page with timeout message
      navigate('/admin-login?timeout=true');
    }
  }, [navigate, resetTimer]);

  // Set up event listeners for user activity
  useEffect(() => {
    if (!localStorage.getItem('admin_token')) return;

    // Reset timer on initial load
    resetTimer();

    // Set up interval to check for timeout
    const intervalId = setInterval(checkTimeout, 60000); // Check every minute

    // Set up event listeners for user activity
    const activityEvents = [
      'mousedown', 'mousemove', 'keypress', 
      'scroll', 'touchstart', 'click'
    ];

    const handleActivity = () => resetTimer();

    // Add event listeners
    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Clean up
    return () => {
      clearInterval(intervalId);
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [resetTimer, checkTimeout]);

  return {
    resetTimer,
    checkTimeout
  };
};

/**
 * Manually reset the session timeout
 */
export const resetSessionTimeout = () => {
  if (localStorage.getItem('admin_token')) {
    localStorage.setItem('lastActivity', Date.now().toString());
  }
};

/**
 * Check if the session has timed out
 * @returns {boolean} - True if the session has timed out
 */
export const hasSessionTimedOut = () => {
  const adminToken = localStorage.getItem('admin_token');
  if (!adminToken) return false;

  const lastActivity = localStorage.getItem('lastActivity');
  if (!lastActivity) return false;

  const now = Date.now();
  const lastActivityTime = parseInt(lastActivity, 10);
  const timeSinceLastActivity = now - lastActivityTime;

  return timeSinceLastActivity > SESSION_TIMEOUT;
};
