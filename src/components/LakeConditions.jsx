import CurrentLakePage from "./CurrentChart/CurrentLakePage";
import LakeWireFrame from "./LakeWireFrame/LakeWireFrame";
import "../css/LakeConditions.css";
import TemperaturePage from "./TemperatureChart/TemperaturePage";
import WaveHeightPage from "./WaveHeightChart/WaveHeightPage";

function LakeConditions(props) {
  return (
    <div className="model-figure-container">
        <TemperaturePage />
        <CurrentLakePage />
        <WaveHeightPage />
        {/* <LakeWireFrame /> */}
    </div>
    );
}

export default LakeConditions;
