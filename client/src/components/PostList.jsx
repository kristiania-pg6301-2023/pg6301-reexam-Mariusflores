import PostItem from './PostItem';
import { toast } from 'react-toastify';
import '../styling/posts.css'

export default function PostList({ posts }) {
  async function handleDelete(_id) {
    try {
      const response = await fetch(`http://localhost:8000/post/delete/${_id}`, {
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      if (response.ok) {
        toast.success('Post deleted successfully!');
        window.location.reload();
      } else {
        toast.error(data.message || 'Failed to delete post');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
      console.error('Error deleting post:', error);
    }
  }

  async function handleEdit(_id, newContent) {
    try {
      const response = await fetch(`http://localhost:8000/post/edit/${_id}`, {
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newContent }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success('Post updated successfully!');
        window.location.reload();
      } else {
        toast.error(data.message || 'Failed to edit post');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
      console.error('Error editing post:', error);
    }
  }
  async function handleReaction(postId, reaction) {
    try {
      const response = await fetch(`http://localhost:8000/post/react/${postId}`, {
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reaction }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success('Reaction added!');
        setPosts(posts.map((post) =>
          post._id === postId ? { ...post, reactions: [...post.reactions, { reaction }] } : post
        ));
      } else {
        toast.error(data.message || 'Failed to add reaction');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
      console.error('Error adding reaction:', error);
    }
  }

  return (
    <>
      {posts.length === 0 ? <p>No posts available.</p> : null}

      {posts.map((post) => (
        <PostItem key={post._id} post={post} onDelete={handleDelete} onEdit={handleEdit} onReact={handleReaction} />
      ))}
    </>
  );
}
