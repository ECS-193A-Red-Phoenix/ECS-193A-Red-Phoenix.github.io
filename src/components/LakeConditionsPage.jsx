import CurrentLakePage from "./CurrentChart/CurrentLakePage";
import LakeWireFrame from "./LakeWireFrame/LakeWireFrame";
import "../css/LakeConditions.css";
import TemperaturePage from "./TemperatureChart/TemperaturePage";
import WaveHeightPage from "./WaveHeightChart/WaveHeightPage";

function LakeConditionsPage(props) {
  return (
    <div className="content-wrapper">
      <div className="image-container">
        <img src="static/img/lake-two.jpg"></img>
        <div className="page-description-container">
          <div className="page-description-title"> Lake Conditions </div>
          <div className="page-description"> 
            Using public weather forecasts and a complex 3D mathematical model,
            we are able to simulate Lake Tahoe up to 3 days into the future. The results
            of this model give us Lake Tahoe's surface temperature and water currents, displayed
            below.
          </div>
          <div className="page-last-updated">
            {" "}
          </div>
        </div>
      </div>

      <div className="model-figure-container">
        <TemperaturePage />
        <CurrentLakePage />
        <WaveHeightPage />
        <LakeWireFrame />
      </div>
    </div>
  );
}

export default LakeConditionsPage;