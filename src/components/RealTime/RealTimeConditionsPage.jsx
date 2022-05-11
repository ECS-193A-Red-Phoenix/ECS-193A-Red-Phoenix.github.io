import React from "react";
import "./RealTimeConditions.css";
import RealTimeConditions from "./RealTimeConditions";

function RealTimeConditionsPage(props) {
  return (
    <div className="content-wrapper">
      <div className="image-container">
        <img src="static/img/lake-one.jpg" alt="Lake Tahoe"></img>
        <div className="page-description-container">
          <div className="page-description-title"> Real Time Conditions </div>
          <div className="page-description">
            {" "}
            Explore Lake Tahoe conditions in real time, routinely updated in
            twenty minute intervals. {" "}
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
