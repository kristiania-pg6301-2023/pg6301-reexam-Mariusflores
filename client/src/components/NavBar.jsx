import { Link } from 'react-router-dom';
import '../styling/NavBar.css';
import '../styling/icon.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faPen, faRightToBracket, faUser } from '@fortawesome/free-solid-svg-icons';


export function NavBar({ user, onLogout }) {
  return (
    <header id="navbar">
      <div className="link-container">
        <Link className={'link'} to="/home">Home</Link>
        <span className="icon">
                <FontAwesomeIcon icon={faHouse} size={'0.5'} />
        </span>
      </div>

      {user ? (
        <>
          <div className="link-container">
            <Link className={'link'} to={'/publish'}>Post</Link>
            <span className="icon">
                <FontAwesomeIcon icon={faPen} size={'0.5'} />
          </span>
          </div>
          <div className="link-container">
            <Link className={'link'} to="/profile">Profile</Link>
            <span className="icon">
                <FontAwesomeIcon icon={faUser} size={'0.5'} />
          </span>
          </div>
          <div className="link">
            <button onClick={onLogout}>Logout</button>
          </div>
        </>
      ) : (
        <div className="link-container">
          <Link className={'link'} to="/login">Login</Link>
          <span className="icon">
                <FontAwesomeIcon icon={faRightToBracket} size={'0.5'} />
          </span>
        </div>
      )}
    </header>
  );
}
