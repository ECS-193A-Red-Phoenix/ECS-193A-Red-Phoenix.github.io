import { useEffect, useMemo, useRef } from "react";
import { Particle, VectorField } from "../particle";

//////////////////////////////////////////////
// Static constants
//////////////////////////////////////////////
const num_particles = 60;
const M_TO_FT = 196.85;
const scale = 1.5;
const aspect_ratio = 0.35;

function CurrentLegendBox(props) {
    ////////////////////////////////////
    // Component Constants
    ////////////////////////////////////
    const canvas_ref = useRef();
    let width = props.width;
    if (width === undefined) 
        width = 68 * scale;
    let height = props.height;
    if (height === undefined)
        height = width * aspect_ratio;
    
    ////////////////////////////////////
    // Particle generator
    ////////////////////////////////////
    const vector_field = useMemo(() => new VectorField([[props.speed]], [[0]]), [props.speed]);
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

        const interval = setInterval(() => {
            vector_field.drawWetCells(cx, 0, 0, width, height);
            
            particles.forEach((p) => p.draw(cx, 0, 0, width, height));
            particles.forEach((p) => p.move());
        }, 50);
        return () => clearInterval(interval);
    }, [particles, vector_field, width, height]);
    
    let ft_per_min = props.speed * M_TO_FT; // convert m/s to ft/min
    ft_per_min = Math.round(ft_per_min * 10) / 10;
    return (
        <div className="current-legend-box-container">
            <canvas ref={canvas_ref} width={width} height={height}></canvas>
            <div className="current-legend-box-units"> {ft_per_min} feet per minute </div>
        </div>
    );
}

export default CurrentLegendBox;