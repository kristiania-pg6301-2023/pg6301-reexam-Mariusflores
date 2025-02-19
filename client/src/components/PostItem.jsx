import { useState } from 'react';
import { toast } from 'react-toastify';
import { faEllipsisV, faTrash, faEdit, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function PostItem({ post, onDelete, onEdit }) {
  const [activeMenu, setActiveMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);

  function toggleMenu() {
    setActiveMenu(!activeMenu);
  }

  function handleEdit() {
    setIsEditing(true);
    setActiveMenu(false);
  }

  async function handleSave() {
    if (!editedContent.trim()) {
      toast.error('Post content cannot be empty.');
      return;
    }

    await onEdit(post._id, editedContent);
    setIsEditing(false);
  }

  return (
    <div className="post-container">
      <button className="menu-button" onClick={toggleMenu} aria-label="More options">
        <FontAwesomeIcon icon={faEllipsisV} size="sm" />
      </button>

      {activeMenu && (
        <div className="dropdown-menu">
          <button className="dropdown-item" onClick={handleEdit}>
            <FontAwesomeIcon icon={faEdit} /> Edit
          </button>
          <button className="dropdown-item delete" onClick={() => onDelete(post._id)}>
            <FontAwesomeIcon icon={faTrash} /> Delete
          </button>
        </div>
      )}

      <h3 className="post-username">{post.username || 'Unknown User'}</h3>

      {isEditing ? (
        <div className="edit-container">
          <textarea
            className="edit-textarea"
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
          />
          <div className="edit-buttons">
            <button className="save-button" onClick={handleSave}>
              <FontAwesomeIcon icon={faSave} /> Save
            </button>
            <button className="cancel-button" onClick={() => setIsEditing(false)}>
              <FontAwesomeIcon icon={faTimes} /> Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="post-content">{post.content}</p>
      )}

      <p className="post-timestamp">{new Date(post.timestamp).toLocaleString()}</p>
    </div>
  );
}
