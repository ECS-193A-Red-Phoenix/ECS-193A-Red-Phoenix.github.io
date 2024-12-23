import { useState, useEffect } from "react";
import { scaleLinear } from "d3";

import Calendar from "../Calendar/Calendar";
import TemperatureMap from "../TemperatureChart/TemperatureMap";
import TemperatureLegend from "../TemperatureChart/TemperatureLegend";
import "../TemperatureChart/TemperatureChart.css";
import "../RealTime/RealTimeConditions.css";
import "../../css/LakeConditions.css";
import "./WaveHeightPage.css";
import MaterialIcon from "./MaterialIcon";

import { lagoon, militaryHourTo12Hour, clamp } from "../../js/util";
import { retrieve_wind_forecasts } from "../../js/nws_api";
import CompassPlot from "../RealTime/CompassPlot";
import { retrieve_wh } from "../../js/wh_api";


////////////////////////////////////
// Static Constants
////////////////////////////////////

const MS_TO_MPH = 2.23694;
const wind_units = "mph";

const wh_min = 0;
const wh_max = 5;
const wh_units = "ft";

let wh_color = lagoon;
let wh_scale = scaleLinear().domain([wh_min, wh_max]).range([0, 1]);
let wh_color_scale = (wh) => wh_color(wh_scale(wh));

const calendar_description = "Select the date and time you want wave heights";

function formatDate(date) {
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let hours = String(militaryHourTo12Hour(date.getHours())).padStart(2, 0);
    let am_pm = (date.getHours() >= 12) ? "PM" : "AM";
    let minutes = String(date.getMinutes()).padStart(2, 0);

    return `${month}/${day} ${hours}:${minutes} ${am_pm}`;
}

function WaveHeightPage() {
    const [wind_data, setWindData] = useState(undefined);
    const [wh_data, setWHData] = useState({});
    const [activeIdx, setActiveIdx] = useState(0);

    const is_loading_wind = wind_data === undefined;
    const wind_unavailable = !is_loading_wind && wind_data === null;
    const is_loading_wh = wh_data[activeIdx] === undefined;
    const wh_unavailable = !is_loading_wh && wh_data[activeIdx] === null;
    let cache_id = `waveheight-${activeIdx}`;
    
    const wh_matrix = (is_loading_wh) ? undefined :
        (wh_unavailable) ? null : wh_data[activeIdx];

    ////////////////////////////////////
    // Retrieve Wind Forecasts
    ////////////////////////////////////
    useEffect(() => {
        retrieve_wind_forecasts()
            .then((res) => {
                res.sort((f1, f2) => f2.time - f1.time);
                let idx_closest_to_now = 0;
                const now = new Date();
                for (let idx = res.length - 1; idx >= 0; idx -= 1) {
                    if (now < res[idx].time) {
                        idx_closest_to_now = idx;
                        break;
                    }
                }
                setActiveIdx(idx_closest_to_now);
                setWindData(res);
            })
            .catch((error) => {
                console.log(error);
                console.log("Failed to retrieve wind forecasts from NWS");
                setWindData(null);
            });
    }, []);

    let wind_speed, wind_direction, compass_title;
    if (!is_loading_wind && !wind_unavailable) {
        [wind_speed, wind_direction] = wind_data[activeIdx].values;
        wind_speed = wind_speed * MS_TO_MPH;

        let active_date = wind_data[activeIdx].time;
        compass_title = `Wind ${formatDate(active_date)}`;
    }

    ////////////////////////////////////
    // Retrieve Wave Height Matrix
    ////////////////////////////////////
    useEffect(() => {
        if (is_loading_wind || wind_unavailable) return;
        if (wh_matrix !== undefined) return;

        // Load 10 at a time
        for (let i = 0; i < 10; i++) {
            let index = clamp(activeIdx - 5 + i, 0, wind_data.length - 1);
            if (wh_data[index] !== undefined && wh_data[index] !== null) continue;
            
            let [wind_speed, wind_direction] = wind_data[index].values;
            
            retrieve_wh(wind_speed, wind_direction)
                .then((wh_matrix) => {
                    setWHData((prev_wh_data) => {
                        const new_wh_data = {...prev_wh_data};
                        new_wh_data[index] = wh_matrix
                        return new_wh_data;
                    });
                })
                .catch((error) => {
                    console.log(error);
                    console.log(`Failed to retrieve wave heights for ws=${wind_speed}, wd=${wind_direction}`);
                    setWHData((prev_wh_data) => {
                        const new_wh_data = {...prev_wh_data};
                        new_wh_data[index] = null;
                        return new_wh_data;
                    });
                });
        }
    }, [wind_speed, wind_direction, activeIdx]);

    // Event Listener for Calendar changing event
    function on_event_selected(idx) {
        setActiveIdx(idx);
    }

    return (
        <div className="lake-condition-container">
            <div className="lake-condition-left-column">
                <div className="lake-condition-title"> Wave Height </div>
                <div className="lake-condition-description">
                    Wind speed and direction, fetch (the distance over the lake that the wind blows), and water depth are the most important factors affecting wave height. We use forecasted wind data and the STWAVE model to predict wave heights across Lake Tahoe. In general, the waves are higher on the downwind side of the lake, and closest to shore (where the water is shallower).
                </div>

                {/* If done loading display calendar and compass */}
                {
                    (is_loading_wind) ? <div> Retrieving wind forecasts </div> :
                    (wind_unavailable) ? <div> Unable to retrieve wind forecasts. Try again later. </div> :
                        <Calendar key='calendar' 
                            events={wind_data} 
                            active_event_index={activeIdx}
                            on_event_selected={on_event_selected}
                            description={calendar_description}/>
                }
            </div>

            <div className="lake-visual-container heatmap-container">
                {
                    (is_loading_wh) ? <div className="loading-visual"> Retrieving wave heights forecasts </div> :
                    (wh_unavailable) ? <div className="loading-visual"> Wave height map is temporarily unavailable </div> :
                        [
                            <TemperatureMap key='wave-height-map'
                                T={wh_matrix} 
                                units={wh_units}
                                color_palette={wh_color_scale} 
                                cache_id={cache_id}
                                decimal_places={1}>
                                    <div className="wave-height-wind-icon"> 
                                        <MaterialIcon
                                            material_icon_name={"north"}
                                            text={` Wind ${wind_speed.toFixed(1)} MPH`}
                                            color={"rgb(57, 140, 135)"}
                                            style={{"transform": `rotate(${wind_direction + 180}deg)`}}
                                            />
                                    </div>
                            </TemperatureMap>,
                            <TemperatureLegend key='wave-height-legend'
                                min={wh_min} 
                                max={wh_max} 
                                units={wh_units} 
                                num_ticks={6} 
                                decimal_places={1}
                                color_palette={wh_color}/>
                        ]
                }
            </div>

        </div>
    );
}

export default WaveHeightPage;