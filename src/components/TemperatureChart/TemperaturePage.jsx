import TemperatureMap from "./TemperatureMap";
import { scaleLinear } from "d3";
import TemperatureLegend from "./TemperatureLegend";
import { ice_to_fire, reversed } from "../util";
import { parseMyDate } from "../util";
import "./TemperatureChart.css";
import "../styles/LakeConditions.css";
import { useState } from "react";
import Calendar from "../Calendar/Calendar";


////////////////////////////////////
// Static Constants
////////////////////////////////////

const FRAME_DURATION = 2; // duration in hours for 1 temperature map
const temperature_color = ice_to_fire; 

const temperature_data = require('./temperature.json');
temperature_data.forEach((obj) => obj['time'] = parseMyDate(obj['time']));
temperature_data.sort((o1, o2) => o1['time'] - o2['time']);

function TemperaturePage() {
    const [activeIdx, setActiveIdx] = useState(0);
    const temperature_events = temperature_data.map(
        (obj) => { return { time: obj['time'], duration: FRAME_DURATION }; }
    );

    let T = temperature_data[activeIdx]['matrices'][0];
    T = reversed(T);
    const lake_height = 700;

    let min_T = 35;
    let max_T = 65;

    let temperature_scale = scaleLinear().domain([min_T, max_T]).range([0, 1]);
    let temperature_color_scale = (temperature) => temperature_color(temperature_scale(temperature));

    return (
        <div className="lake-condition-container">
            <div className="lake-condition-left-column">
                <div className="lake-condition-description-container">
                    <div className="lake-condition-title"> Water Temperature </div>
                    <div className="lake-condition-description">
                        Lake Tahoe water is cold for most swimmers, with surface temperatures ranging 
                        from 42 degrees in the winter to over 70 degrees in July and August. Though refreshing 
                        on a hot day, a plunge into Lake Tahoe can literally take your breath away. Swimmers 
                        should be prepared for dangerously cold conditions.
                    </div>

                    <Calendar events={temperature_events} 
                        active_event_idx={activeIdx}
                        on_event_selected={(idx) => setActiveIdx(idx)}/>
                </div>
            </div>

            <div className="lake-visual-container">
                <TemperatureMap height={lake_height} T={T} color_palette={temperature_color_scale} activeIdx={activeIdx}/>
                <TemperatureLegend height={lake_height} min_T={min_T} max_T={max_T} color_palette={temperature_color}/>
            </div>

        </div>
    );
}

export default TemperaturePage;