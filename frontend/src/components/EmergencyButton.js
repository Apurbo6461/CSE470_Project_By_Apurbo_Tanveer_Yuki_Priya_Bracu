import React, { useState, useRef, useEffect } from 'react'; // Added useRef and useEffect
import { toast } from 'react-toastify';

const EmergencyButton = ({ onActivate }) => {
  const [isActivating, setIsActivating] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [countdown, setCountdown] = useState(5);
  
  // Use a ref to store the interval ID so we can clear it from any function
  const timerRef = useRef(null);

  // Cleanup: Clear timer if component unmounts to prevent memory leaks
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startEmergencyCountdown = () => {
    setShowConfirm(true);
    setCountdown(5);
    
    // Clear any existing timer before starting a new one
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          activateEmergency();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const activateEmergency = async () => {
    // If we trigger this manually via button, clear the running timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsActivating(true);
    
    const emergencyData = {
      patientName: 'Emergency Patient',
      bloodGroup: 'O+',
      location: { lat: 23.8103, lng: 90.4125 },
      description: 'Emergency medical assistance required',
      timestamp: new Date().toISOString()
    };
    
    try {
      // Ensure onActivate is a function before calling
      if (typeof onActivate === 'function') {
        const result = await onActivate(emergencyData);
        if (result?.success) {
          toast.success('Emergency activated! Help is on the way.');
        }
      }
    } catch (error) {
      console.error('Emergency error:', error);
      toast.error('Failed to activate emergency');
    } finally {
      setIsActivating(false);
      setShowConfirm(false);
    }
  };

  const cancelEmergency = () => {
    // CRITICAL FIX: Stop the countdown timer immediately
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setShowConfirm(false);
    toast.info('Emergency activation cancelled');
  };

  return (
    <div className="emergency-button-wrapper">
      {showConfirm ? (
        <div className="emergency-confirm-modal">
          <div className="confirm-header">
            <i className="fas fa-exclamation-triangle"></i>
            <h3>Confirm Emergency Activation</h3>
          </div>
          
          <div className="confirm-warning">
            <i className="fas fa-exclamation-circle"></i>
            <p>This will alert nearby hospitals and blood donors</p>
          </div>
          
          <div className="countdown-display">
            <div className="countdown-number">{countdown}</div>
            <p>Activating in {countdown} seconds...</p>
          </div>
          
          <div className="confirm-actions">
            <button 
              className="btn confirm-btn"
              onClick={activateEmergency}
              disabled={isActivating}
            >
              {isActivating ? 'Activating...' : 'Activate Now'}
            </button>
            <button 
              className="btn cancel-btn"
              onClick={cancelEmergency}
              disabled={isActivating}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button 
          className="emergency-activation-btn"
          onClick={startEmergencyCountdown}
          disabled={isActivating}
        >
          <i className="fas fa-bell"></i>
          <span>{isActivating ? 'Activating...' : 'Activate Emergency Mode'}</span>
        </button>
      )}
    </div>
  );
};

export default EmergencyButton;