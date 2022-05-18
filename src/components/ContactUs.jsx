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
            <h2> Project Acknowledgement </h2>
            This website was a senior design project developed by four UC Davis Computer Science students in 2022. The project was a culmination of efforts between the developers, TERC staff, and the UC Davis College of Engineering IT staff. 
          </div>

          <div>
            <h2> Data Acknowledgement </h2>
            Data Acknowledgement: The TERC Nearshore Network was initially developed by former TERC graduate student Dr. Derek Roberts. Ph.D. candidate Sergio Valbuena currently manages and controls the Nearshore Network instruments and the shore-based meteorological stations that provide the data for the real-time conditions section. Data from the midlake buoys (TB1, TB2, TB3 and TB4) are provided courtesy of Simon Hook of the NASA Jet Propulsion Laboratory.
          </div>
          
          <div>
            <h2> Funding Acknowledgement </h2>
            Special thanks to TERC donors who have supported the establishment and maintenance of the Nearshore Network and the meteorological stations. Without them there would be no data. Thank you to the  Lahontan Regional Water Quality Control Board who have supported two of the Nearshore Network stations. Funding for the development of this webpage came from the Tahoe Fund. 
          </div>
      </div>
    </div>
  );
}
