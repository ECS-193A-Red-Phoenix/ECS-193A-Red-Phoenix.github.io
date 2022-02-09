import React from "react";
import { Link } from "react-router-dom";
import "./styles/Navbar.css";

export default function Navbar() {
  return (
    <div>
      <nav className="nav--bar">
        <ul className="nav--options">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/ContactUs">Contact Us</Link>
          </li>
          <li>
            <Link to="/AboutUs">About Us</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
