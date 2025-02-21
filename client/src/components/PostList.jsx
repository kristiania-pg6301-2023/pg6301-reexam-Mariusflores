import PostItem from './PostItem';
import { toast } from 'react-toastify';
import '../styling/PostItem.css';
import { api_url } from '../util/getApiUrl.js';

export default function PostList({ posts, setPosts }) {
  // Delete post and update state
  async function handleDelete(_id) {
    try {
      const response = await fetch(`${api_url}/post/delete/${_id}`, {
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      if (response.ok) {
        toast.success('Post deleted successfully!');
        // Update the state by removing the deleted post
        setPosts(posts.filter((post) => post._id !== _id));
      } else {
        toast.error(data.message || 'Failed to delete post');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
      console.error('Error deleting post:', error);
    }
  }

  // Edit post and update state
  async function handleEdit(_id, newContent) {
    try {
      const response = await fetch(`${api_url}/post/edit/${_id}`, {
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newContent }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success('Post updated successfully!');
        // Update the post content in state
        setPosts(posts.map((post) => (post._id === _id ? { ...post, content: newContent } : post)));
      } else {
        toast.error(data.message || 'Failed to edit post');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
      console.error('Error editing post:', error);
    }
  }

  // Handle reaction and update the state
  async function handleReaction(postId, reaction) {
    try {
      const response = await fetch(`${api_url}/post/react/${postId}`, {
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reaction }),
      });

      const data = await response.json();
      console.log('Backend response data:', data); // Log the response to check userId and reaction

      if (response.ok) {
        toast.success('Reaction updated!');

        /**
         * If else statement for updating state of posts in different scenarios
         * Checks if backend response returns 'reaction removed'
         * */
        if (data.message === 'Reaction removed') {
          // If the reaction was removed, filter it out in the state
          setPosts(
            posts.map((post) =>
              post._id === postId
                ? {
                    ...post,
                    reactions: post.reactions.filter((r) => r.userId !== data.userId), // Remove the reaction
                  }
                : post
            )
          );
          console.log('Post reactions after removal:', posts);
        } else {
          // If the reaction was added/updated, replace the old reaction with the new one
          setPosts(
            posts.map((post) =>
              post._id === postId
                ? {
                    ...post,
                    reactions: post.reactions
                      .filter((r) => r.userId !== data.userId) // Remove previous reaction (if exists)
                      .concat({ userId: data.userId, reaction }), // Add the new or updated reaction
                  }
                : post
            )
          );
          console.log('Post reactions after update:', posts);
        }
      } else {
        toast.error(data.message || 'Failed to add reaction');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
      console.error('Error adding reaction:', error);
    }
  }

  return (
    <div style={{ paddingTop: '70px' }}>
      {posts.length === 0 ? <p>No posts available.</p> : null}

      {posts.map((post) => (
        <PostItem
          key={post._id}
          post={post}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onReact={handleReaction}
        />
      ))}
    </div>
  );
}
