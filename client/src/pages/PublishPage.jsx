import { useState } from 'react';
import { toast } from 'react-toastify';
import { api_url } from '../utils/getApiUrl.js';
import { useNavigate } from 'react-router-dom';

export function PublishPage() {
  const [content, setContent] = useState('');
  const navigate = useNavigate();

  async function handlePublish(e) {
    e.preventDefault();

    if (!content) {
      toast.error('Content required');
      return;
    }

    try {
      const response = await fetch(`${api_url}/post/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
        credentials: 'include',
      });
      const data = await response.json();

      if (response.ok) {
        toast.success('Successfully Posted👉');
        navigate(`/home`);
      } else {
        toast.error(data.message || 'Failed to post');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
      console.error('Error posting:', error);
    }
  }

  return (
    <>
      <form aria-label="publish post form" onSubmit={handlePublish}>
        <div>
          <label>Whats on your mind?</label>
          <textarea
            maxLength={1000}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="5" // Controls height
            cols="50" // Controls width
            style={{ width: '100%', height: '150px', resize: 'vertical' }} // Optional styles
          />
        </div>
        <button type={'submit'}>Post</button>
      </form>
    </>
  );
}
