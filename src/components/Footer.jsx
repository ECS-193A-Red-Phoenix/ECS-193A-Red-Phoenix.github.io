import React from "react";
import "./styles/Footer.css";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <div className="footer">
      <p>1 Shields Ave, Davis, CA 95616</p>
      <nav className="footer-nav-bar">
        <ul className="footer-nav-options">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <p>|</p>
          </li>
          <li>
            <Link to="/ContactUs">Contact Us</Link>
          </li>
          <li>
            <p>|</p>
          </li>
          <li>
            <Link to="/AboutUs">About Us</Link>
          </li>
        </ul>
      </nav>
      <p className="copyright">
        &copy; {new Date().getFullYear()} Lake Tahoe Project
      </p>
    </div>
  );
}
