import "./TahoeMap.css";

import IconMarker from "./IconMarker";

function ErrorMarker(props) {
    ///////////////////////////////////////////
    // Expected props
    // error_msg (optional): message to display on popup
    // active (optional, default=false): if icon should be outlined
    const active = (props.active) ? "error-icon-active" : "";
    const error_html = `<span class="error-icon material-symbols-outlined ${active}">error</span>`;

    return <IconMarker
                position={props.position}
                icon={error_html}
                onClick={props.onClick}
                >
                    {   
                        props.error_msg &&
                        <div className="photo-marker-popup">
                            {props.error_msg}        
                        </div>
                    }
            </IconMarker>;
}

export default ErrorMarker;