import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import '../styling/CommentSection.css';
import { api_url } from '../utils/getApiUrl.js';
import { CommentItem } from './CommentItem.jsx';

export default function CommentsSection({ postId, userLoggedIn }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  async function fetchComments() {
    try {
      const response = await fetch(`${api_url}/comment/${postId}`, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok) {
        setComments(data.comments || []);
      } else {
        toast.error(data.message || 'Failed to fetch comments');
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error(error.message);
    }
  }

  useEffect(() => {
    fetchComments();
  }, []);

  async function handleAddComment(e) {
    e.preventDefault();
    if (!newComment.trim()) {
      console.log('blocking api call');
      toast.error('Comment cannot be empty.');
      console.log('sent toast error');
      return;
    }

    try {
      const response = await fetch(`${api_url}/comment/${postId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment }),
        credentials: 'include',
      });

      const data = await response.json();
      if (response.ok) {
        setComments((prevComments) => [...prevComments, data.comment]);
        toast.success('Successfully added comment');
        setNewComment('');
      } else {
        toast.error(data.message || 'Failed to comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error(error.message);
    }
  }

  async function handleDeleteComment(commentId) {
    try {
      const response = await fetch(`${api_url}/comment/delete/${commentId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      setComments((prevComments) => prevComments.filter((comment) => comment._id !== commentId));
      const data = await response.json();
      if (response.ok) {
        toast.success('Comment deleted');
      } else {
        toast.error(data.message || 'Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error(error.message);
    }
  }

  return (
    <div className="comments-section">
      <h4 className="text">Comments ({comments.length})</h4>

      {userLoggedIn && (
        <form aria-label="comment form" className="add-comment" onSubmit={handleAddComment}>
          <input
            type="text"
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="text"
          />
          <button type="submit" className="add-comment-button">
            Post
          </button>
        </form>
      )}

      {comments.length > 0 ? (
        <ul aria-label="comments list" className="comments-list">
          {comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              userLoggedIn={userLoggedIn}
              onDelete={handleDeleteComment}
            />
          ))}
        </ul>
      ) : (
        <p className="no-comments text">No comments yet. Be the first to comment!</p>
      )}
    </div>
  );
}

CommentsSection.propTypes = {
  postId: PropTypes.string.isRequired,
  userLoggedIn: PropTypes.bool.isRequired,
};
