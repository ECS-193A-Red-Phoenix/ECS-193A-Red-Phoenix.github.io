import { scaleLinear } from "d3";
import "./CurrentChart.css";

//////////////////////////////////
// Utility
//////////////////////////////////
function reversed(arr) {
    let res = [];
    for (let j = arr.length - 1; j > -1; j--)
        res.push(arr[j]);
    return res;
}

function round(x, decimals) {
    if (decimals === undefined)
        decimals = 0;
    return Math.floor(x * 10**decimals) / 10**decimals;
}


////////////////////////////////////
// Static Constants
////////////////////////////////////
const num_legend_boxes = 5;
const lake_height = 700;



function TemperaturePage() {

    return (
        <div className="current-chart-container">
            <div className="current-chart-left-column">
                <div className="current-chart-description-container">
                    <div className="current-chart-title"> Water Temperature </div>
                    <div className="current-chart-description">
                        Water flow is the movement of water in and around Lake Tahoe. Water currents in Lake Tahoe 
                        are primarily caused by wind, Earth's rotation, and gravity. As wind flows over the flat surface of Lake
                        Tahoe, particles of air drag water along the surface, creating currents of water. Moreover, the force
                        of gravity combined with Earth's rotation creates tidal forces that propel the movement of water.
                        Lastly, the flow of water in and out of Lake Tahoe's rivers create additional hydraulic forces that
                        move water forward.
                    </div>

                    <div className="current-chart-info">
                        <div className="current-chart-date"> Monday 8:00 AM, February 28, 2022 </div>
                        <div className="current-chart-speed"> Average Temperature:  </div>
                        <div className="current-chart-controls">
                            <div className="current-chart-control-button"> Move 2 hours backward </div>
                            <div className="current-chart-control-button"> Move 2 hours forward </div>
                        </div>
                    </div>
                </div>


            </div>

            <div className="current-legend-container">
                <img src="map.PNG"></img>
            </div>
        </div>
    );
}

export default TemperaturePage;