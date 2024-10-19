import IconMarker from "./IconMarker";

import "./TahoeMap.css";

function ColorMarker(props) {
    // props
    // active (optional, default=false): if icon should be outlined
    const active = (props.active) ? "color-icon-active" : "";

    let icon;
    if (props.color)
        icon = `<div class="color-marker ${active}" style="background-color: ${props.color}"> ${props.text} </div>`
    else
        icon = `<div class="color-marker ${active}"> ${props.text} </div>`

    return(
        <IconMarker
            position={props.position} 
            onClick={props.onClick}
            icon={icon} 
            active={props.active}
            >
        </IconMarker>
    );
}

export default ColorMarker;