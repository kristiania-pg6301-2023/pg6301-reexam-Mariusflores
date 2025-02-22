import { useNavigate } from 'react-router-dom';
import '../styling/NavBar.css';
import '../styling/Icon.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faPen, faRightToBracket, faUser } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';

export function NavBar({ user, onLogout }) {
  const navigate = useNavigate();

  return (
    <header id="navbar" role={'navigation'}>
      <div className="link-container" onClick={() => navigate('/home')} role="button" tabIndex={0}>
        <span className="icon">
          <FontAwesomeIcon icon={faHouse} size="0.5" />
        </span>
        <span className="link">Home</span>
      </div>

      {user ? (
        <>
          <div
            className="link-container"
            onClick={() => navigate('/publish')}
            role="button"
            tabIndex={0}
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
            tabIndex={0}
          >
            <span className="icon">
              <FontAwesomeIcon icon={faUser} size="0.5" />
            </span>
            <span className="link">Profile</span>
          </div>
          <div className="link">
            <button onClick={onLogout}>Logout</button>
          </div>
        </>
      ) : (
        <div
          className="link-container"
          onClick={() => navigate('/login')}
          role="button"
          tabIndex={0}
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
