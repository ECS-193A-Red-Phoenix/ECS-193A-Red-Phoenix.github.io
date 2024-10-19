import "./TahoeMap.css";

import IconMarker from "./IconMarker";

function LoadingIcon(props) {
    ///////////////////////////////////////////
    // Expected props
    // error_msg (optional): message to display on popup
    // active (optional, default=false): if icon should be outlined
    const active = (props.active) ? "loading-icon-active" : "";
    const loading_html = `<span class="material-symbols-outlined loading-icon ${active}">cached</span>`;

    return <IconMarker
                position={props.position}
                icon={loading_html}
                onClick={props.onClick}
                >
                <div className="photo-marker-popup">
                    Loading        
                </div>
            </IconMarker>;
}

export default LoadingIcon;