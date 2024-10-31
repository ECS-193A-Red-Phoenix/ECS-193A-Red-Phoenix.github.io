import { useEffect } from "react";
import { useRef } from "react";
import { scaleLinear, pointer, select } from "d3";

import { militaryHourTo12Hour, range, draw_heatmap, ice_to_fire_discrete, interpolate, round, unzip } from "../../js/util";
import "./RealTimeConditions.css";
import TemperatureLegend from "../TemperatureChart/TemperatureLegend";
import Axis from "./Axis";


const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
function format_date(date) {
    date = new Date(date);
    let day = DAYS[date.getDay()];
    let hours = String(militaryHourTo12Hour(date.getHours())).padStart(2, 0);
    let am_pm = (date.getHours() >= 12) ? "PM" : "AM";

    return `${day} ${hours} ${am_pm}`;
}

function getDays(start_date, end_date) {
    // Returns the days between start date and end date
    const ONE_DAY = 24 * 60 * 60 * 1000;
    let start = new Date(start_date.getTime());
    start.setHours(0);
    start.setMinutes(0);
    start.setSeconds(0);
    start.setMilliseconds(0);
    if (start < start_date)
        start = new Date(start.getTime() + ONE_DAY);
    let res = [];
    for (let t = start.getTime(); t < end_date.getTime(); t += ONE_DAY)
        res.push(new Date(t));
    return res;
}

function TCPlot(props) {
    ////////////////////////////////
    // Expected props
    // time: a list of Date objects of each ctd profile
    // ctd_profiles: a list of list of tuples [depth, temperature] for each time
    // cache_id (optional): a unique identifier for this plot, provides performance boost
    // min_depth (optional): the minimum depth of the plot, if not specified, dynamically determined
    // max_depth (optional): the maximum depth of the plot, if not specified, dynamically determined
    // min_T (optional): the minimum temperature of the plot, if not specified, dynamically determined
    // max_T (optional): the maximum temperature of the plot, if not specified, dynamically determined
    // title (optional): a title for the plot
    let { time, ctd_profiles, cache_id, min_depth, max_depth, min_T, max_T, title } = props;
    const container_ref = useRef();

    const data_available = Array.isArray(time) && time.length > 0 && !!ctd_profiles;

    let n_rows, n_cols, heatmap_data, temperature_color_scale;
    const elements = [];
    if (data_available) {
        max_depth = max_depth ?? Math.ceil(Math.max(...ctd_profiles.flat().map((t) => t[0])));
        min_depth = min_depth ?? Math.floor(Math.min(...ctd_profiles.flat().map((t) => t[0])));
        let depth_interpolate = range(min_depth, max_depth, 1);

        // Create uniform grid by interpolating ctd data,
        // Assuming spacing of time is constant
        n_rows = depth_interpolate.length;
        n_cols = time.length;

        // Create empty 2D array
        heatmap_data = [];
        for (let j = 0; j < n_rows; j++) {
            let row = [];
            for (let i = 0; i < n_cols; i++)
                row.push([]);
            heatmap_data.push(row);
        }

        // Interpolate CTD Profiles into uniform spacing
        for (let [idx, ctd_profile] of ctd_profiles.entries()) {
            let [depth, temperature] = unzip(ctd_profile);
            
            let interpolated = interpolate(depth_interpolate, depth, temperature);
            // Place interpolated temperature as a column into heatmap data
            for (let j = 0; j < n_rows; j++)
                heatmap_data[j][idx] = interpolated[j];
        }

        // Create temperature bar
        const units_T = "° F";
        max_T = max_T ?? Math.ceil (Math.max(...ctd_profiles.flat().map((t) => t[1])));
        min_T = min_T ?? Math.floor(Math.min(...ctd_profiles.flat().map((t) => t[1])));
        let temperature_scale = scaleLinear().domain([min_T, max_T]).range([0, 1]);
        temperature_color_scale = (temperature) => ice_to_fire_discrete(temperature_scale(temperature));

        elements.push(
            <TemperatureLegend
                key="temperature-legend"
                min={min_T}
                max={max_T}
                units={units_T}
                color_palette={ice_to_fire_discrete}
                num_ticks={6}
                />
        );

        // Create axes
        const x_ticks = getDays(time[0], time[time.length - 1]).map((t) => t.getTime());
        elements.push(
            <Axis 
                min_value={time[0].getTime()}
                max_value={time[time.length - 1].getTime()}
                key="tc-x-axis"
                direction="h"
                format_value={format_date}
                ticks={x_ticks}
                title=""
                />,
            <Axis 
                min_value={min_depth}
                max_value={max_depth}
                key="tc-y-axis"
                direction="v"
                ticks={6}
                title="Depth (m)"
                />
        )
    }

    ////////////////////////////////////////////////////
    // Draw Heatmap
    ////////////////////////////////////////////////////
    useEffect(() => {
        if (!data_available) return;
        // Select canvas
        const container = container_ref.current;
        const canvas = container.querySelector("canvas");
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        const aspect_ratio = heatmap_data[0].length / heatmap_data.length; 
        canvas.width = canvas.height * aspect_ratio;

        draw_heatmap(canvas, heatmap_data, temperature_color_scale, cache_id);
    }, [time, ctd_profiles, cache_id]);

    ////////////////////////////////////////////////////
    // Cursor Hover event
    ////////////////////////////////////////////////////
    useEffect(() => {
        if (!data_available) return;
        // Select cursor element
        const container = container_ref.current;
        const canvas = container.querySelector("canvas");
        const cursor = select(container.querySelector(".tc-cursor"));

        function turnOffCursor() {
            cursor.style("display", "none");
        }

        select(canvas).on("mousemove", function (event) {
            const [x, y] = pointer(event);
            const { width, height } = canvas.getBoundingClientRect();
            const [i, j] = [Math.floor(x / width * n_cols), Math.floor(y / height * n_rows)];
            if (i < 0 || i >= n_cols || j < 0 || j >= n_rows) {
                turnOffCursor();
                return;
            }
            const temp = round(heatmap_data[j][i], 1);
            const [px, py] = [x / width * 100, y / height * 100];
            cursor.style("display", "block")
                .style("left", `${px}%`)
                .style("top", `${py}%`)
                .text(`${temp} °F`);
        });

        select(canvas).on("mouseleave", turnOffCursor);
    }, [time, ctd_profiles]);

    return (
        <div ref={container_ref} className="tc-plot-container">
            <div className="tc-plot-title"> {title} </div>


            { !data_available && time === undefined && <div> Loading Temperature Chain Data </div> }
            { !data_available && Array.isArray(time) && <div> Temperature Chain Data Unavailable </div> }

            <canvas></canvas>
            
            { elements }

            <div className="tc-cursor"> Cursor </div>
        </div>
    )
}

export default TCPlot;