import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../css/Navbar.css";

export default function Navbar() {
  let location = useLocation();

  let is_active = (path) => {
    return location.pathname === path ? "active" : "";
  }

  return (
    <div>
      <nav className="nav--bar">
        <ul className="nav--options">
          <Link to="/">
            <li className={is_active("/")}>
              <span> Home </span>
            </li>
          </Link>

          <Link to="/real-time">
            <li className={is_active("/real-time")}>
              <span> Real-time </span>
            </li>
          </Link>
          
          <Link to="/contact">
            <li className={is_active("/contact")}>
              <span> About Us </span>
            </li>
          </Link>

        </ul>
      </nav>
    </div>
  );
}
