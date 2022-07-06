import { useEffect } from "react";
import { select, selectAll } from "d3";

const tag_height = 5; // Percentage

function getMapXY(bounds, coords) {
    let [y_0, x_0] = coords;
    let [y_s, x_s] = bounds[0];
    let [y_e, x_e] = bounds[1];
    return [100 - (x_0 - x_s) / (x_e - x_s) * 100, (y_0 - y_s) / (y_e - y_s) * 100];
}

function StationMap(props) {
    //////////////////////////////////////////////////
    // Expected Props:
    // bounds: an Array [ [lat1, lon1], [lat2, lon2] ] of the bounds of the map
    // locations: an Array of [{ name: String, coords: [lat, lon], shape: String }] objects
    //   shape can be "circle" or "square"
    // active_map_marker_idx: the index of which map marker is active
    // onClick: a function that takes an index as a parameter. Called when a map marker is clicked

    let { bounds, locations, active_map_marker_idx, onClick } = props;

    useEffect(() => {
        const locations_with_index = locations.map((d, i) => ({ ...d, index: i}));

        const circle_locations = locations_with_index.filter((d) => d.shape === "circle");
        const square_locations = locations_with_index.filter((d) => d.shape === "square");
        
        const outer_circle_radius = 10;
        const inner_circle_radius = 8;
        const outer_square_len = 18;
        const inner_square_len = 14;
        
        function getLocationX(location) {
            let x = getMapXY(bounds, location.coords)[0];
            return `${x}%`;
        }

        function getLocationY(location) {
            let y = getMapXY(bounds, location.coords)[1];
            return `${y}%`;
        }
        
        // Outer Square
        select(".station-map-container > svg > g#outer-square")
        .selectAll("rect")
        .data(square_locations)
        .join("rect")
        .attr("x", getLocationX)
        .attr("y", getLocationY)
        .attr("width", outer_square_len)
        .attr("height", outer_square_len)
        .attr("transform", `translate(${-outer_square_len / 2}, ${-outer_square_len / 2})`)
        .attr("stroke", "white")
        .attr("fill-opacity", 0)

        // Inner Square
        select(".station-map-container > svg > g#inner-square")
        .selectAll("rect")
        .data(square_locations)
        .join("rect")
        .attr("x", getLocationX)
        .attr("y", getLocationY)
        .attr("width", inner_square_len)
        .attr("height", inner_square_len)
        .attr("transform", `translate(${-inner_square_len / 2}, ${-inner_square_len / 2})`)
        .attr("fill", "white")
        .attr("fill-opacity", (d) => {
            return (d.index === active_map_marker_idx) ? 1 : 0
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
            if (d.index === active_map_marker_idx)
                return
            select(`g#station-tag${d.index}`)
            .style("display", "none");
        });

        // Outer circle
        select(".station-map-container > svg > g#outer-circle")
        .selectAll("circle")
        .data(circle_locations)
        .join("circle")
        .attr("cx", getLocationX)
        .attr("cy", getLocationY)
        .attr("r", outer_circle_radius)
        .attr("stroke", "white")
        .attr("fill-opacity", 0)

        // Inner Circle
        select(".station-map-container > svg > g#inner-circle")
        .selectAll("circle")
        .data(circle_locations)
        .join("circle")
        .attr("cx", getLocationX)
        .attr("cy", getLocationY)
        .attr("r", inner_circle_radius)
        .attr("fill", "white")
        .attr("fill-opacity", (d) => {
            return (d.index === active_map_marker_idx) ? 1 : 0
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
            if (d.index === active_map_marker_idx)
                return
            select(`g#station-tag${d.index}`)
            .style("display", "none");
        });
        
        // Marker tags
        let marker_tags = select("g#station-tags")
        .selectAll("g")
        .data(locations_with_index)
        .enter()
        .append("g")
        .attr("id", (d) => `station-tag${d.index}`);

        marker_tags
        .append("text")
        .attr("y", (d) => {
            let [x, y] = getMapXY(bounds, d.coords);
            return `${y - 1.5 * tag_height}%`;
        })
        .attr("x", (d) => {
            let [x, y] = getMapXY(bounds, d.coords);
            return `${x}%`;
        })
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .text((d) => d.name)

        marker_tags
        .insert("rect", "text")
        .attr("y", (d) => {
            let [x, y] = getMapXY(bounds, d.coords);
            return `${y - 2 * tag_height}%`;
        })
        .attr("x", function (d) {
            let [x, y] = getMapXY(bounds, d.coords);
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
        .data(locations_with_index)
        .join()
        .style("display", (d) => (d.index === active_map_marker_idx) ? "block" : "none")
    }, [active_map_marker_idx, onClick]);
    
    return (
        <div className="station-map-container">
            <div className="station-map-title"> Tahoe Station Map </div>
            <div className="station-map-desc"> Select a TERC station below </div>
            <img alt="Lake Tahoe Map" src="/static/img/map.PNG"/>
            <svg height="100%" width="100%" 
                shapeRendering="geometricPrecision">
                
                <g id="outer-circle"></g>
                <g id="inner-circle"></g>

                <g id="outer-square"></g>
                <g id="inner-square"></g>
                
                <g id="station-tags"></g>
            </svg>
        </div>
    );
}

export default StationMap;