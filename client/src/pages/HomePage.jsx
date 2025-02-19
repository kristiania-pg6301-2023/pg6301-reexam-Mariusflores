import { useEffect, useState } from 'react';
import PostList from '../components/PostList.jsx';

export function HomePage({ user }) {
  if (user) {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
      fetch('http://localhost:8000/post/all', {
        method: 'GET',
        credentials: 'include',
      })
        .then((res) => res.json())
        .then((data) => setPosts(data))
        .catch((error) => console.error('Error fetching posts:', error));
    }, []);

    return <PostList posts={posts}/>;
  } else {
    return <h1>Redirecting to Login page</h1>;
  }
}
