import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styling/posts.css';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';

export function mapPosts(posts) {
  async function handleDelete(_id) {
    try {
      const response = await fetch(`http://localhost:8000/post/delete/${_id}`, {
        credentials: 'include',
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Post deleted successfully!");
        window.location.reload();
      } else {
        toast.error(data.message || "Failed to delete post");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
      console.error("Error deleting post:", error);
    }
  }

  return (
    <>
      {posts.length === 0 ? <p>No posts available.</p> : null}

      {posts.map((post) => (
        <div className="post-container" key={post._id}>
          <button
            className="delete-button"
            onClick={() => handleDelete(post._id)}
            aria-label="Delete post"
          >
            <FontAwesomeIcon icon={faTrash} size={'sm'} />
          </button>
          <h3 className="post-username">{post.username || 'Unknown User'}</h3>
          <p className="post-content">{post.content}</p>
          <p className="post-timestamp">
            {new Date(post.timestamp).toLocaleString()}
          </p>
        </div>
      ))}
    </>
  );
}
