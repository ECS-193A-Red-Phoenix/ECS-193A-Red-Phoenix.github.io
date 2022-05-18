import React from "react";
import "../css/Footer.css";
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
            <Link to="/real-time">Real-time</Link>
          </li>
          <li>
            <p>|</p>
          </li>
          <li>
            <Link to="/contact">About Us</Link>
          </li>
        </ul>
      </nav>
      <p className='footer-disclaimer'>  
        <span> Disclaimer: </span> Every effort is made to ensure that the data provided within this website is accurate and timely, 
        however, this should not be considered official and should be confirmed with other reliable sources. This 
        information is provided without warranty for quality or accuracy. For additional information about water 
        safety, visit <a href="https://laketahoewatertrail.org/safety/"> https://laketahoewatertrail.org/safety/ </a>.
      </p>
      <p className="copyright">
        &copy; {new Date().getFullYear()} Lake Tahoe Project
      </p>
    </div>
  );
}
