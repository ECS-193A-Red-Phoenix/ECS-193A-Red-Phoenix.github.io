import IconMarker from "./IconMarker";

import "./TahoeMap.css";

function ColorMarker(props) {
    let icon;
    if (props.color)
        icon = `<div class="color-marker" style="background-color: ${props.color}"> ${props.text} </div>`
    else
        icon = `<div class="color-marker"> ${props.text} </div>`

    return(
        <IconMarker
            position={props.position} 
            onClick={props.onClick}
            icon={icon} 
            >
        </IconMarker>
    );
}

export default ColorMarker;