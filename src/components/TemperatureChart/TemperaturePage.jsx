import "./TemperatureChart.css";
import TemperatureMap from "./TemperatureMap";
import { scaleLinear } from "d3";
import TemperatureLegend from "./TemperatureLegend";
import { colorFromHex, colorScale, reversed, round } from "../util";


function average_temperature(grid) {
    let total = 0;
    let count = 0;
    for (let j = 0; j < grid.length; j++)
        for (let i = 0; i < grid[0].length; i++) {
            if (typeof grid[j][i] === 'number') {
                total += grid[j][i];
                count += 1;
            }
        }
    return total / count;
}

////////////////////////////////////
// Static Constants
////////////////////////////////////

const DARKBLUE  = colorFromHex("#00008b");
const BLUE      = colorFromHex("#0f52ba");
const LIGHTBLUE = colorFromHex("#ace5ee");
const GREEN     = colorFromHex("#7fff00");
const YELLOW    = colorFromHex("#ffef00");
const RED       = colorFromHex("#d0312d");
const DARKRED   = colorFromHex("#710c04");

const temperature_color = colorScale(
    DARKBLUE, BLUE, LIGHTBLUE, GREEN, YELLOW, RED, DARKRED
);


let [T] = require('./slice.json');
T = reversed(T);
const lake_height = 700;
const [n_rows, n_cols] = [T.length, T[0].length];

let min_T = Number.MAX_VALUE;
let max_T = -Number.MAX_VALUE;
for (let j = 0; j < n_rows; j++) {
    for (let i = 0; i < n_cols; i++) {
        if (typeof T[j][i] === 'number') {
            min_T = Math.min(min_T, T[j][i]);
            max_T = Math.max(max_T, T[j][i]);
        }
    }
}
let temperature_scale = scaleLinear().domain([min_T, max_T]).range([0, 1])
let temperature_color_scale = (temperature) => temperature_color(temperature_scale(temperature));
let avg_temp = round(average_temperature(T), 1);

function TemperaturePage() {

    return (
        <div className="current-chart-container">
            <div className="current-chart-left-column">
                <div className="current-chart-description-container">
                    <div className="current-chart-title"> Water Temperature </div>
                    <div className="current-chart-description">
                        Lake Tahoe water is cold for most swimmers, with surface temperatures ranging 
                        from 42 degrees in the winter to over 70 degrees in July and August. Though refreshing 
                        on a hot day, a plunge into Lake Tahoe can literally take your breath away. Swimmers 
                        should be prepared for dangerously cold conditions.
                    </div>

                    <div className="current-chart-info">
                        <div className="current-chart-date"> Monday 8:00 AM, February 28, 2022 </div>
                        <div className="current-chart-speed"> Average Temperature: {avg_temp} °F </div>
                        <div className="current-chart-controls">
                            <div className="current-chart-control-button"> Move 2 hours backward </div>
                            <div className="current-chart-control-button"> Move 2 hours forward </div>
                        </div>
                    </div>
                </div>


            </div>

            <TemperatureMap height={lake_height} T={T} color_palette={temperature_color_scale}/>
            <TemperatureLegend height={lake_height} min_T={min_T} max_T={max_T} color_palette={temperature_color}/>

        </div>
    );
}

export default TemperaturePage;