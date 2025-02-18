import { useSubmit } from 'react-router-dom';
import { useState } from 'react';

export function PublishPage() {

  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");
  async function handlePublish(e) {
    e.preventDefault();

    const response = await fetch("http://localhost:8000/post/publish", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({content}),
      credentials: 'include'
    });
    const data = await response.json()

    if(response.ok){
      window.location.href ="http://localhost:5173/";
    } else {
      setMessage(data.message || 'Registraion failed');
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
            rows="5"  // Controls height
            cols="50" // Controls width
            style={{ width: "100%", height: "150px", resize: "vertical" }} // Optional styles
          />
        </div>
        <button type={'submit'}>Post</button>

        
      </form>
    </>
  );
}