import { useState, useEffect } from 'react'
import {BrowserRouter, Link, Route, Routes} from "react-router-dom";
import axios from "axios"
import './App.css'

function NavBar() {
    return <header id={"navbar"}>
        <div className={"link"}>
            <Link to={"/"}>Home page</Link>
        </div>
        <div className={"link"}>
            <Link to={"/hello"}> Test </Link>
        </div>

    </header>;
}

function App(){

  return (
    <>
       <BrowserRouter>
             <NavBar/>
             <Routes>
                 <Route path={"/"} element={<h1> Home page</h1>}/>
                 <Route path={"/hello"} element={<h1> Hello</h1>}/>
             </Routes>

         </BrowserRouter>;
    </>
  )
}

export default App
