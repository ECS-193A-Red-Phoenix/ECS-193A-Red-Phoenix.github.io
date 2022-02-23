import { scaleLinear } from "d3";
import { useRef, useEffect } from "react";
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


//////////////////////////////////
// Chart constants
//////////////////////////////////
const inner_padding = 0.01;

let [u, v] = require('./slice.json'); 
u = reversed(u);
v = reversed(v);
const [n_rows, n_cols] = [u.length, u[0].length];
const aspect_ratio = n_cols / n_rows;


class VectorField {
    constructor(u, v) {
        this.u = u;
        this.v = v;
        this.n_rows = u.length;
        this.n_cols = u[0].length;
        this.wet_cells = [];
        for (let j = 0; j < this.n_rows; j++) {
            for (let i = 0; i < this.n_cols; i++) {
                if (!(typeof this.u[j][i] === 'number' && typeof this.v[j][i] === 'number'))
                    continue;
                this.wet_cells.push([i, j]);
            }
        }
    }

    randomPoint() {
        let [i, j] = this.wet_cells[Math.floor(Math.random() * this.wet_cells.length)];
        return [i + Math.random(), j + Math.random()];
    }

    static bilinear(x, y, grid) {
        let n_rows = grid.length;
        let n_cols = grid[0].length;
        let i = Math.floor(x);
        let j = Math.floor(y);
        let if_undefined = (x, my_default) => (x === undefined) ? my_default : x;
        let get_grid = (j, i) => (i >= 0 && i < n_cols && j >= 0 && j < n_rows && typeof grid[j][i] === 'number') ? grid[j][i] : undefined;
        let f00 = if_undefined(get_grid(j, i), 0);
        let f10 = if_undefined(get_grid(j, i + 1), f00);
        let f01 = if_undefined(get_grid(j + 1, i), f00);
        let f11 = if_undefined(get_grid(j + 1, i + 1), f00);
        x -= i;
        y -= j;
        return f00 + (f10 - f00) * x + (f01 - f00) * y + (f11 - f10 - f01 + f00) * x * y;
    }

    outOfBounds(i, j) {
        return i < 0 || i >= this.n_cols || j < 0 || j >= this.n_rows || 
            this.u[j][i] === "nan" || this.v[j][i] === "nan" || 
            this.u[j][i] === undefined || this.v[j][i] === undefined;
    }

    getFlow(x, y) {
        return [VectorField.bilinear(x, y, this.u), VectorField.bilinear(x, y, this.v)];
    }

    drawWetCells(cx, x_s, y_s, width, height) {
        if (height === undefined)
            height = width;
        for (let k = 0; k < this.wet_cells.length; k++) {
            let [i, j] = this.wet_cells[k];
            let x = x_s + i * width;
            let y = y_s + j * height;
            cx.fillRect(x, y, width + 1, height + 1);
        }
    }
}

class Particle {
    constructor(x, y, age, field) {
        this.xy_history = [[x, y]];
        this.age = age;
        this.field = field;
    }

    static newRandom(field) {
        const p = new Particle(0, 0, 0, field);
        p.resetRandom();
        return p;
    }

    resetRandom() {
        this.xy_history = [this.field.randomPoint()];
        this.age = Math.floor(Math.random() * (this.max_age - 10));
    }

    needsReset() {
        let [i, j] = this.xy_history[this.xy_history.length - 1];
        i = Math.floor(i);
        j = Math.floor(j);
        return this.age > this.max_age || this.field.outOfBounds(i, j);
    }

    getFlow() {
        let [x, y] = this.xy_history[this.xy_history.length - 1];
        return this.field.getFlow(x, y);
    }
    
