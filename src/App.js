import React from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import MainPage from './mainpage';
import NewPage from './App2';
import './App.css'; // Import your CSS file

function App() {
  return (
    <div>
      <nav className="nav">
        <ul className="nav-list">
          <li>
            <NavLink 
              end
              to="/" 
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              Hashcase Module
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/loyalty-points" 
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              Loyalty Points
            </NavLink>
          </li>
        </ul>
      </nav>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/loyalty-points" element={<NewPage />} />
      </Routes>
    </div>
  );
}

export default App;
