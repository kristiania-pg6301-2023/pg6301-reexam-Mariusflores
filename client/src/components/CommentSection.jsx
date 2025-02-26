import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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

      if (!response.ok) throw new Error('Failed to add comment');

      const responseData = await response.json();
      setComments((prevComments) => [...prevComments, responseData.comment]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  }

  async function handleDeleteComment(commentId) {
    try {
      await fetch(`${api_url}/comment/${commentId}`, { method: 'DELETE' });
      setComments((prevComments) => prevComments.filter((comment) => comment._id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
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
