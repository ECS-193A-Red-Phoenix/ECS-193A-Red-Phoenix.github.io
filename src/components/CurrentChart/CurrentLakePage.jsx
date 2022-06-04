import { useState, useEffect } from 'react';
import { scaleLinear } from "d3";

import CurrentLakeMap from "./CurrentLakeMap";
import CurrentLegendBox from "./CurrentLegendBox";
import Calendar from '../Calendar/Calendar';
import "./CurrentChart.css";

import { dark_ocean, clamp, today } from "../../js/util";
import { S3 } from '../../js/s3_api';


////////////////////////////////////
// Static Constants
////////////////////////////////////
const legend_speeds = [0.1016, 0.2032, 0.3048, 0.508] // m/s

const speed_scale = scaleLinear().domain([0, 0.5]).range([0, 1]);
const color_palette = (speed) => dark_ocean(speed_scale(speed));

// Create legend
const legend_boxes = [];
for (let i = 0; i < legend_speeds.length; i++)
    legend_boxes.push(
        <CurrentLegendBox 
            key={`legend-box${i}`} 
            speed={legend_speeds[i]}
            color_palette={color_palette}
        />
    );

const calendar_description = "Select the date and time you want surface currents";

function CurrentLakePage() {
    const [flow_files, setFlowFiles] = useState(undefined);
    const [activeIdx, setActiveIdx] = useState(0);

    const is_loading_files = flow_files === undefined;
    const files_unavailable = !is_loading_files && flow_files === null;
    const files_exist = !is_loading_files && !files_unavailable && flow_files.length > 0;
    
    const is_downloading = files_exist && flow_files[activeIdx].matrix === undefined;
    const download_failed = files_exist && flow_files[activeIdx].matrix === null;

    ////////////////////////////////////
    // Load flow binary files
    ////////////////////////////////////
    useEffect(() => {
        let is_mounted = true;
        const after_date = today(3);
        S3.get_files("flow", after_date)
            .then((files) => {
                files.sort((f1, f2) => f2.time - f1.time);
                if (is_mounted)
                    setFlowFiles(files);
            })
            .catch((err) => {
                console.log(err);
                setFlowFiles(null);
            });
        return () => { is_mounted = false; };
    }, []);

    useEffect(() => {
        if (is_loading_files || files_unavailable || !files_exist)
            return;

        // Download 10 at a time
        for (let i = 0; i < 10; i++) {
            let index = clamp(activeIdx - 5 + i, 0, flow_files.length - 1);
            if (flow_files[index].is_downloaded()) continue;

            // download() mutates flow_files[activeIdx]
            flow_files[index].download()
                .then(() => {
                    setFlowFiles((oldFlowFiles) => [...oldFlowFiles]);
                });
        }
    }, [is_loading_files, files_unavailable, activeIdx])
    
    let cache_id = `current-map-${activeIdx}`;
    let u, v;
    if (!is_loading_files && !files_unavailable && files_exist &&
        !is_downloading && !download_failed) {
        [u, v] = flow_files[activeIdx].matrix;
    }

    return (
        <div className="lake-condition-container">
            <div className="lake-condition-left-column">
                <div className="lake-condition-description-container">
                    <div className="lake-condition-title"> Water Currents </div>
                    <div className="lake-condition-description">
                    Water currents in Lake Tahoe are the result of winds, the Earth's rotation, and the shape of the lake basin. As wind blows over the surface of the lake, flow patterns develop. These can take the form of circular currents (or gyres) or of narrow jets of water (or rip currents). After severe wind events, strong rip currents, often flowing north to south, can be present near the shoreline and up to several miles from shore. These currents can last for several days, posing potentially  hazardous conditions for recreational activities such as paddleboarding.
                    </div>

                </div>
                
                <Calendar events={flow_files} 
                    active_event_idx={activeIdx}
                    on_event_selected={(idx) => setActiveIdx(idx)}
                    description={calendar_description}/>
            </div>

            <div className="lake-visual-container" id="current-visual-container">
                {
                    (is_loading_files) ? <div className="loading-visual"> Loading </div> :
                    (files_unavailable) ? <div className="loading-visual"> Water currents are temporarily unavailable </div> :
                    (!files_exist) ? <div className="loading-visual"> Zero water current visualizations are available </div> :
                    (is_downloading) ? <div className="loading-visual"> Downloading flow data </div> :
                    (download_failed) ? <div className="loading-visual"> Failed to download flow data </div> :
                        [
                            <CurrentLakeMap key='current-lake-map'
                                u={u} 
                                v={v}
                                color_palette={color_palette}
                                cache_id={cache_id}/>,
                            <div key='current-lake-legend' 
                                className="current-legend-container">
                                { legend_boxes }
                            </div>
                        ]
                }
            </div>

        </div>
    );
}

export default CurrentLakePage;