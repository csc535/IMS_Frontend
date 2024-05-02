import * as React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Login } from 'pages/Login.jsx';
import { LandingPage } from 'pages/LandingPage';
import 'styles/App.css';

export const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
            </Routes>
        </Router>
    );
}