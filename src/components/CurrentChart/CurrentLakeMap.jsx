import { scaleLinear } from "d3";
import { useRef, useEffect, useMemo } from "react";
import { Particle, VectorField } from "../particle";
import { dark_ocean, draw_lake_heatmap, ice_to_fire } from "../util";
import "./CurrentChart.css";


//////////////////////////////////
// Static Lake Map constants
//////////////////////////////////
const inner_padding = 0.01;
const num_particles = 3500;

function CurrentLakeMap(props) {
    ////////////////////////////////////
    // Component Constants
    ////////////////////////////////////
    let canvas_ref = useRef();
    
    const [n_rows, n_cols] = [props.u.length, props.u[0].length];
    const aspect_ratio = n_cols / n_rows;
    const chart_width = props.height * aspect_ratio;
    const chart_height = props.height;
    let chart_x_s = (props.width - chart_width) / 2;
    if (props.width === undefined)
        chart_x_s = 0;

    const [x_s, x_e] = [chart_x_s + chart_width * inner_padding, chart_x_s + chart_width * (1 - inner_padding)];
    const [y_s, y_e] = [chart_height * inner_padding, chart_height * (1 - inner_padding)];
    const square_size = (x_e - x_s) / n_cols;

    ////////////////////////////////
    // Particle Generator
    ////////////////////////////////
    const vector_field = useMemo(() => new VectorField(props.u, props.v, square_size), [props.u, props.v]);
    const particles = useMemo(() => {
        let res = [];
        for (let k = 0; k < num_particles; k++)
            res.push( Particle.newRandom(vector_field) );
        return res;
    }, [vector_field]);

    ////////////////////////////////////
    // Animation Loop
    ////////////////////////////////////
    useEffect(() => {
        const canvas = canvas_ref.current;
        const cx = canvas.getContext('2d');
        const lake_width = x_e - x_s;
        const lake_height = y_e - y_s;

        const speeds = [];
        for (let j = 0; j < n_rows; j++) {
            const row = [];
            for (let i = 0; i < n_cols; i++) {
                if (typeof props.u[j][i] !== 'number' || typeof props.v[j][i] !== 'number') {
                    row.push("nan");
                    continue;
                }
                let speed = (props.u[j][i]**2 + props.v[j][i]**2)**0.5;
                row.push(speed);
            }
            speeds.push(row);
        }
        const v_key = `current-map-${props.activeIdx}`;

        const interval = setInterval(() => {
            draw_lake_heatmap(cx, lake_width, lake_height, speeds, props.color_palette, x_s, y_s, v_key);

            particles.forEach((p) => p.draw(cx, x_s, y_s));
            particles.forEach((p) => p.move());
        }, 50);
        return () => clearInterval(interval);
      }, [particles, square_size, vector_field, x_s, y_s]);

    return (
        <canvas ref={canvas_ref} width={chart_width} height={chart_height}></canvas>
    );
}

export default CurrentLakeMap;