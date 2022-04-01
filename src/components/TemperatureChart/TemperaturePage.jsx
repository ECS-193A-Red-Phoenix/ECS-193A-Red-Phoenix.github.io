import { useState, useEffect } from "react";
import { scaleLinear } from "d3";

import TemperatureMap from "./TemperatureMap";
import TemperatureLegend from "./TemperatureLegend";
import Calendar from "../Calendar/Calendar";
import "./TemperatureChart.css";
import "../styles/LakeConditions.css";

import { celsius_to_f, ice_to_fire, parseMyDate, apply, reversed } from "../util";
import { loadNumpyFile } from "../numpy_parser";


////////////////////////////////////
// Static Constants
////////////////////////////////////

const FRAME_DURATION = 2; // duration in hours for 1 temperature map
const temperature_color = ice_to_fire; 
const lake_height = 700;
const min_T = 35;
const max_T = 65;
let temperature_scale = scaleLinear().domain([min_T, max_T]).range([0, 1]);
let temperature_color_scale = (temperature) => temperature_color(temperature_scale(temperature));

const temperature_files = ['2022-02-20 08.npy', '2022-02-20 10.npy', '2022-02-20 12.npy', '2022-02-20 14.npy', '2022-02-20 16.npy', '2022-02-20 18.npy', '2022-02-20 20.npy', '2022-02-20 22.npy', '2022-02-21 00.npy', '2022-02-21 02.npy', '2022-02-21 04.npy', '2022-02-21 06.npy', '2022-02-21 08.npy', '2022-02-21 10.npy', '2022-02-21 12.npy', '2022-02-21 14.npy', '2022-02-21 16.npy', '2022-02-21 18.npy', '2022-02-21 20.npy', '2022-02-21 22.npy', '2022-02-22 00.npy', '2022-02-22 02.npy', '2022-02-22 04.npy', '2022-02-22 06.npy', '2022-02-22 08.npy', '2022-02-22 10.npy', '2022-02-22 12.npy', '2022-02-22 14.npy', '2022-02-22 16.npy', '2022-02-22 18.npy', '2022-02-22 20.npy', '2022-02-22 22.npy', '2022-02-23 00.npy'];
const TEMPERATURE_DIR = "static/temperature/";

function TemperaturePage() {
    const [temperature_data, setTempData] = useState([]);
    const is_loading = temperature_data.length === 0;

    ////////////////////////////////////
    // Load temperature binary files
    ////////////////////////////////////
    useEffect(() => {
        const file_promises = [];
        for (let file of temperature_files) {
            const file_path = TEMPERATURE_DIR + file;
            const date = parseMyDate(file.substring(0, 13));
            
            file_promises.push(new Promise((resolve) => {
                loadNumpyFile(file_path).then(
                    (T_matrix) => resolve({ 'time': date, 'matrices': apply(T_matrix, celsius_to_f) }) 
                );
            }));
        }

        Promise.all(file_promises).then((result) => {
            setTempData(result);
        });
    }, []);

    const [activeIdx, setActiveIdx] = useState(0);
    const temperature_events = temperature_data.map(
        (obj) => { return { time: obj['time'], duration: FRAME_DURATION }; }
    );

    let T;
    if (!is_loading) {
        T = temperature_data[activeIdx]['matrices'];
        T = reversed(T);
    } 
    console.log(temperature_data)

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
                </div>

                {
                    !is_loading &&
                    <Calendar events={temperature_events} 
                        active_event_idx={activeIdx}
                        on_event_selected={(idx) => setActiveIdx(idx)}/>
                }
            </div>

            {
                (is_loading) ? 
                    <div> Loading </div> :
                    <div className="lake-visual-container">
                        <TemperatureMap height={lake_height} T={T} color_palette={temperature_color_scale} activeIdx={activeIdx}/>
                        <TemperatureLegend height={lake_height} min_T={min_T} max_T={max_T} color_palette={temperature_color}/>
                    </div>
            }

        </div>
    );
}

export default TemperaturePage;