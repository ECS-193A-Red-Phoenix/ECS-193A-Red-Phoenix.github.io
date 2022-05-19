import { useState, useEffect } from "react";
import { scaleLinear } from "d3";

import TemperatureMap from "./TemperatureMap";
import TemperatureLegend from "./TemperatureLegend";
import Calendar from "../Calendar/Calendar";
import "../../css/LakeConditions.css";
import "./TemperatureChart.css";

import { ice_to_fire, clamp, today } from "../../js/util";
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

const calendar_description = "Select the date and time you want surface water temperature";

function TemperaturePage() {
    const [temperature_files, setTempFiles] = useState(undefined);
    const [activeIdx, setActiveIdx] = useState(0);

    const is_loading_files = temperature_files === undefined;
    const files_unavailable = !is_loading_files && temperature_files === null;
    const files_exist = !is_loading_files && !files_unavailable && temperature_files.length > 0;

    const is_downloading = files_exist && temperature_files[activeIdx].matrix === undefined;
    const failed_download = files_exist && temperature_files[activeIdx].matrix === null;

    ////////////////////////////////////
    // Load temperature binary files
    ////////////////////////////////////
    useEffect(() => {
        const after_date = today(3);
        S3.get_files("temperature", after_date)
            .then((files) => {
                files.sort((f1, f2) => f2.time - f1.time);
                setTempFiles(files);
            })
            .catch((err) => {
                console.log(err);
                setTempFiles(null);
            });
    }, []);

    useEffect(() => {
        if (is_loading_files || files_unavailable || !files_exist)
            return;
        
        // Download 10 at a time
        for (let i = 0; i < 10; i++) {
            let index = clamp(activeIdx - 5 + i, 0, temperature_files.length - 1);
            if (temperature_files[index].is_downloaded()) continue;

            // download() mutates temperature_files[activeIdx]
            temperature_files[index].download()
                .then(() => {
                    setTempFiles([...temperature_files]);
                });
        }
    }, [is_loading_files, files_unavailable, activeIdx])
    
    let cache_id = `temperature-${activeIdx}`;
    let T;
    if (!is_loading_files && !files_unavailable && files_exist &&
        !is_downloading && !failed_download) {
        T = temperature_files[activeIdx].matrix;
    } 

    return (
        <div className="lake-condition-container">
            <div className="lake-condition-left-column">
                <div className="lake-condition-title"> Water Temperature </div>
                <div className="lake-condition-description">
                    Lake Tahoe surface water temperatures are cold for most swimmers, and vary throughout the year from 42 °F in the winter to over 70 °F during the summer. Though refreshing on a hot day, a plunge into Lake Tahoe can literally take your breath away. Swimmers should be prepared for dangerously cold conditions. Although generally uniform, surface water temperatures may exhibit large drops in temperature (up to 20 °F) over parts of the lake after strong and persistent winds and remain cold for several days.
                </div>

                <Calendar 
                    events={temperature_files} 
                    active_event_idx={activeIdx}
                    on_event_selected={(idx) => setActiveIdx(idx)}
                    description={calendar_description}/>
            </div>

            <div className="heatmap-container lake-visual-container">
            {
                (is_loading_files) ? <div className="loading-visual"> Loading </div> :
                (files_unavailable) ? <div className="loading-visual"> Temperature map is temporarily unavailable </div> :
                (!files_exist) ? <div className="loading-visual"> Zero temperature visualizations are available </div> :
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