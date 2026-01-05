import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    bloodGroup: 'O+',
    isDonor: true,
    donorProfile: { id: 1, available: true }
  });

  const [notifications, setNotifications] = useState([
    { id: 1, type: 'system', title: 'Welcome to LifeLink', message: 'Your account has been created successfully', read: false, timestamp: '2023-11-20T10:00:00Z' },
    { id: 2, type: 'emergency', title: 'Emergency Alert', message: 'New emergency in your area', read: false, timestamp: '2023-11-20T09:30:00Z' },
    { id: 3, type: 'donor', title: 'Donor Request', message: 'Blood needed for O+ patient', read: true, timestamp: '2023-11-19T14:15:00Z' }
  ]);

  const updateUser = (updates) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  const updateDonorAvailability = async (available) => {
    try {
      const response = await fetch(`http://localhost:5000/api/donors/1/availability`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available })
      });
      
      if (response.ok) {
        setUser(prev => ({
          ...prev,
          donorProfile: { ...prev.donorProfile, available }
        }));
        return { success: true };
      }
    } catch (error) {
      console.error('Error updating availability:', error);
    }
    return { success: false };
  };

  const markNotificationAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const addNotification = (notification) => {
    setNotifications(prev => [
      { ...notification, id: Date.now(), read: false, timestamp: new Date().toISOString() },
      ...prev
    ]);
  };

  const value = {
    user,
    notifications,
    unreadCount: notifications.filter(n => !n.read).length,
    updateUser,
    updateDonorAvailability,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    addNotification
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};