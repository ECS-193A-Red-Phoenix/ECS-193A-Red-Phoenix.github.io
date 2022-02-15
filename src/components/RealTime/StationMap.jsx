import { select, selectAll } from "d3";
import { useEffect, useRef } from "react";
import { ALL_STATIONS } from "./api";

// Bounds of the map
const bounds = [
    [38.88973786614013, -120.22406605972319],  // southWest
    [39.29014918866168, -119.84887189740661] // northEast
];

function StationMap(props) {
    let [lat1, lon1] = bounds[0];
    let [lat2, lon2] = bounds[1];

    useEffect(() => {
        const stations_with_index = ALL_STATIONS.map((d, i) => ({ ...d, index: i}));
        // Outer circle
        select(".station-map-container > svg > g#outer")
        .selectAll("circle")
        .data(stations_with_index)
        .join("circle")
        .attr("cy", (d) => {
            let [lat, lon] = d.info.coords;
            return `${100 - (lat - lat1) / (lat2 - lat1) * 100}%`;
        })
        .attr("cx", (d) => {
            let [lat, lon] = d.info.coords;
            return `${(lon - lon1) / (lon2 - lon1) * 100}%`;
        })
        .attr("r", 16)
        .attr("stroke", "white")
        .attr("fill-opacity", 0)

        // Inner Circle
        select(".station-map-container > svg > g#inner")
        .selectAll("circle")
        .data(stations_with_index)
        .join("circle")
        .attr("cy", (d) => {
            let [lat, lon] = d.info.coords;
            return `${100 - (lat - lat1) / (lat2 - lat1) * 100}%`;
        })
        .attr("cx", (d) => {
            let [lat, lon] = d.info.coords;
            return `${(lon - lon1) / (lon2 - lon1) * 100}%`;
        })
        .attr("r", 14)
        .attr("fill", "white")
        .attr("fill-opacity", (d, i) => {
            return (i == props.stationIdx) ? 1 : 0
        })
        .on("click", function (e, d) {
            console.log("Set station index to", d.index);
            props.onClick(d.index);
        });

    }, [props.stationIdx]);

    return (
        <div className="station-map-container">
            <img src="map.PNG"/>
            <svg height="100%" width="100%" 
                shapeRendering="geometricPrecision">
                <g id="outer"></g>
                <g id="inner"></g>
            </svg>
        </div>
    );
}

export default StationMap;