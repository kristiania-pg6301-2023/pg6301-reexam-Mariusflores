import { useEffect, useState } from 'react';
import '../styling/posts.css'

export function HomePage({user}) {
  if(user) {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
      fetch("http://localhost:8000/post/all", {
        method: "GET",
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => setPosts(data))
        .catch((error) => console.error("Error fetching posts:", error));
    }, []);



    return (
      <>
        {posts.length === 0 ? <p>No posts available.</p> : null}

        {posts.map((post) => (
          <div className={'post-container'} key={post._id}> {/* Add unique key */}
            <h3 className={'post-username'}>{post.username || "Unknown User"}</h3>
            <p className={'post-content'}>{post.content}</p>
            <p className={'post-timestamp'}>{new Date(post.timestamp).toLocaleString()}</p> {/* Format timestamp */}
          </div>
        ))}
      </>
    );
  }else{
    return (<h1>Log in to explore😃</h1>)
  }
}
