import { useState } from 'react';
import "../RealTime/TahoeMap/TahoeMap.css";
import "./WaveHeightPage.css"

function MaterialIcon(props) {
    ///////////////////////////////////////////
    // Expected props
    // material_icon_name: name of material icon
    // style (optional, default={}): css dictionary of style to apply to element
    // text: (optional, default=""): popup text
    // color: (optional): background color of the icon
    const text = props.text ?? "";
    const style = props.style !== undefined ? {...props.style} : {};
    if (props.color !== undefined) {
        style['backgroundColor'] = props.color;
    }
    
    return (
        <div className="material-icon-container">
            <span
                className={`material-symbols-outlined material-icon-marker ${props.material_icon_name}-icon`}
                style={style}
                >
                {props.material_icon_name}
            </span>
            
            <div className="material-icon-popup">
                {text}
            </div>
        </div>
    );
}

export default MaterialIcon;