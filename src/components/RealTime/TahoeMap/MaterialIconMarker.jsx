import "./TahoeMap.css";

import IconMarker from "./IconMarker";

function MaterialIconMarker(props) {
    ///////////////////////////////////////////
    // Expected props
    // material_icon_name: name of material icon
    // error_msg (optional): message to display on popup
    // active (optional, default=false): if icon should be outlined
    // style (optional, default={}): css dictionary of style to apply to element
    // text: (optional, default=""): popup text
    const text = props.text ?? "";
    const active = (props.active) ? `material-icon-marker-active` : "";
    const style = props.style !== undefined ? {...props.style} : {};
    if (props.color !== undefined) {
        style['background-color'] = props.color;
    }
    let style_string = Object.entries(style).map(([key, value]) => { return `${key}: ${value}`; }).join("; ")
    style_string = `style="${style_string}"`
    const loading_html = `<span class="material-symbols-outlined material-icon-marker ${props.material_icon_name}-icon ${active}" ${style_string}>${props.material_icon_name}</span>`;
    
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