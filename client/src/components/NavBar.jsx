import { useNavigate } from 'react-router-dom';
import '../styling/NavBar.css';
import '../styling/Icon.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faPen, faRightToBracket, faUser } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';

export function NavBar({ user, onLogout }) {
  const navigate = useNavigate();

  const isUserValid = user && typeof user === 'object' && user.id;

  const handleKeyDown = (event, path) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault(); // Prevent default space scrolling
      navigate(path);
    }
  };

  return (
    <header id="navbar" role={'navigation'}>
      <div className="logo-container">
        <img src="../../assets/navbarlogo.png" alt="logo" className="logo" />
      </div>
      <div
        className="link-container"
        aria-label="navigate-home"
        onClick={() => navigate('/home')}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => handleKeyDown(e, '/home')}
      >
        <span className="icon">
          <FontAwesomeIcon icon={faHouse} size="0.5" />
        </span>
        <span className="link">Home</span>
      </div>

      {isUserValid ? (
        <>
          <div
            className="link-container"
            onClick={() => navigate('/publish')}
            role="button"
            aria-label="navigate-publish"
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown(e, '/publish')}
          >
            <span className="icon">
              <FontAwesomeIcon icon={faPen} size="0.5" />
            </span>
            <span className="link">Post</span>
          </div>
          <div
            className="link-container"
            onClick={() => navigate('/profile')}
            role="button"
            aria-label="navigate-profile"
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown(e, '/profile')}
          >
            <span className="icon">
              <FontAwesomeIcon icon={faUser} size="0.5" />
            </span>
            <span className="link">Profile</span>
          </div>
          <div className="link">
            <button aria-label="logout" onClick={() => onLogout?.()}>
              Logout
            </button>
          </div>
        </>
      ) : (
        <div
          className="link-container"
          onClick={() => navigate('/login')}
          role="button"
          aria-label="navigate-login"
          tabIndex={0}
          onKeyDown={(e) => handleKeyDown(e, '/login')}
        >
          <span className="icon">
            <FontAwesomeIcon icon={faRightToBracket} size="0.5" />
          </span>
          <span className="link">Login</span>
        </div>
      )}
    </header>
  );
}

// PropTypes validation
NavBar.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string,
    username: PropTypes.string,
  }),
  onLogout: PropTypes.func.isRequired,
};

export default NavBar;
