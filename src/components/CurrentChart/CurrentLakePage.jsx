import { useState, useEffect } from 'react';
import { scaleLinear } from "d3";

import CurrentLakeMap from "./CurrentLakeMap";
import CurrentLegendBox from "./CurrentLegendBox";
import Calendar from '../Calendar/Calendar';
import "./CurrentChart.css";

import { reversed, parseMyDate, dark_ocean } from "../util";
import { loadNumpyFile } from '../numpy_parser';


////////////////////////////////////
// Static Constants
////////////////////////////////////
const legend_speeds = [0.1016, 0.2032, 0.3048, 0.508] // m/s
const lake_height = 700;
const FRAME_DURATION = 2;

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

const flow_files = ['2022-02-14 18.npy', '2022-02-14 20.npy', '2022-02-14 22.npy', '2022-02-15 00.npy', '2022-02-15 02.npy', '2022-02-15 04.npy', '2022-02-15 06.npy', '2022-02-15 08.npy', '2022-02-15 10.npy', '2022-02-15 12.npy', '2022-02-15 14.npy', '2022-02-15 16.npy', '2022-02-15 18.npy', '2022-02-15 20.npy', '2022-02-15 22.npy', '2022-02-16 00.npy', '2022-02-16 02.npy', '2022-02-16 04.npy', '2022-02-16 06.npy', '2022-02-16 08.npy', '2022-02-16 10.npy', '2022-02-16 12.npy', '2022-02-16 14.npy', '2022-02-16 16.npy'];
const FLOW_DIR = "static/flow/";

function CurrentLakePage() {
    const [activeIdx, setActiveIdx] = useState(0);

    const [flow_data, setFlowData] = useState([]);
    const is_loading = flow_data.length === 0;

    ////////////////////////////////////
    // Load Flow binary files
    ////////////////////////////////////
    useEffect(() => {
        const file_promises = [];
        for (let file of flow_files) {
            const file_path = FLOW_DIR + file;
            const date = parseMyDate(file.substring(0, 13));
            
            file_promises.push(new Promise((resolve) => {
                loadNumpyFile(file_path).then(
                    (uv_matrix) => resolve({ 'time': date, 'matrices': uv_matrix })
                );
            }));
        }

        Promise.all(file_promises).then((result) => {
            console.log(result[0])
            setFlowData(result);
        });
    }, []);

    const flow_events = flow_data.map(
        (obj) => { return { time: obj['time'], duration: FRAME_DURATION }; }
    );
    
    let u, v;
    if (!is_loading) {
        [u, v] = flow_data[activeIdx]['matrices'];
        u = reversed(u);
        v = reversed(v);
    }

    return (
        <div className="lake-condition-container">
            <div className="lake-condition-left-column">
                <div className="lake-condition-description-container">
                    <div className="lake-condition-title"> Water Flow </div>
                    <div className="lake-condition-description">
                        Water flow is the movement of water in and around Lake Tahoe. Water currents in Lake Tahoe 
                        are primarily caused by wind, Earth's rotation, and gravity. As wind flows over the flat surface of Lake
                        Tahoe, particles of air drag water along the surface, creating currents of water. Moreover, the force
                        of gravity combined with Earth's rotation creates tidal forces that propel the movement of water.
                        Lastly, the flow of water in and out of Lake Tahoe's rivers create additional hydraulic forces that
                        move water forward.
                    </div>

                </div>
                {
                    !is_loading &&
                    <Calendar events={flow_events} 
                        active_event_idx={activeIdx}
                        on_event_selected={(idx) => setActiveIdx(idx)}/>
                }
            </div>

            {
                is_loading && <div> Loading </div>
            }

            {
                !is_loading &&
                <div className="lake-visual-container">
                    <CurrentLakeMap 
                        height={lake_height} 
                        u={u} 
                        v={v} 
                        activeIdx={activeIdx}
                        color_palette={color_palette}
                        />

                    <div className="current-legend-container">
                        { legend_boxes }
                    </div>
                </div>
            }

        </div>
    );
}

export default CurrentLakePage;