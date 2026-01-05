import React, { useState, useEffect } from 'react'; // Combined all imports into one
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { toast } from 'react-toastify';

const AvailabilityToggle = () => {
  const { user, updateDonorAvailability } = useAuth();
  const { emit } = useSocket();
  
  // Added optional chaining (user?) to prevent crashing if user is null
  const [isAvailable, setIsAvailable] = useState(user?.donorProfile?.available || false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Sync state if user profile updates externally
  useEffect(() => {
    if (user?.donorProfile) {
      setIsAvailable(user.donorProfile.available);
    }
  }, [user?.donorProfile]);

  const handleToggle = async () => {
    if (isUpdating || !user?.donorProfile) return;
    
    setIsUpdating(true);
    const newStatus = !isAvailable;
    
    try {
      const result = await updateDonorAvailability(newStatus);
      
      if (result.success) {
        setIsAvailable(newStatus);
        
        // Emit socket event for real-time updates
        if (emit) {
          emit('donor-availability', {
            donorId: user.donorProfile.id || user.donorProfile._id, // Support for both id formats
            available: newStatus,
            name: user.name,
            timestamp: new Date().toISOString()
          });
        }
        
        toast.success(`You are now ${newStatus ? 'available' : 'unavailable'} as a donor`);
      } else {
        toast.error('Failed to update availability');
      }
    } catch (error) {
      console.error('Error updating availability:', error);
      toast.error('Error updating availability');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="availability-toggle">
      <div className="toggle-label">
        <span className="label-text">Donor Status:</span>
        <span className={`status-badge ${isAvailable ? 'available' : 'unavailable'}`}>
          {isAvailable ? 'Available' : 'Unavailable'}
        </span>
      </div>
      
      <label className="toggle-switch">
        <input 
          type="checkbox" 
          checked={isAvailable}
          onChange={handleToggle}
          disabled={isUpdating}
        />
        <span className="toggle-slider"></span>
        {isUpdating && <div className="toggle-loading"></div>}
      </label>
    </div>
  );
};

export default AvailabilityToggle;