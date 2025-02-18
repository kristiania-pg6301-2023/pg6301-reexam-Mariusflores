import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import{faGoogle } from '@fortawesome/free-brands-svg-icons';
import { faUser, faKey} from '@fortawesome/free-solid-svg-icons';

export function LoginPage({ setUser }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleGoogleLogin = async () => {
    window.location.href = 'http://localhost:8000/auth/google';
  };

  async function handleLogin(e) {
    e.preventDefault();

    const response = await fetch('http://localhost:8000/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
      credentials: 'include',
    });
    if (response.ok) {
      const data = await response.json();
      setUser(data.user);
      if (confirm('Successfully Logged in')) {
        navigate('/profile');
      }
    }
  }

  return (
    <>
      <form onSubmit={handleLogin}>
        <h2>Login</h2>
        <div style={{ display: "flex", alignItems: "center", border: "1px solid gray", padding: "5px", borderRadius: "5px" }}>
          <FontAwesomeIcon icon={faUser} style={{ marginRight: "8px" }} />
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            style={{ border: "none", outline: "none", flex: 1 }}
            required
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", border: "1px solid gray", padding: "5px", borderRadius: "5px" }}>
          <FontAwesomeIcon icon={faKey} style={{ marginRight: "8px" }} />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            style={{ border: "none", outline: "none", flex: 1 }}
            required
          />
        </div>
        <button onClick={handleLogin}>Log in</button>
      </form>

      <div>
        <button
          onClick={handleGoogleLogin}
          style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 15px" }}
        >
          <FontAwesomeIcon icon={faGoogle} size="lg" />
          Log in with Google
        </button>

      </div>
      <p>
        Dont have an account? <Link to={'/register'}>register</Link> or log in with Google
        (Recommended)
      </p>
    </>
  );
}
