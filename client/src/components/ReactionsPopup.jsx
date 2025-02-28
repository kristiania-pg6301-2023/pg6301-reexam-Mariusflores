import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { api_url } from '../utils/getApiUrl.js';
import '../styling/ReactionsPopup.css';

export default function ReactionsPopup({ postId }) {
  const [reactions, setReactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${api_url}/post/reactions/${postId}`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        console.log('Reactions API Response:', data);
        setReactions(data?.reactions || []);
      })
      .catch(() => setReactions([]))
      .finally(() => setLoading(false));
  }, [postId]);

  return (
    <div className="reactions-dropdown-content">
      <h3>Reactions</h3>

      {/* Show loading indicator while fetching */}
      {loading ? (
        <p className="loading-text">Loading reactions...</p>
      ) : reactions.length > 0 ? (
        <ul className="reaction-list">
          {reactions.map((reaction, index) => (
            <li key={index} className="reaction-item">
              {reaction.username} ({reaction.reaction})
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-reactions">No reactions yet.</p>
      )}
    </div>
  );
}

ReactionsPopup.propTypes = {
  postId: PropTypes.string.isRequired,
};
