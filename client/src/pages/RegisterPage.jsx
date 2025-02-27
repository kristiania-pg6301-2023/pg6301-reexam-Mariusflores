import { useState } from 'react';
import { toast } from 'react-toastify';
import '../styling/RegisterPage.css';
import { api_url } from '../utils/getApiUrl.js';
import { useNavigate } from 'react-router-dom'; // Import the new CSS file

export function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Username and password must be filled out');
      return;
    }
    try {
      const response = await fetch(`${api_url}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, email }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log('registration successful');
        toast.success('Registration successful, you can now log in');
        navigate('/login');
      } else {
        toast.error(data.message || 'Registration failed, please try again');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
      console.error('Error deleting post:', error);
    }
  }

  return (
    <div className="register-container">
      <h3>Register New User</h3>

      <form className="register-form" aria-label="register form" onSubmit={handleRegister}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            aria-label="username-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            aria-label="password-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Email (Optional):</label>
          <input
            type="email"
            aria-label="email-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <button className="register-button" type="submit">
          Register
        </button>
      </form>
    </div>
  );
}
