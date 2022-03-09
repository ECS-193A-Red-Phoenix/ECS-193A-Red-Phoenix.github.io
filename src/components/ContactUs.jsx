import React from "react";
import "./styles/AboutUsStyle.css";

export default function ContactUs() {
  return (
    <div className="content-wrapper">
      <div className="image-container">
        <img
          className="aboutUsPic"
          src="lake-three.jpeg"
          alt="Lake Tahoe"
        ></img>
        <div className="page-description-container">
          <div className="page-description-title"> About Us </div>
          <div className="page-description"> Learn about our mission </div>
        </div>
      </div>

      <div className="content">
        <div className="left">
          <h2 className="missionTitle">Vision</h2>
          <p className="missionP">
            To ensure safety and preservation of the millions of lives that
            visit Lake Tahoe annually.
          </p>
          <p className="missionP">
            To provide accessible real time information and resources to local
            businesses to safeguard patrons.
          </p>
          <p className="missionP">
            To accommodate local authorities and emergency response personnel
            the necessary resources in order to provide strategic guidance in
            enforcing safety measures.
          </p>
          <p className="missionP">
            To provide information to researchers to expedite data acquisition
            for acceleration in research.
          </p>
          <h2 className="missionTitle">Mission</h2>
          <p className="missionP">
            We collaborated with the UC Davis Tahoe Environmental Research
            Center to provide gratuitous access to web and mobile applications.
          </p>
          <p className="missionP">
            To dispense unfettered access to historical, real-time, and future
            meteorological data collected from NASA buoys.
          </p>
          <p className="missionP">
            Utilized predictive hydrodynamic models to simulate future
            conditions of Lake Tahoe to shield the masses from hazardous natural
            occurrences.
          </p>
          <h2 className="missionTitle">Guiding Principles</h2>
          <p className="missionP">
            We are a diverse team that values equity and inclusivity and
            collaborates to achieve our goals.
          </p>
          <p className="missionP">
            We operate from a place of respect and shared understanding where
            individuals are treated with dignity, compassion, and understanding.
          </p>
          <p className="missionP">
            We approach our work in a way that is both innovative and
            retrospective to generate creative ideas and solutions.
          </p>
          <p className="missionP">
            Our ongoing commitment to excellence and knowledge enables
            meaningful engagement on local to global scales.
          </p>
          <p className="missionP">
            We aspire to make a positive difference in the world.
          </p>
          <p className="missionP">
            Our research, education, and outreach promote access to sustainable
            environmental stewardship.
          </p>
          <h2 className="missionTitle">Contact Us</h2>
          <ul>
            <a href="https://tahoe.ucdavis.edu/directions-tces/">
              Tahoe Center for Environmental Sciences
            </a>
            <li>291 Country Club Dr. | Incline Village, NV 89451</li>
            <li>775-881-7560</li>
          </ul>
        </div>

        <div className="right">
          <center>
            <h2 className="team-members">Team Members</h2>
            <div className="Team">
              <ul className="pictures-names">
                <li className="pictures">
                  <img className="GP1" src="placeholder.png"></img>
                </li>
                <li className="names">TM #1</li>
                <li className="pictures">
                  <img className="GP1" src="placeholder.png"></img>
                </li>
                <li className="names">TM #2</li>
                <li className="pictures">
                  <img className="GP1" src="placeholder.png"></img>
                </li>
                <li className="names">TM #3</li>
                <li className="pictures">
                  <img className="GP1" src="placeholder.png"></img>
                </li>
                <li className="names">TM #4</li>
              </ul>
            </div>
          </center>
        </div>
      </div>
    </div>
  );
}
