import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PostList from '../components/PostList.jsx';
import SettingsButton from '../components/SettingsButton.jsx';


export function ProfilePage({ user }) {
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

      fetch(`http://localhost:8000/post/user/posts/${user.id}`, {
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
        <h2>Welcome, {user.username}!</h2>
        <SettingsButton user={user} />
      </div>
      <PostList posts={posts} setPosts={setPosts} />
    </>
  );
}
