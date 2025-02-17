import { useEffect, useState } from "react";

export function LoginPage() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        fetch("http://localhost:8000/auth/me", {
            credentials: "include" // Viktig for å sende cookies til serveren
        })
            .then(response => {
                if (response.ok) {
                    console.log(response)
                    return response.json();
                }
                throw new Error("Not authenticated");
            })
            .then(data => setUser(data))
            .catch(() => setUser(null));
    }, []);

    const handleLogin = async () => {
        try{
            const response = await fetch("http://localhost:8000/login", {
                method: "POST",
                credentials: "include"
            });
            const data = await response.json();
            console.log("Login response:", data);

            if (response.ok){
                window.location.reload();
            }else{
                console.error("Login failed");
            }
        }catch (error){
            console.error("Error during login:", error)
        }
    }

    const handleLogout = async () => {
        await fetch("http://localhost:8000/logout", {
            method: "POST",
            credentials: "include"
        });
        setUser(null);
    };

    return (
        <div>
            {user ? (
                <div>
                    <h2>Velkommen, {user.username}!</h2>
                    <button onClick={handleLogout}>Logg ut</button>
                </div>
            ) : (
                <div>
                    <h2>Du er ikke logget inn.</h2>
                    <button onClick={handleLogin}>Logg inn</button>
                </div>
            )}
        </div>
    );
}


