import { useEffect, useRef } from "react";
import { Particle, VectorField } from "./particle";

//////////////////////////////////////////////
// Static constants
//////////////////////////////////////////////
const num_particles = 100;
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
    const particles = [];
    const vector_field = new VectorField([[props.speed]], [[0]]);
    for (let k = 0; k < num_particles; k++) {
        particles.push( Particle.newRandom(vector_field) );
    }
    
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
    }, []);
    
    let ft_per_min = props.speed * M_TO_FT; // convert m/s to ft/min
    ft_per_min = Math.round(ft_per_min * 10) / 10;
    return (
        <div className="current-legend-box-container">
            <div className="current-legend-box-units"> {ft_per_min} feet per minute </div>
            <canvas ref={canvas_ref} width={width} height={height}></canvas>
        </div>
    );
}

export default CurrentLegendBox;