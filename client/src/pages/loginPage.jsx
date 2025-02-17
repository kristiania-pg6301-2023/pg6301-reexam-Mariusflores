import {useEffect, useState} from "react";

export function LoginPage() {
    const [user, setUser] = useState(null);

    // Check if the user is authenticated
    useEffect(() => {
        fetch("http://localhost:8000/auth/me", {
            credentials: "include", // Important for sending cookies to the server
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error("Not authenticated");
            })
            .then(data => setUser(data))
            .catch(() => setUser(null));
    }, []);

    const handleLogout = async () => {
        await fetch("http://localhost:8000/logout", {
            method: "POST",
            credentials: "include",
        });
        setUser(null);
    };

    return (
        <div style={{textAlign: "center", marginTop: "50px"}}>
            {user ? (
                <div>
                    <h2>Velkommen, {user.username}!</h2>
                    {user.photo && <img src={user.photo} alt="Profile" style={{borderRadius: "50%", width: "100px"}}/>}
                    <p>Email: {user.email}</p>
                    <button onClick={handleLogout}>Logg ut</button>
                </div>
            ) : (
                <div>
                    <h2>Du er ikke logget inn.</h2>
                    <a href="http://localhost:8000/auth/google">
                        <button>Logg inn med Google</button>
                    </a>
                </div>
            )}
        </div>
    );
}
