import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../Notification/NotificationBell';

const Header = () => {
  const { user } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <i className="fas fa-heartbeat"></i>
          <h1>Life<span>Link</span></h1>
        </div>
        
        <div className="header-right">
          <NotificationBell />
          
          <div 
            className="user-menu"
            onMouseEnter={() => setShowUserMenu(true)}
            onMouseLeave={() => setShowUserMenu(false)}
          >
            <div className="user-avatar">
              {user.name.charAt(0)}
            </div>
            <span className="user-name">{user.name}</span>
            
            {showUserMenu && (
              <div className="dropdown-menu">
                <div className="user-info">
                  <div className="user-email">{user.email}</div>
                  <div className="user-blood-group">Blood Group: {user.bloodGroup}</div>
                </div>
                <div className="dropdown-divider"></div>
                <a href="/profile" className="dropdown-item">
                  <i className="fas fa-user"></i> Profile
                </a>
                <a href="/settings" className="dropdown-item">
                  <i className="fas fa-cog"></i> Settings
                </a>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item logout-btn">
                  <i className="fas fa-sign-out-alt"></i> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;