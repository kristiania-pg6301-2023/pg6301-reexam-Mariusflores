import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function LoginPage() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:8000/auth/me', { credentials: 'include' })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data) => {
        setUser(data);
        navigate('/profile'); // Redirect to profile if logged in
      })
      .catch(() => setUser(null));
  }, [navigate]);

  const handleLogin = async () => {
    window.location.href = 'http://localhost:8000/auth/google';
  };

  return (
    <div>
      <h2>Login</h2>
      <button onClick={handleLogin}>Log in with Google</button>
    </div>
  );
}
