import { useEffect, useState } from 'react';
import { mapPosts } from '../components/MapPosts.jsx';


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


    return mapPosts(posts);
  }else{
    setTimeout(window.location.href="/login", 1000)
    return (<h1>Redirecting to Login page</h1>)

  }
}
