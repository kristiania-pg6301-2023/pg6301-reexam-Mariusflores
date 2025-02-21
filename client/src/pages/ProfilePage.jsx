import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PostList from '../components/PostList.jsx';
import SettingsButton from '../components/SettingsButton.jsx';
import { api_url } from '../utils/getApiUrl.js';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCertificate } from '@fortawesome/free-solid-svg-icons';
import '../styling/ProfilePage.css';
import '../styling/Icon.css';

export function ProfilePage({ user, setUser }) {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.id) {
      const controller = new AbortController();
      const signal = controller.signal;

      fetch(`${api_url}/post/user/posts/${user.id}`, {
        credentials: 'include',
        signal: signal,
      })
        .then((res) => res.json())
        .then((data) => setPosts(data))
        .catch((error) => {
          if (error.name !== 'AbortError') {
            console.error('Error fetching posts:', error);
          }
        });

      return () => controller.abort();
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <>
      <div className="profile-header">
        <div className="username-container">
          {user.verified && <FontAwesomeIcon className="verified-icon icon" icon={faCertificate} />}
          <h2>{user.username}</h2>
        </div>
        <SettingsButton user={user} setUser={setUser} />
      </div>
      <PostList posts={posts} setPosts={setPosts} />
    </>
  );
}

ProfilePage.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired, // Assuming user.id is a string
    username: PropTypes.string.isRequired, // Assuming user.username is a string
    verified: PropTypes.bool.isRequired,
  }).isRequired, // user prop is required
  setUser: PropTypes.func.isRequired,
};
