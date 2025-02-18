import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './styling/App.css';
import { LoginPage } from './pages/LoginPage.jsx';
import { NavBar } from './components/NavBar.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { ProfilePage } from './pages/ProfilePage.jsx';
import { useEffect, useState } from 'react';
import { PublishPage } from './pages/PublishPage.jsx';
import { HomePage } from './pages/HomePage.jsx';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8000/auth/me', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then(setUser) // ✅ Correctly updates user state
      .catch(() => setUser(null));
  }, []); // ✅ Ensures useEffect runs only once

  const handleLogout = async () => {
    await fetch('http://localhost:8000/auth/logout', {
      // ✅ Fixed URL
      method: 'POST',
      credentials: 'include',
    });
    setUser(null); // ✅ Updates state after logout
  };

  return (
    <BrowserRouter>
      <NavBar user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/home" element={<HomePage/>} />
        <Route path="/login" element={<LoginPage setUser={setUser} />} />{' '}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<ProfilePage user={user} />} />
        <Route path="/publish" element={<PublishPage/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
