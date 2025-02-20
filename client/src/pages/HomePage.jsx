import { useEffect, useState } from 'react';
import PostList from '../components/PostList.jsx';
import { api_url } from '../util/getApiUrl.js';

export function HomePage() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch(`${api_url}/post/all`, {
      method: 'GET',
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .catch((error) => console.error('Error fetching posts:', error));
  }, []);

  return <PostList posts={posts} setPosts={setPosts} />;
}
