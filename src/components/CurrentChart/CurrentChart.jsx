import { selectAll } from "d3";
import { useRef, useEffect } from "react";
import "./CurrentChart.css";


//////////////////////////////////
// Chart constants
//////////////////////////////////
const inner_padding = 0.01;

//////////////////////////////////
// Utility
//////////////////////////////////
function reversed(arr) {
    let res = [];
    for (let j = arr.length - 1; j > -1; j--)
        res.push(arr[j]);
    return res;
}

//////////////////////////////////
// Vector Field
//////////////////////////////////
let [u, v] = require('./slice.json'); 
u = reversed(u);
v = reversed(v);
const [n_rows, n_cols] = [u.length, u[0].length];
const aspect_ratio = n_cols / n_rows;

const wet_cells = [];
for (let j = 0; j < n_rows; j++) {
    for (let i = 0; i < n_cols; i++) {
        if (!(typeof u[j][i] === 'number' && typeof v[j][i] === 'number'))
            continue;
        wet_cells.push([i, j]);
    }
}

function drawWetCells(cx, wet_cells, x_s, y_s, square_size) {
    for (let k = 0; k < wet_cells.length; k++) {
        let [i, j] = wet_cells[k];
        let x = x_s + i * square_size;
        let y = y_s + j * square_size;
        cx.fillRect(x, y, square_size + 1, square_size + 1);
    }
}

class Particle {
    constructor(x, y, age) {
        this.xy_history = [[x, y]];
        this.age = age;
    }

    static newRandom() {
        const p = new Particle(0, 0, 0);
        p.resetRandom();
        return p;
    }

    resetRandom() {
        let [i, j] = this.wet_cells[Math.floor(Math.random() * this.wet_cells.length)];
        this.xy_history = [[i + Math.random(), j + Math.random()]];
        this.age = Math.floor(Math.random() * (this.max_age - 10));
    }

    needsReset() {
        let [i, j] = this.xy_history[this.xy_history.length - 1];
        i = Math.floor(i);
        j = Math.floor(j);
        return this.age > this.max_age || 
            i < 0 || i >= this.n_cols || j < 0 || j >= this.n_rows || 
            u[j][i] === "nan" || v[j][i] === "nan";
    }

    getFlow() {
        let [i, j] = this.xy_history[this.xy_history.length - 1];
        i = Math.floor(i);
        j = Math.floor(j);
        return [u[j][i], v[j][i]];
    }
    
    draw(context, x_s, y_s, square_size) {
        let x = (i) => x_s + i * square_size;
        let y = (j) => y_s + j * square_size;

        let [i, j] = this.xy_history[this.xy_history.length - 1];
        context.beginPath();
        context.moveTo(x(i), y(j));
        
        let start_idx = this.xy_history.length - 2;
        let end_idx = this.xy_history.length - 1 - this.max_history;
        end_idx = Math.max(0, end_idx);

        let stroke = (shade) => `rgba(${shade}, ${shade}, ${shade}, 0.8)`;
        let shade_e = 100;
        let shade_s = 255;

        for (let k = start_idx; k > end_idx; k--) {
            // let shade = Math.floor(shade_s + (shade_e - shade_s) * (start_idx - k) / (start_idx - end_idx));
            // context.strokeStyle = stroke(shade);

            [i, j] = this.xy_history[k];
            context.lineTo(x(i), y(j));
        }
        context.stroke();
    }
    
    move() {
        if (this.needsReset())
            this.resetRandom();
        let [u, v] = this.getFlow();
        let [i, j] = this.xy_history[this.xy_history.length - 1];
        this.xy_history.push([i + u * this.speed_scale, j + v * this.speed_scale]);
        this.age += 1;
    }
}
Particle.prototype.max_age = 50;
Particle.prototype.max_history = 8;
Particle.prototype.speed_scale = 2;
Particle.prototype.wet_cells = wet_cells;
Particle.prototype.n_cols = n_cols;
Particle.prototype.n_rows = n_rows;


////////////////////////////////
// Particle Generator
////////////////////////////////
const num_particles = 3500;
const particles = [];
for (let k = 0; k < num_particles; k++)
    particles.push( Particle.newRandom() );


function CurrentChart(props) {
    let canvas_ref = useRef();

    const chart_width = props.height * aspect_ratio;
    const chart_height = props.height;
    const chart_x_s = (props.width - chart_width) / 2;

    const [x_s, x_e] = [chart_x_s + chart_width * inner_padding, chart_x_s + chart_width * (1 - inner_padding)];
    const [y_s, y_e] = [props.height * inner_padding, props.height * (1 - inner_padding)];

    const square_size = (x_e - x_s) / n_cols;

    useEffect(() => {
        const canvas = canvas_ref.current;
        const cx = canvas.getContext('2d');

        const black = 50;
        cx.fillStyle = `rgba(${black}, ${black}, ${black}, 1)`;
        // cx.fillStyle = `rgba(0, 43, 77, 1)`;
        cx.strokeStyle = "rgba(255, 255, 255, 0.4)";

        const interval = setInterval(() => {
            drawWetCells(cx, wet_cells, x_s, y_s, square_size);

            particles.forEach((p) => p.draw(cx, x_s, y_s, square_size));
            particles.forEach((p) => p.move());

            // console.log(particles)
        }, 50);
        return () => clearInterval(interval);
      }, []);

    return (
        <canvas ref={canvas_ref} width={props.width} height={props.height}>

        </canvas>
    );
}

export default CurrentChart;