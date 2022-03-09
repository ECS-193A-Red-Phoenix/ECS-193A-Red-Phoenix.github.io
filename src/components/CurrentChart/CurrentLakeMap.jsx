import { useRef, useEffect, useMemo } from "react";
import { Particle, VectorField } from "../particle";
import { draw_lake_tahoe } from "../util";
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
    const y_s = props.height * inner_padding;
    const square_size = (x_e - x_s) / n_cols;

    ////////////////////////////////
    // Particle Generator
    ////////////////////////////////
    const vector_field = useMemo(() => new VectorField(props.u, props.v), [props.u, props.v]);
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

        const black = 50;
        cx.fillStyle = `rgba(${black}, ${black}, ${black}, 1)`;
        const interval = setInterval(() => {
            draw_lake_tahoe(cx, x_s, y_s, chart_width, chart_height);

            particles.forEach((p) => p.draw(cx, x_s, y_s, square_size));
            particles.forEach((p) => p.move());
        }, 50);
        return () => clearInterval(interval);
      }, [particles, square_size, vector_field, x_s, y_s]);

    return (
        <canvas ref={canvas_ref} width={chart_width} height={chart_height}></canvas>
    );
}

export default CurrentLakeMap;