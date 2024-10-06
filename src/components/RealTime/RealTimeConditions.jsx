import React, { useState } from "react";

import "../../css/Modules.css";

import ModuleContainer from "./ModuleContainer/ModuleContainer";
import MODULES from "../../static/modules.json";

import "./RealTimeConditions.css";
import { clamp } from "../../js/util";
import TahoeMap from "./TahoeMap/TahoeMap";

function RealTimeConditions(props) {
    const [map_markers, setMapMarkers] = useState([]);
    const [active_location_idx, setActiveLocation] = useState(0);

    function safelySetMapMarkers(markers) {
        setActiveLocation(clamp(active_location_idx, 0, markers.length - 1));
        setMapMarkers(markers);
    }

    return (
        <div className="real-time-conditions-container">
            <ModuleContainer
                module={MODULES.LAKE_CONDITIONS}
                default_bottom_tab_idx={2}
                context={[map_markers, safelySetMapMarkers, active_location_idx, setActiveLocation]}
                />

            <TahoeMap>
                { map_markers }
            </TahoeMap>
        </div>
    );
}

export default RealTimeConditions;
