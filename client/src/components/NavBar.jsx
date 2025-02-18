import { Link } from 'react-router-dom';
import '../styling/NavBar.css';

export function NavBar({ user, onLogout }) {
  return (
    <header id="navbar">
      <div className="link">
        <Link to="/">Home</Link>
      </div>

      {user ? (
        <>
          <div className="link">
            <Link to="/profile">Profile</Link>
          </div>
          <div className="link">
            <button onClick={onLogout}>Logout</button>
          </div>
        </>
      ) : (
        <div className="link">
          <Link to="/login">Login</Link>
        </div>
      )}
    </header>
  );
}
