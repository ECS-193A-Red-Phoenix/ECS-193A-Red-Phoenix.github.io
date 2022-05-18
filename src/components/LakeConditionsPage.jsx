import CurrentLakePage from "./CurrentChart/CurrentLakePage";
import LakeWireFrame from "./LakeWireFrame/LakeWireFrame";
import "../css/LakeConditions.css";
import TemperaturePage from "./TemperatureChart/TemperaturePage";
import WaveHeightPage from "./WaveHeightChart/WaveHeightPage";
import LakeConditions from "./LakeConditions";

function LakeConditionsPage(props) {
  return (
    <div className="content-wrapper">
      <div className="image-container">
        <img src="static/img/lake-two.jpg"></img>
        <div className="page-description-container">
          <div className="page-description-title"> Modeled Conditions </div>
          <div className="page-description"> 
            Using weather forecasts and a complex 3D mathematical model, Lake Tahoe's surface temperature and water currents can be modeled. Here we are displaying the conditions over the past 7 days, and forecasts of the conditions for the next 3 days. Estimates are provided hourly, as conditions can change quickly.
            <br/> <br/>
            <span className="bold"> Hazardous conditions </span> arising from sudden drops of water temperature in parts of the lake can occur in spring, summer and fall and can persist for several days. They are caused by cold-water upwellings, that are driven by strong and persistent winds. These are often at their peak after the wind has subsided. The cold water upwellings are frequently accompanied by strong rip currents, and can occur even on a calm day. The 3D model provides estimates of the locations and the magnitudes of such events. Please exercise due caution and be respectful of the hazards posed by a large lake in a mountainous environment.
          </div>
          <div className="page-last-updated">
            {" "}
          </div>
        </div>
      </div>

    <LakeConditions/>
    </div>
  );
}

export default LakeConditionsPage;
