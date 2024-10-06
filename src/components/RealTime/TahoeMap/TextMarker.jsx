import { Marker } from "react-leaflet";
import { divIcon } from "leaflet";

import "./TahoeMap.css";

function TextMarker(props) {
    const text = divIcon({
        html: `<div class="map-label"> ${props.text} </div>`, 
        className: "map-label-container"
    });
  
    return(
        <Marker 
            position={props.position} 
            icon={text} 
            />
    );
}

export default TextMarker;