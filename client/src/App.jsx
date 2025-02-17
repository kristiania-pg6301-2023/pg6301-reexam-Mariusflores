import {BrowserRouter, Route, Routes} from "react-router-dom";
import {useEffect, useState} from "react";
import "./styling/App.css";
import {LoginPage} from "./pages/LoginPage.jsx";
import {ProfilePage} from "./pages/ProfilePage.jsx";
import {HomePage} from "./pages/HomePage.jsx";
import {NavBar} from "./components/NavBar.jsx";


function App() {
    const [user, setUser] = useState(null);

    // Fetch user session when the app loads
    useEffect(() => {
        fetch("http://localhost:8000/auth/me", {
            credentials: "include", // Important for sending cookies
        })
            .then((response) => {
                console.log("auth/me response:", response);
                if (response.ok) return response.json();
                throw new Error("Not authenticated");
            })
            .then((data) => {
                console.log("User data:", data);
                setUser(data);
            })
            .catch((error) => {
                console.error("Error fetching user:", error);
                setUser(null);
            });
    }, []);


    return (
        <>
            <BrowserRouter>
                <NavBar user={user}/>
                <Routes>
                    <Route path="/" element={user? <HomePage/> : <LoginPage/>}/>
                    <Route path="/login" element={<LoginPage/>}/>
                    <Route path="/profile" element={user ? <ProfilePage/> : <h1>Please log in</h1>}/>
                </Routes>
            </BrowserRouter>
        </>
    );
}

export default App;
