import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';

export function CommentItem({ comment, userLoggedIn, onDelete }) {
  return (
    <li aria-label="list item" className="comment-item">
      <strong className="text">{comment.username}:</strong>
      <span className="text">{comment.content}</span>
      <span className="comment-time text">{new Date(comment.timestamp).toLocaleString()}</span>
      {userLoggedIn && (
        <button
          aria-label="delete comment button"
          className="delete-comment"
          onClick={() => onDelete(comment._id)}
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
      )}
    </li>
  );
}

CommentItem.propTypes = {
  comment: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    timestamp: PropTypes.string.isRequired,
  }).isRequired,
  userLoggedIn: PropTypes.bool.isRequired,
  onDelete: PropTypes.func.isRequired,
};
