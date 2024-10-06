import React from "react";
import "./RealTimeConditions.css";
import RealTimeConditions from "./RealTimeConditions";

function RealTimeConditionsPage(props) {
  return (
    <div className="content-wrapper">
      <div className="image-container">
        <img src="/static/img/lake-one.jpg" alt="Lake Tahoe"></img>
        <div className="page-description-container">
          <div className="page-description-title"> Real-time Conditions </div>
          <div className="page-description">
            Explore Lake Tahoe real-time conditions from the UC Davis TERC lake data stations. Data are updated every hour.
          </div>
          <div className="page-last-updated">
            {" "}
          </div>
        </div>
      </div>

      <RealTimeConditions/>
    </div>
  );
}

export default RealTimeConditionsPage;
