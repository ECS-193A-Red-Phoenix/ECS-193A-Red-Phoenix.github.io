import IconMarker from "./IconMarker";

import "./TahoeMap.css";

function ColorMarker(props) {
    // props
    // active (optional, default=false): if icon should be outlined
    // className (optional, default=""): extra class to add to marker
    const active = (props.active) ? "color-icon-active" : "";
    const className = props.className ?? "";

    let icon;
    if (props.color)
        icon = `<div class="color-marker ${active} ${className}" style="background-color: ${props.color}"> ${props.text} </div>`
    else
        icon = `<div class="color-marker ${active} ${className}"> ${props.text} </div>`

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