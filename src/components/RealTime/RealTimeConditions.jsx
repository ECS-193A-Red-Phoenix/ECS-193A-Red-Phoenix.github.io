import React, { useState, useEffect } from "react";

import ChartTabButton from "./MapControlButton";
import StationMap from "./StationMap";
import LinePlot from "./LinePlot";
import CompassPlot from "./CompassPlot";
import TCPlot from "./TCPlot";

import "./RealTimeConditions.css";

import { STATIONS } from "../../js/terc_api";
import { unzip, mean, wind_direction_mean, useForceUpdate, clamp } from "../../js/util";
import MAP_CONFIG from "../../static/map_config.json";

// Get station objects from station names in MAP_CONFIG
const MAP_STATIONS = MAP_CONFIG.MARKERS
    .map(({stations}) => {
        return stations
            .map((name) => {
                const station = STATIONS.find((s) => s.name === name)
                if (station === undefined)
                    throw new Error(`Could not find station '${name}', check map and station config files`);
                return station;
            });
    });

function RealTimeConditions(props) {
    let [ map_state, setMapState ] = useState({
        active_map_marker_idx: 1,
        active_station_idx: 0,
        active_data_idx: 0
    })
    let forceUpdate = useForceUpdate();
    
    let { active_map_marker_idx, active_station_idx, active_data_idx } = map_state;
    let active_station = MAP_STATIONS[active_map_marker_idx][active_station_idx];
    
    // Get data types available for this map marker
    let active_data_types = MAP_STATIONS[active_map_marker_idx]
        .map((station) => station.data_types);
    let active_data_type = active_data_types[active_station_idx][active_data_idx];

    // Useful debug info
    // console.log("Station: ", active_station.name);
    // console.log("Data Type", active_data_type.name);
    // console.log(`Map Marker Idx: ${active_map_marker_idx}, Station Idx: ${active_station_idx}, Data Type Idx: ${active_data_idx}`)
        
    function onMapMarkerChanged(idx) {
        // Ensure new active_station_idx is within bounds of available stations at marker
        let map_marker_stations = MAP_STATIONS[idx];
        let num_stations = map_marker_stations.length;
        let clamped_station_idx = clamp(active_station_idx, 0, num_stations - 1); 

        // Ensure active_data_idx is within bounds of available data types
        let num_data_types = map_marker_stations[clamped_station_idx].data_types.length; 
        let clamped_dt_idx = clamp(active_data_idx, 0, num_data_types - 1);

        setMapState({
            active_map_marker_idx: idx,
            active_station_idx: clamped_station_idx,
            active_data_idx: clamped_dt_idx
        })
    }

    // Extract data from current station
    let time, y_data;
    if (active_station.data_available()) {
        time = active_station.data.map((x) => x["TimeStamp"])
        y_data = active_station.data.map((x) => x[active_data_type.name]);
    }

    // Download data from each station
    useEffect(() => {
        STATIONS.forEach((station) => {
            // downloading data mutates station itself, force update
            station.get_display_data()
                .then(forceUpdate)
                .catch((err) => {
                    station.data = null;
                    console.log(`Failed to fetch data for station ${station.name}`);
                    console.log(err);
                    forceUpdate();
                });
        });
    }, []);

    // Tabs below chart
    let chart_tabs = active_data_types
        .flatMap((data_types, station_idx) => {
            return data_types
                .map((data_type, data_idx) => {
                    let is_active = station_idx === active_station_idx && data_idx === active_data_idx;
                    return <ChartTabButton
                                key={`${data_type.name}-${station_idx}-${data_idx}`}
                                name={data_type.name}
                                active={is_active}
                                onClick={() => {
                                    setMapState({
                                        active_map_marker_idx: active_map_marker_idx,
                                        active_station_idx: station_idx,
                                        active_data_idx: data_idx
                                    })
                                }}
                                />
                });
        });

    // Create chart
    // This switch statement is ugly how do i fix it
    const chart_title = `${active_data_type.name} @ ${active_station.location_name}`;
    const chart_type = active_data_type.display_type;
    let chart;
    switch (chart_type) {
        case "line":
            chart = (
                <LinePlot
                    time={time}
                    y={y_data}
                    title={chart_title}
                    units={active_data_type.units}
                    range={active_data_type.range}
                    />
            );
            break;
        case "polar":
            let average_wind_speed, average_wind_direction;
            if (y_data !== undefined) {
                // Only use the last 12 data points, ~ 4 hours
                let [wind_speed, wind_direction] = unzip(y_data.slice(y_data.length - 12));
                average_wind_speed = mean(wind_speed);
                average_wind_direction = wind_direction_mean(wind_direction);
            }
            chart = (
                <CompassPlot
                    radius={500}
                    speed={average_wind_speed}
                    direction={average_wind_direction}
                    title={chart_title}
                    units={active_data_type.units}
                    />
            );
            break;
        case "heatmap":
            chart = (
                <TCPlot
                    title={chart_title}
                    time={time}
                    ctd_profiles={y_data}
                    cache_id={"tc_plot"}
                    min_depth={0}
                    // Max depth dynamically determined
                    min_T={40}
                    max_T={70}
                    />
            );
            break;
        default:
            console.log(`Unexpected chart type "${chart_type}"`);
    }

    return (
        <div className="real-time-conditions-container">
            <div className="time-plot-container">
                { chart }
                <div className="map-controls-container">
                    { 
                        // Only display tabs if there is more than one tab
                        (chart_tabs.length > 1) && chart_tabs 
                    }
                </div>
            </div>

            <StationMap 
                bounds={MAP_CONFIG.BOUNDS}
                locations={MAP_CONFIG.MARKERS}
                active_map_marker_idx={active_map_marker_idx} 
                onClick={onMapMarkerChanged}/>
        </div>
    );
}

export default RealTimeConditions;
