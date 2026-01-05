import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { toast } from 'react-toastify';

const NotificationBell = () => {
  const { notifications, unreadCount, markNotificationAsRead, markAllNotificationsAsRead, addNotification } = useAuth();
  const { on, off } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Handle clicks outside dropdown
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Listen for socket notifications
    const handleNewNotification = (data) => {
      addNotification({
        type: data.type || 'system',
        title: data.title || 'New Notification',
        message: data.message || 'You have a new notification',
        timestamp: data.timestamp || new Date().toISOString()
      });

      toast.info(data.message || 'New notification received', {
        onClick: () => setIsOpen(true)
      });
    };

    const handleNewEmergency = (data) => {
      addNotification({
        type: 'emergency',
        title: 'Emergency Alert',
        message: `New emergency for ${data.emergency.bloodGroup} blood`,
        timestamp: new Date().toISOString()
      });

      toast.warning(`🚨 Emergency: ${data.emergency.bloodGroup} needed nearby!`, {
        autoClose: false,
        onClick: () => setIsOpen(true)
      });
    };

    if (on) {
      on('new-notification', handleNewNotification);
      on('new-emergency', handleNewEmergency);
    }

    return () => {
      if (off) {
        off('new-notification', handleNewNotification);
        off('new-emergency', handleNewEmergency);
      }
    };
  }, [on, off, addNotification]);

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markNotificationAsRead(notification.id);
    }
    setIsOpen(false);
  };

  return (
    <div className="notification-wrapper" ref={dropdownRef}>
      <button 
        className="notification-bell-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        <i className="fas fa-bell"></i>
        {unreadCount > 0 && (
          <span className="notification-count">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            <button 
              className="mark-all-read"
              onClick={() => {
                markAllNotificationsAsRead();
                setIsOpen(false);
              }}
            >
              Mark all read
            </button>
          </div>
          
          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="notification-empty">
                No notifications
              </div>
            ) : (
              notifications.slice(0, 5).map(notification => (
                <div
                  key={notification.id}
                  className={`notification-item ${notification.read ? '' : 'unread'}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-icon">
                    <i className={`fas fa-${notification.type === 'emergency' ? 'exclamation-triangle' : 
                                    notification.type === 'donor' ? 'tint' : 'info-circle'}`}></i>
                  </div>
                  <div className="notification-content">
                    <div className="notification-title">{notification.title}</div>
                    <div className="notification-message">{notification.message}</div>
                    <div className="notification-time">
                      {new Date(notification.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                  {!notification.read && (
                    <div className="notification-unread-dot"></div>
                  )}
                </div>
              ))
            )}
          </div>
          
          <div className="notification-footer">
            <a href="/notifications" onClick={() => setIsOpen(false)}>
              View all notifications
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;