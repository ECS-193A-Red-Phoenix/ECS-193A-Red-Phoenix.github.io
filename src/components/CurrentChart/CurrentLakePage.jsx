import { useState } from 'react';
import CurrentLakeMap from "./CurrentLakeMap";
import CurrentLegendBox from "./CurrentLegendBox";
import Calendar from '../Calendar/Calendar';
import { scaleLinear } from "d3";
import "./CurrentChart.css";
import { reversed, parseMyDate } from "../util";


////////////////////////////////////
// Static Constants
////////////////////////////////////
const num_legend_boxes = 5;
const legend_speed = scaleLinear().domain([0, num_legend_boxes - 1]).range([0.01, 0.1016]); // mps
const lake_height = 700;
const FRAME_DURATION = 2;

// Create legend
const legend_boxes = [];
for (let i = 0; i < num_legend_boxes; i++)
    legend_boxes.push(
        <CurrentLegendBox key={`legend-box${i}`} speed={legend_speed(i)}/>
    );

const flow_data = require('./flow.json');
flow_data.forEach((obj) => obj['time'] = parseMyDate(obj['time']));
flow_data.sort((o1, o2) => o1['time'] - o2['time']);

function CurrentLakePage() {
    const [activeIdx, setActiveIdx] = useState(0);

    const flow_events = flow_data.map(
        (obj) => { return { time: obj['time'], duration: FRAME_DURATION }; }
    );

    let [u, v] = flow_data[activeIdx]['matrices'];
    u = reversed(u);
    v = reversed(v);

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

                    <Calendar events={flow_events} 
                        active_event_idx={activeIdx}
                        on_event_selected={(idx) => setActiveIdx(idx)}/>
                </div>
            </div>

            <div className="lake-visual-container">
                <CurrentLakeMap height={lake_height} u={u} v={v}/>
                <div className="current-legend-container">
                    { legend_boxes }
                </div>
            </div>

        </div>
    );
}

export default CurrentLakePage;