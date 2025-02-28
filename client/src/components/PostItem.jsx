import { useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import {
  faEllipsisV,
  faTrash,
  faEdit,
  faSave,
  faTimes,
  faCommentDots,
  faThumbsUp,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ReactionsPopup from './ReactionsPopup.jsx';
import '../styling/PostItem.css';
import CommentsSection from './CommentSection.jsx';

// Define available reactions
const REACTIONS = ['👍', '❤️', '😂', '🔥', '😢'];

export default function PostItem({ userLoggedIn, post, onDelete, onEdit, onReact }) {
  const [activeMenu, setActiveMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const [showReactionsPopup, setShowReactionsPopup] = useState(false); // 🔹 Toggle reactions
  const [showComments, setShowComments] = useState(false); // 🔹 Toggle comments

  function toggleMenu() {
    setActiveMenu(!activeMenu);
  }

  function handleEdit() {
    setIsEditing(true);
    setActiveMenu(false);
  }

  async function handleSave() {
    if (!editedContent.trim()) {
      toast.error('Content required.');
      return;
    }
    await onEdit(post._id, editedContent);
    setIsEditing(false);
  }

  async function handleReaction(reaction) {
    await onReact(post._id, reaction);
  }

  return (
    <div className="post-container">
      <button className="menu-button" onClick={toggleMenu} aria-label="More options">
        <FontAwesomeIcon icon={faEllipsisV} size="sm" />
      </button>

      {activeMenu && (
        <div className="dropdown-menu">
          <button className="dropdown-item" aria-label="edit-post-button" onClick={handleEdit}>
            <FontAwesomeIcon icon={faEdit} /> Edit
          </button>
          <button
            className="dropdown-item delete"
            aria-label="delete-post-button"
            onClick={() => onDelete(post._id)}
          >
            <FontAwesomeIcon icon={faTrash} /> Delete
          </button>
        </div>
      )}

      <h3 className="post-username text">{post.username || 'Unknown User'}</h3>
      <h2 className="post-title text">{post.title}</h2>

      {isEditing ? (
        <div className="edit-container">
          <textarea
            className="edit-textarea"
            aria-label="edit textarea"
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
          />
          <div className="edit-buttons">
            <button className="save-button" aria-label="save edit button" onClick={handleSave}>
              <FontAwesomeIcon icon={faSave} /> Save
            </button>
            <button className="cancel-button" onClick={() => setIsEditing(false)}>
              <FontAwesomeIcon icon={faTimes} /> Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="post-content text">{post.content}</p>
      )}

      <p className="post-timestamp text">{new Date(post.timestamp).toLocaleString()}</p>

      {/* Reactions Section */}
      <div className="reaction-bar">
        {REACTIONS.map((reaction) => (
          <button
            key={reaction}
            className="reaction-button"
            onClick={() => handleReaction(reaction)}
          >
            {reaction} {post.reactions?.filter((r) => r.reaction === reaction).length || 0}
          </button>
        ))}
      </div>

      {userLoggedIn && (
        <div className="post-actions">
          {/* Toggle Button for Reactions */}
          <button
            className="action-button"
            onClick={() => setShowReactionsPopup(!showReactionsPopup)}
          >
            <FontAwesomeIcon icon={faThumbsUp} />
            {showReactionsPopup ? 'Hide Reactions' : 'Show Reactions'}
          </button>

          {/* Toggle Button for Comments */}
          <button
            className="action-button"
            onClick={() => setShowComments(!showComments)}
            aria-label="Toggle comments"
          >
            <FontAwesomeIcon icon={faCommentDots} />{' '}
            {showComments ? 'Hide Comments' : 'Show Comments'}
          </button>
        </div>
      )}

      {/* Conditional Rendering for Reactions */}
      {showReactionsPopup && (
        <div className="reactions-dropdown">
          <ReactionsPopup postId={post._id} onClose={() => setShowReactionsPopup(false)} />
        </div>
      )}

      {/* Conditional Rendering for Comments */}
      {showComments && (
        <div className="comments-dropdown">
          <CommentsSection postId={post._id} userLoggedIn={userLoggedIn} />
        </div>
      )}
    </div>
  );
}

PostItem.propTypes = {
  post: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    timestamp: PropTypes.string.isRequired,
    reactions: PropTypes.arrayOf(
      PropTypes.shape({
        userId: PropTypes.string.isRequired,
        reaction: PropTypes.string.isRequired,
      })
    ).isRequired,
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onReact: PropTypes.func.isRequired,
  userLoggedIn: PropTypes.bool.isRequired,
};
