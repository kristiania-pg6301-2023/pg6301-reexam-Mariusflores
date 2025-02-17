import {Link} from "react-router-dom";

export function NavBar({user}) {
    return (
        <header id="navbar">
            <div className="link">
                <Link to="/">Home</Link>
            </div>
            {user && (
                <div className="link">
                    <Link to="/profile">Profile</Link>
                </div>
            )}
            {!user && (
                <div className="link">
                    <Link to="/login">Login</Link>
                </div>
            )}
        </header>
    );
}