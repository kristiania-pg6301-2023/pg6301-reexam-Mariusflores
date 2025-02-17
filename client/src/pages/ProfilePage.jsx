import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function ProfilePage() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetch("http://localhost:8000/auth/me", { credentials: "include" })
            .then(response => response.ok ? response.json() : Promise.reject())
            .then(setUser)
            .catch(() => navigate("/login")); // Redirect to login if not authenticated
    }, [navigate]);

    const handleLogout = async () => {
        await fetch("http://localhost:8000/logout", { method: "POST", credentials: "include" });
        navigate("/login"); // Redirect to login after logout
    };

    if (!user) return <p>Loading...</p>;

    return (
        <div>
            <h2>Welcome, {user.username}!</h2>
            <button onClick={handleLogout}>Log Out</button>
        </div>
    );
}
