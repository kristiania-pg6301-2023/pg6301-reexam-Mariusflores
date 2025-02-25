import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import '../styling/SettingsButton.css';
import { api_url } from '../utils/getApiUrl.js';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

export default function SettingsButton({ user, setUser }) {
  // Added setUser to update the user state
  const [showMenu, setShowMenu] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [becomeVerified, setBecomeVerified] = useState(false);
  const [newUsername, setNewUsername] = useState(user?.username || '');

  async function handleSaveUsername() {
    if (newUsername.trim() === '') {
      toast.error("Username can't be empty.");
      return;
    }

    try {
      const response = await fetch(`${api_url}/user/change-username`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newUsername }),
      });

      const data = await response.json();
      if (response.ok) {
        setUser((prevUser) => ({
          ...prevUser,
          username: newUsername,
        }));
        setIsEditingUsername(false);
      } else {
        toast.error(data.message || 'Failed to change username.');
      }
    } catch (error) {
      toast.error(error || 'Internal Server error');
      console.error('Error changing username:', error);
    }
  }

  async function handleVerify() {
    try {
      const response = await fetch(`${api_url}/user/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        // Update user state to reflect verification
        setUser((prevUser) => ({
          ...prevUser,
          verified: true, // Assuming verified is a boolean now
        }));
        toast.success('You are now verified');
        setBecomeVerified(false);
      } else {
        toast.error(data.message || 'Could not verify');
      }
    } catch (error) {
      toast.error(error.message || 'Internal Server Error');
    }
  }

  return (
    <div className="settings-container">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="settings-button"
        aria-label="settings-button"
      >
        <FontAwesomeIcon icon={faCog} size="lg" />
      </button>
      {showMenu && (
        <div className="dropdown-menu">
          <button
            className="dropdown-item"
            aria-label="change-username"
            onClick={() => setIsEditingUsername(true)}
          >
            Change Username
          </button>
          <button
            className="dropdown-item"
            aria-label="verify"
            onClick={() => setBecomeVerified(true)}
          >
            Become Verified
          </button>
        </div>
      )}

      {isEditingUsername && (
        <div className="popup-overlay">
          <div className="popup">
            <h3 style={{ color: 'black' }}>Enter new username</h3>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="popup-input"
            />
            <div className="popup-buttons">
              <button
                onClick={handleSaveUsername}
                className="save-button"
                aria-label="save-username"
              >
                <FontAwesomeIcon icon={faSave} /> Save
              </button>
              <button
                onClick={() => setIsEditingUsername(false)}
                className="cancel-button"
                aria-label="cancel-change-username"
              >
                <FontAwesomeIcon icon={faTimes} /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {becomeVerified && (
        <div className="popup-overlay">
          <div className="popup">
            <h3 style={{ color: 'black' }}>Are you sure you want to become verified?</h3>
            <div className="popup-buttons">
              <button onClick={handleVerify} className="save-button" aria-label="confirm-verify">
                <FontAwesomeIcon icon={faSave} /> Become Verified
              </button>
              <button
                onClick={() => setBecomeVerified(false)}
                className="cancel-button"
                aria-label={'cancel-verify'}
              >
                <FontAwesomeIcon icon={faTimes} /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

SettingsButton.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string.isRequired,
    verified: PropTypes.bool.isRequired, // Change to boolean
  }).isRequired, // user object is required for this component
  setUser: PropTypes.func.isRequired, // Function to update user state
};
