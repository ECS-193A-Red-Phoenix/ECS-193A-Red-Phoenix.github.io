import { select, pointer } from "d3";
import { useRef, useEffect, useState } from "react";
import { Particle, VectorField } from "../../js/particle";
import { draw_lake_heatmap, round } from "../../js/util";
import "./CurrentChart.css";


//////////////////////////////////
// Static Lake Map constants
//////////////////////////////////
const num_particles = 3500;
const MS_TO_FTM = 196.85;

const speeds_cache = {};
function compute_speeds(u, v, cache_id) {
    // Computes the magnitude of each cell in the vector field
    // Uses a cache for a significant speed up, so its only computed once for a given field
    // Arguments:
    //  u: u-component of the vector field
    //  v: v-component of the vector field
    //  cache_id (optional): a key to cache the results of the computation
    if (cache_id in speeds_cache)
        return speeds_cache[cache_id];

    const [n_rows, n_cols] = [u.length, u[0].length];
    const speeds = [];
    for (let j = 0; j < n_rows; j++) {
        const row = [];
        for (let i = 0; i < n_cols; i++) {
            if (typeof u[j][i] !== 'number' || typeof v[j][i] !== 'number') {
                row.push("nan");
                continue;
            }
            const speed = (u[j][i]**2 + v[j][i]**2)**0.5;
            row.push(speed);
        }
        speeds.push(row);
    }

    if (cache_id !== undefined)
        speeds_cache[cache_id] = speeds;
    return speeds;
}


function CurrentLakeMap(props) {
    ////////////////////////////////////
    // Component Constants
    ////////////////////////////////////
    const [particles, setParticles] = useState(undefined);
    const canvas_ref = useRef();

    const {u, v, color_palette, cache_id} = props;
    const [n_rows, n_cols] = [u.length, u[0].length];
    const aspect_ratio = n_cols / n_rows;

    const speeds = compute_speeds(u, v, cache_id);

    useEffect(() => {
        const canvas = canvas_ref.current;
        const cx = canvas.getContext('2d');
        // Resize canvas
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.width / aspect_ratio;

        const chart_width = canvas.width;
        const chart_height = canvas.height;

        ////////////////////////////////////
        // Cursor Hover Event
        ////////////////////////////////////
        select(canvas_ref.current).on("mousemove", function (event) {
            const [x, y] = pointer(event);
            const [i, j] = [Math.floor(x / chart_width * n_cols), Math.floor(y / chart_height * n_rows)];
            if (i < 0 || i >= n_cols || j < 0 || j >= n_rows || isNaN(speeds[j][i])) {
                select(".current-chart-cursor")
                    .style("display", "none");
                return;
            }        
            
            const [px, py] = [x / chart_width * 100, y / chart_height * 100];
            const speed = round(speeds[j][i] * MS_TO_FTM);
            select(".current-chart-cursor")
                .style("display", "block")
                .style("left", `${px}%`)
                .style("top", `${py}%`)
                .text(`${speed} ft/min`);
        });
        select(canvas_ref.current).on("mouseleave", () => {
            select(".current-chart-cursor")
                .style("display", "none");
        });

        ////////////////////////////////
        // Particle Generator
        ////////////////////////////////
        const square_size = (chart_width) / n_cols;

        const vector_field = new VectorField(u, v, square_size);
        if (particles === undefined) {
            const new_particles = [];
            for (let k = 0; k < num_particles; k++)
                new_particles.push( Particle.newRandom(vector_field) );
            setParticles(new_particles);
        }

        ////////////////////////////////////
        // Animation Loop
        ////////////////////////////////////
        draw_lake_heatmap(canvas, speeds, color_palette, cache_id);
        if (particles !== undefined) {
            particles.forEach((p) => p.draw(cx));
            particles.forEach((p) => p.move(vector_field));
        }
        const interval = setInterval(() => {
            draw_lake_heatmap(canvas, speeds, color_palette, cache_id);
            particles.forEach((p) => p.draw(cx));
            particles.forEach((p) => p.move(vector_field));
        }, 50);
        return () => clearInterval(interval);
      }, [u, v, color_palette, particles]);

    return (
        <div className="current-chart-canvas-container">
            <canvas ref={canvas_ref}></canvas>
            <div className="current-chart-cursor"> Cursor </div>
        </div>
    );
}

export default CurrentLakeMap;