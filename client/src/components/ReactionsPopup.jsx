import PropTypes from 'prop-types';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import { api_url } from '../utils/getApiUrl.js';
import '../styling/ReactionsPopup.css';

export default function ReactionsPopup({ postId, onClose }) {
  const [reactions, setReactions] = useState([]);
  const [loading, setLoading] = useState(true); // <-- Add loading state

  useEffect(() => {
    setLoading(true); // Set loading to true before fetching
    fetch(`${api_url}/post/reactions/${postId}`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        console.log('Reactions API Response:', data);
        if (data && data.reactions) {
          setReactions(data.reactions);
        } else {
          setReactions([]);
        }
      })
      .catch(() => setReactions([]))
      .finally(() => setLoading(false)); // <-- Set loading to false after fetching
  }, [postId]);

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <button className="close-button" onClick={onClose} aria-label="close">
          <FontAwesomeIcon icon={faTimes} />
        </button>
        <h3>Reactions</h3>

        {/* Show loading indicator while fetching */}
        {loading ? (
          <p>Loading reactions...</p> // <-- Add a loading message
        ) : (
          <ul className="reaction-list">
            {reactions.length > 0 ? (
              reactions.map((reaction, index) => (
                <li key={index} className="reaction-item">
                  {reaction.username} ({reaction.reaction})
                </li>
              ))
            ) : (
              <p>No reactions yet.</p>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}

ReactionsPopup.propTypes = {
  postId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};
