import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";

import TimePlot from "./TimePlot";
import ColorMarker from "../TahoeMap/ColorMarker";
import ErrorMarker from "../TahoeMap/ErrorMarker";
import "./LakeConditions.css"

import { colorScale, createLatLng, useIsMounted } from "../../../js/forked/util";
import { TercAPI } from "../../../js/forked/terc_api";

import APP_CONFIG from "../../../static/app_config.json"
import { Mutex } from "async-mutex"
import LoadingIcon from "../TahoeMap/LoadingIcon";

function StationChart(props) {
    //////////////////////////////////////////////////////
    // Expected props
    // data_type_name: the name of the data to display, a static member of TercAPI.
    //      You may pass in an array of data_types if you wish to display multiple on the same chart
    // chart_props: props to pass onto TimePlot
    // start_date: the start date of the chart
    // end_date: the end date of the chart
    // data_cleaning_function (optional): a post processing function to clean 
    //      chart data, takes in (y) => returns y-value
    const isMounted = useIsMounted();
    const [[map_markers, setMapMarkers, active_location_idx, setActiveLocation]] = useOutletContext();
    const [ current_station_data, setCurrentStationData ] = useState({ 
        "time": undefined, 
        "station_data": undefined 
    });
    const { time, station_data } = current_station_data;
    const is_downloading = time === undefined && station_data === undefined;
    const is_unavailable = time === null && station_data === null;

    let { data_type_name, chart_props, start_date, end_date, data_cleaning_function } = props;
    data_type_name = Array.isArray(data_type_name) ? data_type_name : [data_type_name];
    chart_props = chart_props ?? {};
    data_cleaning_function = data_cleaning_function ?? ((x) => x);

    const STATIONS = TercAPI.get_stations_with_data_types(data_type_name);

    ///////////////////////////////////////
    // Update current station data
    ///////////////////////////////////////
    const current_station = STATIONS[active_location_idx];
    useEffect(() => {
        let ignore = false;

        // Set data to downloading state
        setCurrentStationData({"time": undefined, "station_data": undefined});
        if (!current_station)
            return;

        Promise.all(data_type_name
            .map((dt) => current_station.get_data(start_date, end_date, dt))
        )
        .then((data) => {
            let time = data.map((d) => d[TercAPI.TIME_KEY]);
            let station_data = data.map((d, idx) => d[data_type_name[idx]].map(data_cleaning_function));
            if (!ignore)
                setCurrentStationData({"time": time, "station_data": station_data});
        })
        .catch((err) => {
            console.log(err);
            if (!ignore)
                setCurrentStationData({"time": null, "station_data": null});
        });

        return () => { ignore = true; };
    }, [active_location_idx, start_date, end_date]);

    ///////////////////////////////////////
    // Setup all stations
    ///////////////////////////////////////
    useEffect(() => {
        let ignore = false;

        const loading_icons = STATIONS
            .map((station, idx) =>
                <LoadingIcon
                    key={`loading-station-${station.name}-${idx}`}
                    position={createLatLng(...station.coords)}
                    onClick={() => setActiveLocation(idx)}
                    active={idx == active_location_idx}
                    />
            )
        setMapMarkers(loading_icons);

        let lock = new Mutex();
        let most_recent_station_values = STATIONS.map(() => undefined);

        function process_station_data(station_idx, station_data_value) {
            most_recent_station_values[station_idx] = station_data_value;
            const valid_data = most_recent_station_values.filter(x => typeof x === "number");
            const min_value = Math.min(...valid_data);
            const max_value = Math.max(...valid_data);
            const min_color_rgb = [57, 140, 135];
            const max_color_rgb = [4, 52, 77];
            const color_scale = colorScale([min_color_rgb, max_color_rgb]);
            const get_color = (value) => {
                const color = (min_value === max_value) ? max_color_rgb :
                    color_scale((value - min_value) / (max_value - min_value));
                return `rgb(${color.join(",")})`;
            }
            
            const station_map_markers = 
                STATIONS
                .map((station, idx) => {
                    if (most_recent_station_values[idx] === null) {
                        return <ErrorMarker
                                key={`station-marker-${station.name}-${idx}`}
                                position={createLatLng(...station.coords)}
                                error_msg={`${station.name} temporarily unavailable`}
                                onClick={() => setActiveLocation(idx)}
                                active={idx == active_location_idx}
                                />
                    }
                    else if (most_recent_station_values[idx] === undefined) {
                        return <LoadingIcon
                            key={`loading-station-${station.name}-${idx}`}
                            position={createLatLng(...station.coords)}
                            onClick={() => setActiveLocation(idx)}
                            active={idx == active_location_idx}
                            />
                    }

                    const marker_text = most_recent_station_values[idx].toFixed(1);
                    return <ColorMarker
                        key={`station-marker-${station.name}-${idx}`}
                        position={createLatLng(...station.coords)}
                        text={marker_text}
                        color={get_color(most_recent_station_values[idx])}
                        onClick={() => setActiveLocation(idx)}
                        active={idx == active_location_idx}
                        />  
                });

            if (isMounted() && !ignore)
                setMapMarkers(station_map_markers);
        }

        // Download all station data           
        STATIONS
            .map((station, idx) => 
                station.get_most_recent_data(start_date, end_date, data_type_name[0])
                    .then(async (station_data_value) => {
                        return await lock.runExclusive(() => {
                            process_station_data(idx, station_data_value)
                        })
                    })
                    .catch(async (err) => {
                        console.log(`Failed to download valid data from station '${station.name}' ${err}}`)
                        return await lock.runExclusive(() => {
                            process_station_data(idx, null)
                        })
                    })
                    
            )

        return () => { ignore = true; };
    }, [start_date.getTime(), end_date.getTime(), active_location_idx]);

    return (
        <div className="lake-conditions-chart-container"> 
            {
                (is_downloading) ? 
                    <div> 
                        Downloading data
                    </div>
                : (is_unavailable) ?
                    <div>
                        Data at {current_station.name} is temporarily unavailable
                    </div>
                : 
                    <>
                    <div className="chart-title"> {current_station.name} </div>
                    <TimePlot
                        time={time}
                        y={station_data}
                        {...chart_props}
                        />
                    </>
            }
        </div>
    );
}

export default StationChart;