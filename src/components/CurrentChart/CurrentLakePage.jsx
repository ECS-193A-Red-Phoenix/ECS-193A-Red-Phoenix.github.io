import CurrentLakeMap from "./CurrentLakeMap";
import CurrentLegendBox from "./CurrentLegendBox";
import { scaleLinear } from "d3";
import "./CurrentChart.css";
import { round, reversed } from "../util";


function average_speed(u, v) {
    let total = 0;
    let count = 0;
    for (let j = 0; j < u.length; j++) {
        for (let i = 0; i < u[0].length; i++) {
            if (typeof u[j][i] === 'number' && typeof v[j][i] === 'number') {
                total += (u[j][i]**2 + v[j][i]**2)**0.5;
                count += 1;
            }
        }
    }
    return total / count;
}


////////////////////////////////////
// Static Constants
////////////////////////////////////
const num_legend_boxes = 5;
const legend_speed = scaleLinear().domain([0, num_legend_boxes - 1]).range([0.01, 0.1016]); // mps
const lake_height = 700;
const M_TO_FT = 196.85;

let [u, v] = require('./slice.json'); 
u = reversed(u);
v = reversed(v);
let average_lake_speed = average_speed(u, v) * M_TO_FT;
average_lake_speed = round(average_lake_speed, 1);

// Create legend
const legend_boxes = [];
for (let i = 0; i < num_legend_boxes; i++)
    legend_boxes.push(
        <CurrentLegendBox key={`legend-box${i}`} speed={legend_speed(i)}/>
    );


function CurrentLakePage() {

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

                    <div className="lake-condition-info">
                        <div className="lake-condition-date"> Monday 8:00 AM, February 28, 2022 </div>
                        <div className="lake-condition-speed"> Average Speed: {average_lake_speed} feet per minute </div>
                    </div>
                </div>


                <div className="current-legend-container">
                    { legend_boxes }
                </div>
            </div>

            <CurrentLakeMap height={lake_height} u={u} v={v}/>

        </div>
    );
}

export default CurrentLakePage;