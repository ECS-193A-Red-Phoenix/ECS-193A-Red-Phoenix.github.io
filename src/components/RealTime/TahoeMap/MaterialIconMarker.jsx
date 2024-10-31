import "./TahoeMap.css";

import IconMarker from "./IconMarker";

function MaterialIconMarker(props) {
    ///////////////////////////////////////////
    // Expected props
    // material_icon_name: name of material icon
    // error_msg (optional): message to display on popup
    // active (optional, default=false): if icon should be outlined
    // text: (optional, default=""): popup text
    const text = props.text ?? "";
    const active = (props.active) ? `material-icon-marker-active` : "";
    const color = props.color !== undefined ? `style="background-color: ${props.color}"` : ""
    const loading_html = `<span class="material-symbols-outlined material-icon-marker ${props.material_icon_name}-icon ${active}" ${color}>${props.material_icon_name}</span>`;
    
    return <IconMarker
                position={props.position}
                icon={loading_html}
                onClick={props.onClick}
                >
                <div className="photo-marker-popup">
                    {text}
                </div>
            </IconMarker>;
}

export default MaterialIconMarker;