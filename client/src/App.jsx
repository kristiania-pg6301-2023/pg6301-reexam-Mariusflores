import { Route, Routes, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './styling/App.css';
import { LoginPage } from './pages/LoginPage.jsx';
import { NavBar } from './components/NavBar.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { ProfilePage } from './pages/ProfilePage.jsx';
import { PublishPage } from './pages/PublishPage.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { ToastContainer } from 'react-toastify';
import { api_url } from './utils/getApiUrl.js';

// Component to handle navigation redirects properly
export const RedirectToLogin = ({ navigate }) => {
  useEffect(() => {
    console.log('redirecting to /login');
    navigate('/login', { replace: true });
  }, [navigate]);
  return null; // Don't render anything, just navigate
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${api_url}/auth/me`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await fetch(`${api_url}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    setUser(null);
    navigate('/login');
  };

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <ToastContainer position={'top-center'} />
      <NavBar user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<HomePage user={user} />} />
        <Route path="/login" element={<LoginPage setUser={setUser} />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/profile"
          element={
            user ? (
              <ProfilePage user={user} setUser={setUser} />
            ) : (
              <RedirectToLogin navigate={navigate} />
            )
          }
        />
        <Route
          path="/publish"
          element={user ? <PublishPage /> : <RedirectToLogin navigate={navigate} />}
        />

        {/* Redirects to login if unknown route */}
        <Route path="*" element={<HomePage user={user} />} />
      </Routes>
      <footer className="footer">
        <p className="icon-attribute">
          Icons created by{' '}
          <a
            href="https://www.flaticon.com/authors/freepik"
            target="_blank"
            rel="noopener noreferrer"
          >
            Freepik
          </a>{' '}
          -{' '}
          <a href="https://www.flaticon.com/" target="_blank" rel="noopener noreferrer">
            Flaticon
          </a>
        </p>
      </footer>
    </>
  );
}

export default App;
