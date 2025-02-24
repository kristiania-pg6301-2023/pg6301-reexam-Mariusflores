import { useEffect, useState } from 'react';
import PostList from '../components/PostList.jsx';
import { api_url } from '../utils/getApiUrl.js';
import PropTypes from 'prop-types';

export function HomePage({ user }) {
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

  return <PostList userLoggedIn={!!user} posts={posts} setPosts={setPosts} />;
}

HomePage.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string, // Assuming user.id is a string
    username: PropTypes.string, // Assuming user.username is a string
    verified: PropTypes.bool,
  }),
};
