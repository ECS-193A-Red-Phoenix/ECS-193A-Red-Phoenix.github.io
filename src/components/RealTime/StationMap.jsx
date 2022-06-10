import { useEffect } from "react";
import { select, selectAll } from "d3";
import { ALL_STATIONS } from "../../js/terc_api";

// Bounds of the map
const bounds = [
    [39.339168, -119.84087189740661], // northEast
    [38.883758, -120.2306605972319]   // southWest
];
const tag_height = 5; // Percentage

function getMapXY(coords) {
    let [y_0, x_0] = coords;
    let [y_s, x_s] = bounds[0];
    let [y_e, x_e] = bounds[1];
    return [100 - (x_0 - x_s) / (x_e - x_s) * 100, (y_0 - y_s) / (y_e - y_s) * 100];
}

function StationMap(props) {
    let { stationIdx, onClick } = props;

    useEffect(() => {
        const stations_with_index = ALL_STATIONS.map((d, i) => ({ ...d, index: i}));

        // Outer circle
        select(".station-map-container > svg > g#outer")
        .selectAll("circle")
        .data(stations_with_index)
        .join("circle")
        .attr("cy", (d) => {
            let [x, y] = getMapXY(d.info.coords);
            return `${y}%`;
        })
        .attr("cx", (d) => {
            let [x, y] = getMapXY(d.info.coords);
            return `${x}%`;
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
            let [x, y] = getMapXY(d.info.coords);
            return `${y}%`;
        })
        .attr("cx", (d) => {
            let [x, y] = getMapXY(d.info.coords);
            return `${x}%`;
        })
        .attr("r", 14)
        .attr("fill", "white")
        .attr("fill-opacity", (d, i) => {
            return (i === stationIdx) ? 1 : 0
        })
        .style("cursor", "pointer")
        .on("click", function (e, d) {
            onClick(d.index);
        })
        .on("mouseover", (e, d) => {
            select(`g#station-tag${d.index}`)
            .style("display", "block");
        })
        .on("mouseleave", (e, d) => {
            if (d.index === stationIdx)
                return
            select(`g#station-tag${d.index}`)
            .style("display", "none");
        });
        
        // Station tags
        let station_tags = select("g#station-tags")
        .selectAll("g")
        .data(stations_with_index)
        .enter()
        .append("g")
        .attr("id", (d) => `station-tag${d.index}`);

        station_tags
        .append("text")
        .attr("y", (d) => {
            let [x, y] = getMapXY(d.info.coords);
            return `${y - 1.5 * tag_height}%`;
        })
        .attr("x", (d) => {
            let [x, y] = getMapXY(d.info.coords);
            return `${x}%`;
        })
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .text((d) => d.info.station_name)

        station_tags
        .insert("rect", "text")
        .attr("y", (d) => {
            let [x, y] = getMapXY(d.info.coords);
            return `${y - 2 * tag_height}%`;
        })
        .attr("x", function (d) {
            let [x, y] = getMapXY(d.info.coords);
            return `${x}%`;
        })
        .attr("width", function() {
            return this.parentElement.childNodes[1].getComputedTextLength() + 10;
        })
        .attr("transform", function () {
            let width = this.parentElement.childNodes[1].getComputedTextLength() + 10;
            return `translate(${- width / 2})`;
        })
        .attr("height", `${tag_height}%`)
        .attr("rx", "1%")
        .attr("ry", "1%")
        .attr("fill", "white");

        // Turn off inactive station tags
        selectAll("g#station-tags > g")
        .data(stations_with_index)
        .join()
        .style("display", (d) => (d.index === stationIdx) ? "block" : "none")
    }, [stationIdx, onClick]);
    
    return (
        <div className="station-map-container">
            <div className="station-map-title"> Tahoe Station Map </div>
            <div className="station-map-desc"> Select a TERC station below </div>
            <img alt="Lake Tahoe Map" src="/static/img/map.PNG"/>
            <svg height="100%" width="100%" 
                shapeRendering="geometricPrecision">
                <g id="outer"></g>
                <g id="inner"></g>
                <g id="station-tags"></g>
            </svg>
        </div>
    );
}

export default StationMap;