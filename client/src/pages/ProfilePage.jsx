import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PostList from '../components/PostList.jsx';

export function ProfilePage({ user }) {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/login'); // Redirect if user is null
      return;
    }

    if (user.id) {
      // ✅ Declare AbortController inside useEffect
      const controller = new AbortController();
      const signal = controller.signal; // Extract signal

      fetch(`http://localhost:8000/post/user/posts/${user.id}`, {
        credentials: 'include',
        signal: signal, // Attach signal to fetch
      })
        .then((res) => res.json())
        .then((data) => setPosts(data))
        .catch((error) => {
          if (error.name !== 'AbortError') {
            console.error('Error fetching posts:', error);
          }
        });

      // ✅ Cleanup function to prevent memory leaks
      return () => controller.abort();
    }
  }, [user, navigate]);

  if (!user) return null; // Avoid rendering issues

  return (
    <>
      <div>
        <h2>Welcome, {user.username}!</h2>
      </div>
      {<PostList posts={posts} setPosts={setPosts}/>}>
    </>
  );
}
