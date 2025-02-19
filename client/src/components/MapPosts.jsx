import { useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styling/posts.css';
import { faEllipsisV, faTrash, faEdit, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export function mapPosts(posts) {
  const [activeMenu, setActiveMenu] = useState(null);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editedContent, setEditedContent] = useState("");

  function toggleMenu(postId) {
    setActiveMenu(activeMenu === postId ? null : postId);
  }

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

  function handleEdit(post) {
    setEditingPostId(post._id);
    setEditedContent(post.content);
    setActiveMenu(null); // Close dropdown when editing
  }

  async function handleSaveEdit(_id) {
    if (!editedContent.trim()) {
      toast.error('Post content cannot be empty.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/post/edit/${_id}`, {
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newContent: editedContent }),
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

    setEditingPostId(null);
  }

  function handleCancelEdit() {
    setEditingPostId(null);
    setEditedContent("");
  }

  return (
    <>
      {posts.length === 0 ? <p>No posts available.</p> : null}

      {posts.map((post) => (
        <div className="post-container" key={post._id}>
          {/* Three-dot menu button */}
          <button className="menu-button" onClick={() => toggleMenu(post._id)} aria-label="More options">
            <FontAwesomeIcon icon={faEllipsisV} size="sm" />
          </button>

          {/* Dropdown menu */}
          {activeMenu === post._id && (
            <div className="dropdown-menu">
              <button className="dropdown-item" onClick={() => handleEdit(post)}>
                <FontAwesomeIcon icon={faEdit} /> Edit
              </button>
              <button className="dropdown-item delete" onClick={() => handleDelete(post._id)}>
                <FontAwesomeIcon icon={faTrash} /> Delete
              </button>
            </div>
          )}

          <h3 className="post-username">{post.username || 'Unknown User'}</h3>

          {/* Show textarea if editing, otherwise show normal content */}
          {editingPostId === post._id ? (
            <div className="edit-container">
              <textarea
                className="edit-textarea"
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
              />
              <div className="edit-buttons">
                <button className="save-button" onClick={() => handleSaveEdit(post._id)}>
                  <FontAwesomeIcon icon={faSave} /> Save
                </button>
                <button className="cancel-button" onClick={handleCancelEdit}>
                  <FontAwesomeIcon icon={faTimes} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="post-content">{post.content}</p>
          )}

          <p className="post-timestamp">{new Date(post.timestamp).toLocaleString()}</p>
        </div>
      ))}
    </>
  );
}
