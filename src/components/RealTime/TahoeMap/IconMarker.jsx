import { Marker, Popup } from "react-leaflet";
import { divIcon } from "leaflet";

import "./TahoeMap.css";

/*
There is an issue where the Popup can't be seen because
autoPan is off so that the map doesn't move, but now the Popup is
out of bounds. To fix this, I just hard coded to translate the PopUp by -100% if
it is above some line of latitude. Same thing with longitude.
*/
const OFFSET_LATITUDE = 39.10507366863115;
const OFFSET_LONGITUDE = -120.22758529967396;

function IconMarker(props) {
    ///////////////////////////////////
    // Expected props
    // position: lat/lon object, ex: {lat: -32, lon: 32}    
    // onClick (optional): callback function for when marker is clicked
    // active (optional, default=false): if the marker is active or not
    // icon (optional): the html to display for the marker. If not specified
    //      a small circle is used on the map instead 
    // class_name (optional): the name of the class to style the popup, default is 'marker-popup'
    let { position, onClick, active, class_name } = props;
    onClick = onClick ?? (() => {});
    class_name = class_name ?? "marker-popup"

    let className = "my-circle-marker";
    if (active)
        className += " my-circle-marker-active";
    let icon = props.icon ?? `<div class="${className}"></div>`;

    const div = divIcon({
        html: icon,
        className: ""
    });
    
    let popup_class = class_name;
    if (position.lat > OFFSET_LATITUDE && position.lon < OFFSET_LONGITUDE)
        popup_class += " marker-popup-offset-down-right";
    else if (position.lat > OFFSET_LATITUDE)
        popup_class += " marker-popup-offset-down";
    else if (props.position.lon < OFFSET_LONGITUDE)
        popup_class += " marker-popup-offset-right";

    return(
        <Marker 
            eventHandlers={{
                click: () => onClick()
            }}
            zIndexOffset={active ? 1000 : 100}
            position={props.position} 
            icon={div} 
            >

            {
                props.children &&
                <Popup 
                    autoPan={false}
                    className={popup_class}
                    >
                    { props.children }
                </Popup>
            }

        </Marker>
    );
}

export default IconMarker;