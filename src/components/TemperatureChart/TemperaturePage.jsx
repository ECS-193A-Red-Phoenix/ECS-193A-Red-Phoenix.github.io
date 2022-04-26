import { useState, useEffect } from "react";
import { scaleLinear } from "d3";

import TemperatureMap from "./TemperatureMap";
import TemperatureLegend from "./TemperatureLegend";
import Calendar from "../Calendar/Calendar";
import "./TemperatureChart.css";
import "../../css/LakeConditions.css";

import { ice_to_fire, reversed } from "../../js/util";
import { S3 } from "../../js/s3_api";


////////////////////////////////////
// Static Constants
////////////////////////////////////

const temperature_color = ice_to_fire; 
const T_min = 40;
const T_max = 70;
const T_units = "° F";
let temperature_scale = scaleLinear().domain([T_min, T_max]).range([0, 1]);
let temperature_color_scale = (temperature) => temperature_color(temperature_scale(temperature));

const calendar_description = "Select a forecast of Lake Tahoe's surface temperature";

function TemperaturePage() {
    const [temperature_files, setTempData] = useState(undefined);
    const [activeIdx, setActiveIdx] = useState(0);
    const is_loading_files = temperature_files === undefined;
    const is_unavailable = !is_loading_files && temperature_files === null;
    const is_downloading = !is_loading_files && !is_unavailable 
        && temperature_files[activeIdx].matrix === undefined;
    const failed_download = !is_loading_files && !is_unavailable 
        && temperature_files[activeIdx].matrix === null;

    ////////////////////////////////////
    // Load temperature binary files
    ////////////////////////////////////
    useEffect(() => {
        S3.get_temperature_files()
            // .then((r) => {console.log(r); return r;})
            .then(setTempData)
            .catch((err) => {
                console.log(err);
                setTempData(null);
            });
    }, []);

    useEffect(() => {
        if (is_loading_files || is_unavailable)
            return;
        
        // download() mutates temperature_files[activeIdx]
        temperature_files[activeIdx].download()
            .then(() => {
                setTempData([...temperature_files]);
            });
    }, [is_loading_files, is_unavailable, activeIdx])
    
    let cache_id = `temperature-${activeIdx}`;
    let T;
    if (!is_loading_files && !is_unavailable && !is_downloading) {
        T = temperature_files[activeIdx].matrix;
    } 

    return (
        <div className="lake-condition-container">
            <div className="lake-condition-left-column">
                <div className="lake-condition-title"> Water Temperature </div>
                <div className="lake-condition-description">
                    Lake Tahoe water is cold for most swimmers, with surface temperatures ranging 
                    from 42 degrees in the winter to over 70 degrees in July and August. Though refreshing 
                    on a hot day, a plunge into Lake Tahoe can literally take your breath away. Swimmers 
                    should be prepared for dangerously cold conditions.
                </div>

                <Calendar 
                    events={temperature_files} 
                    active_event_idx={activeIdx}
                    on_event_selected={(idx) => setActiveIdx(idx)}
                    description={calendar_description}/>
            </div>

            <div className="lake-visual-container" id="temperature-visual-container">
            {
                (is_loading_files) ? <div className="loading-visual"> Loading </div> :
                (is_unavailable) ? <div className="loading-visual"> Temperature map is temporarily unavailable </div> :
                (is_downloading) ? <div className="loading-visual"> Downloading temperature data </div> :
                (failed_download) ? <div className="loading-visual"> Failed to download temperature data </div> :
                    [
                        <TemperatureMap key='temperature-map'
                            T={T} 
                            units={T_units}
                            color_palette={temperature_color_scale} 
                            cache_id={cache_id}/>,
                        <TemperatureLegend key='temperature-legend'
                            min={T_min} max={T_max} units={T_units}
                            color_palette={temperature_color}/>
                    ]
            }
            </div>

        </div>
    );
}

export default TemperaturePage;