    draw(context, x_s, y_s, width, height) {
        if (height === undefined)
            height = width;
        let x = (i) => x_s + i * width;
        let y = (j) => y_s + j * height;

        let [i, j] = this.xy_history[this.xy_history.length - 1];
        context.beginPath();
        context.moveTo(x(i), y(j));
        
        let start_idx = this.xy_history.length - 2;
        let end_idx = this.xy_history.length - 1 - this.max_history;
        end_idx = Math.max(0, end_idx);

        // let stroke = (shade) => `rgba(${shade}, ${shade}, ${shade}, 0.8)`;
        // let shade_e = 100;
        // let shade_s = 255;

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
Particle.prototype.speed_scale = 1;
// Particle.prototype.wet_cells = wet_cells;
// Particle.prototype.n_cols = n_cols;
// Particle.prototype.n_rows = n_rows;


////////////////////////////////
// Particle Generator
////////////////////////////////
const lt_field = new VectorField(u, v);
const num_particles = 3500;
const particles = [];
for (let k = 0; k < num_particles; k++)
    particles.push( Particle.newRandom(lt_field) );


const num_legend_boxes = 5;
const legend_boxes = [];
const legend_particles = 50;
const legend_speed = scaleLinear().domain([0, num_legend_boxes - 1]).range([0.01, 0.1016]);
for (let i = 0; i < num_legend_boxes; i++) {
    let box_particles = [];
    let legend_field = new VectorField([[legend_speed(i)]], [[0]]);
    for (let k = 0; k < legend_particles; k++) {
        box_particles.push( Particle.newRandom(legend_field) );
    }
    legend_boxes.push([box_particles, legend_field]);
}

function CurrentChart(props) {
    let canvas_ref = useRef();

    const legend_width = 300;
    const chart_width = props.height * aspect_ratio;
    const chart_height = props.height;
    let chart_x_s = (props.width - chart_width) / 2;
    if (props.width === undefined)
        chart_x_s = 0;

    const [x_s, x_e] = [chart_x_s + chart_width * inner_padding, chart_x_s + chart_width * (1 - inner_padding)];
    const [y_s, y_e] = [props.height * inner_padding, props.height * (1 - inner_padding)];
    const square_size = (x_e - x_s) / n_cols;

    const legend_x = x_e + 20;
    const legend_y = y_s;
    const legend_box_margin = 20;

    useEffect(() => {
        const canvas = canvas_ref.current;
        const cx = canvas.getContext('2d');

        const black = 50;
        cx.fillStyle = `rgba(${black}, ${black}, ${black}, 1)`;
        cx.strokeStyle = "rgba(255, 255, 255, 0.4)";

        const legend_font_size = 14;
        cx.font = `${legend_font_size}px 'Roboto' sans-serif`;
        cx.textBaseline = "middle";
        for (let i = 0; i < legend_boxes.length; i++) {
            const [legend_particles, legend_field] = legend_boxes[i];
            const width =  10 * square_size * 2;
            const height = 10 * square_size * 0.5;
            const x = legend_x;
            const y = legend_y + (height + legend_box_margin) * i;
            
            const speed = Math.round(legend_speed(i) * 39.3701 * 10) / 10;
            cx.fillText(`${speed} inches per second`, x + width + 8, y + height / 2);
        }

        const interval = setInterval(() => {
            lt_field.drawWetCells(cx, x_s, y_s, square_size);
            particles.forEach((p) => p.draw(cx, x_s, y_s, square_size));
            particles.forEach((p) => p.move());

            for (let i = 0; i < legend_boxes.length; i++) {
                const [legend_particles, legend_field] = legend_boxes[i];
                const width =  10 * square_size * 2;
                const height = 10 * square_size * 0.5;
                const x = legend_x;
                const y = legend_y + (height + legend_box_margin) * i;
                legend_field.drawWetCells(cx, x, y, width, height);
                legend_particles.forEach((p) => p.draw(cx, x, y, width, height));
                legend_particles.forEach((p) => p.move());
            }


        }, 50);
        return () => clearInterval(interval);
      }, []);

    const canvas_width = legend_width + ((props.width === undefined) ? chart_width : props.width);
    return (
        <canvas ref={canvas_ref} width={canvas_width} height={props.height}>

        </canvas>
    );
}

export default CurrentChart;