import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import '../styling/SettingsButton.css';
import { api_url } from '../util/getApiUrl.js';
import { toast } from 'react-toastify';

export default function SettingsButton({ user }) {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(user?.username || '');

  async function handleSaveUsername() {
    if (!newUsername.trim()) {
      alert("Username can't be empty.");
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
        setIsEditingUsername(false);
        window.location.reload();
      } else {
        toast.error(data.message || 'Failed to change username.');

      }
    } catch (error) {
      toast.error(error || "Internal Server error")
      console.error('Error changing username:', error);
    }
  }

  return (
    <div className="settings-container">
      <button onClick={() => setShowMenu(!showMenu)} className="settings-button">
        <FontAwesomeIcon icon={faCog} size="lg" />
      </button>
      {showMenu && (
        <div className="dropdown-menu">
          <button className="dropdown-item" onClick={() => setIsEditingUsername(true)}>
            Change Username
          </button>
          <button className="dropdown-item disabled" disabled>
            Change Account Role (WIP)
          </button>
        </div>
      )}

      {isEditingUsername && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>Edit Username</h3>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="popup-input"
            />
            <div className="popup-buttons">
              <button onClick={handleSaveUsername} className="save-button">
                <FontAwesomeIcon icon={faSave} /> Save
              </button>
              <button onClick={() => setIsEditingUsername(false)} className="cancel-button">
                <FontAwesomeIcon icon={faTimes} /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
