import {BrowserRouter, Link, Route, Routes} from "react-router-dom";
import './App.css';
import {LoginPage} from "./pages/loginPage.jsx";

function NavBar() {
    return <header id={"navbar"}>
        <div className={"link"}>
            <Link to={"/"}>Home page</Link>
        </div>
        <div className={"link"}>
            <Link to={"/login"}> Login </Link>
        </div>

    </header>;
}

function App() {

    return (
        <>
            <BrowserRouter>
                <NavBar/>
                <Routes>
                    <Route path={"/"} element={<h1> Home page</h1>}/>
                    <Route path={"/login"} element={<LoginPage/>}/>
                </Routes>

            </BrowserRouter>
        </>
    )
}

export default App
