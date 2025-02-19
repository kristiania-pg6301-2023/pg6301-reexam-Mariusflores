import PostItem from './PostItem';
import { toast } from 'react-toastify';

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

  return (
    <>
      {posts.length === 0 ? <p>No posts available.</p> : null}

      {posts.map((post) => (
        <PostItem key={post._id} post={post} onDelete={handleDelete} onEdit={handleEdit} />
      ))}
    </>
  );
}
