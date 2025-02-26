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
      setComments(data.comments || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  }

  useEffect(() => {
    fetchComments();
  }, []);

  async function handleAddComment() {
    if (!newComment.trim()) {
      toast.error('Comment cannot be empty.');
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
      toast.error(data.message);
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
        toast.success('Deleted post');
      } else {
        toast.error(data.message || 'Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error(data.message);
    }
  }

  return (
    <div className="comments-section">
      <h4 className="text">Comments ({comments.length})</h4>

      {userLoggedIn && (
        <div className="add-comment">
          <input
            type="text"
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="text"
          />
          <button className="add-comment-button" onClick={handleAddComment}>
            Post
          </button>
        </div>
      )}

      {comments.length > 0 ? (
        <ul className="comments-list">
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
