import './App.css';
import React from "react";


import {
    BrowserRouter as Router,
    Switch,
    Route
} from "react-router-dom";

import MainPage from './Components/MainPage'
import Navigation from "./Components/Navigation";

function App() {
    return (
        <div className="App">
            <Navigation/>
            <div className={"app-container"}>

                <Router>
                    <Switch>
                        <Route exact path="/">
                            <MainPage text="Telegram Map"/>
                        </Route>
                    </Switch>
                </Router>
            </div>
        </div>
    );
}

export default App;
