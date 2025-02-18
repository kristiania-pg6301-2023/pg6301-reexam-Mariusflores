import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './styling/App.css';
import { LoginPage } from './pages/LoginPage.jsx';
import { NavBar } from './components/NavBar.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { ProfilePage } from './pages/ProfilePage.jsx';
import { useEffect, useState } from 'react';
import { PublishPage } from './pages/PublishPage.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { ToastContainer } from 'react-toastify';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ New loading state

  useEffect(() => {
    fetch('http://localhost:8000/auth/me', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false)); // ✅ Stop loading after fetch completes
  }, []);

  const handleLogout = async () => {
    await fetch('http://localhost:8000/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    setUser(null);
    window.location.reload();
  };

  if (loading) return <p>Loading...</p>; // ✅ Prevents flashing login screen

  return (
    <BrowserRouter>
      <ToastContainer position={'top-center'} autoClose={3000} />
      <NavBar user={user} onLogout={handleLogout} />
      <Routes>
        <Route
          path="/"
          element={user ? <HomePage user={user} /> : <LoginPage setUser={setUser} />}
        />
        <Route path="/login" element={<LoginPage setUser={setUser} />} />
        <Route
          path="/home"
          element={user ? <HomePage user={user} /> : <LoginPage setUser={setUser} />}
        />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/profile"
          element={user ? <ProfilePage user={user} /> : <LoginPage setUser={setUser} />}
        />
        <Route path="/publish" element={user ? <PublishPage /> : <LoginPage setUser={setUser} />} />
        <Route
          path="*"
          element={user ? <HomePage user={user} /> : <LoginPage setUser={setUser} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
