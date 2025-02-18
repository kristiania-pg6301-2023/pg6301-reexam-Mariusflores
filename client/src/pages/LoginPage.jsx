import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export function LoginPage({setUser}) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");


  const handleGoogleLogin = async () => {
    window.location.href = 'http://localhost:8000/auth/google';
  };

  async function handleLogin(e) {
    e.preventDefault()

    const response = await fetch("http://localhost:8000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({username, password}),
      credentials: 'include'
    });
    if (response.ok){
      const data = await response.json();
      setUser(data.user);
      if(confirm("Successfully Logged in")){
        navigate('/profile');
      }
    }

  }

  return (
    <>
      <form onSubmit={handleLogin}>
        <h2>Login</h2>
        <div>
          <label>Username:</label>
          <input type="text" value={username}
                 onChange={(e) => setUsername(e.target.value)}
                 required
          />
        </div>
        <div>
          <label>Password:</label>
          <input type="password"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 required
          />
        </div>
        <button onClick={handleLogin}>Log in</button>



      </form>

    <div>
      <button onClick={handleGoogleLogin}>Log in with Google</button>
    </div>
      <p>Dont have an account? <Link to={'/register'}>register</Link> or log in with Google (Recommended)</p>



    </>
  );
}
