import { useState, useEffect } from "react";
import { scaleLinear } from "d3";

import Calendar from "../Calendar/Calendar";
import TemperatureMap from "../TemperatureChart/TemperatureMap";
import TemperatureLegend from "../TemperatureChart/TemperatureLegend";
import "../TemperatureChart/TemperatureChart.css";
import "../styles/LakeConditions.css";

import { lagoon, militaryHourTo12Hour } from "../util";
import { retrieve_wind_forecasts } from "../WaveHeightChart/nws_api";
import CompassPlot from "../RealTime/CompassPlot";
import { retrieve_wh } from "./wh_api";


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
let wh_color_scale = (temperature) => wh_color(wh_scale(temperature));

const calendar_description = "Select a forecast of Lake Tahoe's wave heights";

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
    const [wh_data, setWHData] = useState(undefined);
    const [activeIdx, setActiveIdx] = useState(0);

    const is_loading_wind = wind_data === undefined;
    const wind_unavailable = !is_loading_wind && wind_data === null;
    const is_loading_wh = wh_data === undefined;
    const wh_unavailable = !is_loading_wh && wh_data === null;
    let cache_id = `waveheight-${activeIdx}`;
    
    ////////////////////////////////////
    // Retrieve Wind Forecasts
    ////////////////////////////////////
    useEffect(() => {
        retrieve_wind_forecasts()
            .then(setWindData)
            .catch((error) => {
                console.log(error);
                console.log("Failed to retrieve wind forecasts from NWS");
                setWindData(null);
            });
    }, []);

    let wind_speed, wind_direction, compass_title;
    if (!is_loading_wind) {
        [wind_speed, wind_direction] = wind_data[activeIdx].values;

        let active_date = wind_data[activeIdx].time;
        compass_title = `Wind ${formatDate(active_date)}`;
    }

    ////////////////////////////////////
    // Retrieve Wave Height Matrix
    ////////////////////////////////////
    useEffect(() => {
        if (is_loading_wind || wind_unavailable) return;

        retrieve_wh(wind_speed, wind_direction)
            .then(setWHData)
            .catch((error) => {
                console.log(error);
                console.log(`Failed to retrieve wave heights for ws=${wind_speed}, wd=${wind_direction}`);
                setWHData(null);
            });
    }, [wind_speed, wind_direction]);

    return (
        <div className="lake-condition-container">
            <div className="lake-condition-left-column">
                <div className="lake-condition-title"> Wave Height </div>
                <div className="lake-condition-description">
                    Lake tahoe wave height description
                </div>

                {/* If done loading display calendar and compass */}
                {
                    (is_loading_wind) ? <div> Retrieving wind forecasts </div> :
                    (wind_unavailable) ? <div> Unable to retrieve wind forecasts. Try again later. </div> :
                        [
                            <Calendar key='calendar' 
                                events={wind_data} 
                                active_event_idx={activeIdx}
                                on_event_selected={(idx) => setActiveIdx(idx)}
                                description={calendar_description}/>,
                            <CompassPlot key='compass'
                                radius={450}
                                speed={wind_speed * MS_TO_MPH}
                                direction={wind_direction}
                                units={wind_units}
                                title={compass_title}/>
                        ]
                }
            </div>

            <div className="lake-visual-container">
                {
                    (is_loading_wh) ? <span> Retrieving wave heights forecasts </span> :
                    (wh_unavailable) ? <span> Wave height map is temporarily unavailable </span> :
                        [
                            <TemperatureMap key='wave-height-map'
                                T={wh_data} 
                                units={wh_units}
                                color_palette={wh_color_scale} 
                                cache_id={cache_id}/>,
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