import { useEffect } from "react";
import { useRef } from "react";
import { round } from "../../js/util";

import "./RealTimeConditions.css";

function Axis(props) {
    ///////////////////////////////////////////////////
    // Expected props
    // min_value: a Number, the minimum value of the axis
    // max_value: a Number, the maximum value of the axis
    // direction (optional): a String, "h" or "v", default="h"
    // ticks (optional): One of two options:
    //      1. an Array of x-values, of where to display the ticks. 
    //      2. an Integer, how many ticks to display (uniformly spaced), default=3
    // format_value (optional): a function that takes a value and formats it to a String
    // title (optional): a String, a title for the axis
    let { min_value, max_value, direction, ticks, format_value, title } = props;
    direction = direction ?? "h";
    format_value = format_value ?? ((x) => x);
    
    ticks = ticks ?? 3;
    if (typeof ticks === 'number') {
        let num_ticks = ticks;
        ticks = [];
        for (let i = 0; i < num_ticks; i++) {
            let percent = i / (num_ticks - 1)
            let x = min_value + (max_value - min_value) * percent;
            ticks.push(x)
        }
    }

    let axis_class;
    switch (direction) {
        case "h": axis_class = "axis-horizontal"; break;
        case "v": axis_class = "axis-vertical"; break;
        default: throw new Error(`Unexpected direction '${direction}'`)
    }

    let labels = ticks.map((x_value) => {
        let percent = (x_value - min_value) / (max_value - min_value) * 100;
        let side = (direction === "h") ? "left" : "top";
        let style = {};
        style[side] = `${percent}%`;
            
        x_value = round(x_value, 0);
        return (
            <div 
                key={`tick-${x_value}`}
                style={style}
                className={`${axis_class}-label`}>
                { format_value(x_value) }
            </div>
        );
    })

    // Draw Axis in canvas
    let canvas_ref = useRef();
    useEffect(() => {
        let canvas = canvas_ref.current;
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        let w = canvas.width - 2;
        let h = canvas.height - 2;
        let ctx = canvas.getContext("2d");
        ctx.translate(0.5, 0.5);

        // Draw major axis
        let [x_s, y_s] = (direction === "h") ? [0, h / 2] : [w / 2, 0];
        let [x_e, y_e] = (direction === "h") ? [w, h / 2] : [w / 2, h];
        ctx.beginPath();
        ctx.moveTo(x_s, y_s);
        ctx.lineTo(x_e, y_e);
        ctx.stroke();

        // Draw ticks
        ticks.forEach((x_value) => {
            let percent = (x_value - min_value) / (max_value - min_value);
            let [x_s, y_s] = (direction === "h") ? [percent * w, h / 2] : [w / 2, percent * h];
            let [x_e, y_e] = (direction === "h") ? [percent * w, 0    ] : [w    , percent * h];

            ctx.beginPath();
            ctx.moveTo(x_s, y_s);
            ctx.lineTo(x_e, y_e);
            ctx.stroke();
        });
    }, [ticks]);

    return (
        <div 
            className={`axis ${axis_class}`}
            >
            { labels }

            <canvas ref={canvas_ref}></canvas>

            <div className={`${axis_class}-title`}> {title} </div>
        </div>
    )
}

export default Axis;