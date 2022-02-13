import { SVGOverlay } from "react-leaflet";

function StationMarker(props) {
  const width = 0.02;
  const height = 0.01;
  const [lat, lon] = props.position;
  const bounds = [
    [lat - height, lon - width],
    [lat + height, lon + width]
  ]

  return (
    <SVGOverlay bounds={bounds} onClick={props.onClick}>
      <rect x="0" y="0" width="100%" height="100%" fill="#022851"/>
      <text x="50%" y="50%" stroke="white" textAnchor="middle" dominantBaseline="middle">
          { Math.round(props.data * 100) / 100 }
      </text>
    </SVGOverlay>
  );
}

export default StationMarker;