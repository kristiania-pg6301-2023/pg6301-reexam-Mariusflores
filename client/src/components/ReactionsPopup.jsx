import PropTypes from 'prop-types';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import { api_url } from '../utils/getApiUrl.js';
import '../styling/ReactionsPopup.css';

export default function ReactionsPopup({ postId, onClose }) {
  const [reactions, setReactions] = useState([]);

  useEffect(() => {
    fetch(`${api_url}/post/reactions/${postId}`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then(setReactions)
      .catch(() => setReactions(null));
  }, []);
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <button className="close-button" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
        <h3>Reactions</h3>
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
      </div>
    </div>
  );
}

ReactionsPopup.propTypes = {
  postId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};
