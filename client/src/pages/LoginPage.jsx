import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faGoogle } from '@fortawesome/free-brands-svg-icons';
import { faUser, faKey } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { api_url } from '../util/getApiUrl.js';

export function LoginPage({ setUser }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleGoogleLogin = async () => {
    window.location.href = `${api_url}/auth/google'`;
  };
  function handleGithubLogin() {
    window.location.href = `${api_url}/auth/github`;
  }

  async function handleLogin(e) {
    try {
      e.preventDefault();

      const response = await fetch(`${api_url}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });
      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        navigate('/home');
      } else {
        toast.error(
          data.message || 'Failed to log in, Please make sure Username/Password is correct'
        );
      }
    } catch (error) {
      toast.error('An error occurred. Please make sure Username and Password is correct');
      console.error('Error logging in:', error);
    }
  }

  return (
    <>
      <form onSubmit={handleLogin}>
        <h2>Login</h2>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            border: '1px solid gray',
            padding: '5px',
            borderRadius: '5px',
          }}
        >
          <FontAwesomeIcon icon={faUser} style={{ marginRight: '8px' }} />
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            style={{ border: 'none', outline: 'none', flex: 1 }}
            required
          />
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            border: '1px solid gray',
            padding: '5px',
            borderRadius: '5px',
          }}
        >
          <FontAwesomeIcon icon={faKey} style={{ marginRight: '8px' }} />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            style={{ border: 'none', outline: 'none', flex: 1 }}
            required
          />
        </div>
        <button onClick={handleLogin}>Log in</button>
      </form>

      <div
        style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', margin: '1em' }}
      >
        <button
          onClick={handleGoogleLogin}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 15px' }}
        >
          <FontAwesomeIcon icon={faGoogle} size="lg" />
          Log in with Google
        </button>

        <button
          onClick={handleGithubLogin}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 15px' }}
        >
          <FontAwesomeIcon icon={faGithub} size="lg" />
          Log in with GitHub
        </button>
      </div>

      <p>
        Dont have an account? <Link to={'/register'}>Register</Link> or log in with Google/GitHub
        (Recommended)
      </p>
    </>
  );
}
