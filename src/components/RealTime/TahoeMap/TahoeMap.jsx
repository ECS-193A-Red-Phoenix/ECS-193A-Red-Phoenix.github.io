import { useEffect, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "./TahoeMap.css";

import MAP_LABELS from "../../../static/map_labels.json";
import APP_CONFIG from "../../../static/app_config.json";
import TextMarker from "./TextMarker";
import Acknowledgements from "./Acknowledgements";

///////////////////////////////////////////////////
// Static Constants
///////////////////////////////////////////////////
const MAP_LABEL_MARKERS = MAP_LABELS.map((label) => {
    function createLatLng(lat, lon) {
        return { lat: lat, lon: lon};
    }
    return (
        <TextMarker
            key={`map-marker-${label.name}`}
            text={label.name}
            position={createLatLng(...label.loc)}
            />
    );
});

function TahoeMap(props) {
    const tahoe_map_style = {};
    const [width, setWidth] = useState(document.body.clientWidth);
    useEffect(() => {
        const handleResize = () => setWidth(document.body.clientWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    const container_padding = 30;
    const max_width = 1040 + container_padding;
    const scale = width < max_width ? `scale(${width / max_width})` : 'scale(1)';
    tahoe_map_style["transform"] = scale;
    tahoe_map_style["transformOrigin"] = 'top';

    return (
        <div className="tahoe-map"
            style={ tahoe_map_style }
            >
            <MapContainer 
                style={{height: "100%", width: "100%"}}
                center={APP_CONFIG.MAP_CENTER}
                zoom={11}
                dragging={false}
                zoomControl={false}
                scrollWheelZoom={false}
                touchZoom={false}
                doubleClickZoom={false}
                >

                <TileLayer
                    url="https://{s}.tile.jawg.io/jawg-terrain/{z}/{x}/{y}{r}.png?access-token=mHKMKopPnSFl1OCu1LhHVkeB0iTiKTquAvaiV3ruMJG4UZPPApASL638sPPgy80q"
                    // url="http://sm.mapstack.stamen.com/($809380[@p],(terrain-background,$a79880[hsl-color])[overlay@80],toner-lines[multiply@40],(mapbox-water,$000[@20],$04344d[hsl-color]))/{z}/{x}/{y}.png"
                    />

                { MAP_LABEL_MARKERS }

                { props.children }

            </MapContainer>

            <Acknowledgements/>
        </div>
    );
}

export default TahoeMap;