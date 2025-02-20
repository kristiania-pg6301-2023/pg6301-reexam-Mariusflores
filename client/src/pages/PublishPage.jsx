import { useState } from 'react';
import { toast } from 'react-toastify';
import { api_url } from '../util/getApiUrl.js';

export function PublishPage() {
  const [content, setContent] = useState('');

  async function handlePublish(e) {
    try {
      e.preventDefault();

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
        window.location.href = 'http://localhost:5173/home';
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
      <form onSubmit={handlePublish}>
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
