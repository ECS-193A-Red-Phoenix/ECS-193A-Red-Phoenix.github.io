import React from "react";
import "../css/AboutUsStyle.css";

export default function ContactUs() {
  return (
    <div className="content-wrapper">
      <div className="image-container">
        <img
          className="aboutUsPic"
          src="static/img/lake-three.jpeg"
          alt="Lake Tahoe"
        ></img>
        <div className="page-description-container">
          <div className="page-description-title"> About Us </div>
          <div className="page-description"> Learn about our mission </div>
        </div>
      </div>

      <div className="about-us-container">
          <div>
            <h2> About Tahoe Now </h2>

            This website was a senior design project developed by four UC Davis students
            in 2022. The project was a culmination of efforts between the developers, 
            TERC members, and UC Davis College of Engineering staff.
            
            <br/><br/>

            For more information about TERC, please visit <a href="https://tahoe.ucdavis.edu/about">https://tahoe.ucdavis.edu/about</a>
          </div>

          <div>
            <h2> Acknowledgements </h2>

            Thank you to ___ for funding this project.

          </div>
      </div>
    </div>
  );
}
