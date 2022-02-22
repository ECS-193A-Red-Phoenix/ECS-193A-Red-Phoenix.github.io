import { selectAll } from "d3";
import { useRef, useEffect } from "react";
import "./CurrentChart.css";


const inner_padding = 0.01;
let [u, v] = require('./slice.json'); 
u = reversed(u);
v = reversed(v);
const [n_rows, n_cols] = [u.length, u[0].length];
const aspect_ratio = n_cols / n_rows;

function reversed(arr) {
    let res = [];
    for (let j = arr.length - 1; j > -1; j--)
        res.push(arr[j]);
    return res;
}

function CurrentChart(props) {
    let d3_ref = useRef();

    const chart_width = props.height * aspect_ratio;
    const chart_height = props.height;
    const chart_x_s = (props.width - chart_width) / 2;

    const [x_s, x_e] = [chart_x_s + chart_width * inner_padding, chart_x_s + chart_width * (1 - inner_padding)];
    const [y_s, y_e] = [props.height * inner_padding, props.height * (1 - inner_padding)];

    //////////////////////////////////////////////
    // Grid Squares
    //////////////////////////////////////////////
    let square_size = (x_e - x_s) / n_cols;
    let grid_squares = [];
    let wet_cells = [];
    for (let j = 0; j < n_rows; j++) {
        for (let i = 0; i < n_cols; i++) {
            if (!(typeof u[j][i] === 'number' && typeof v[j][i] === 'number'))
                continue;
            wet_cells.push([i, j]);
            let x = x_s + i * square_size;
            let y = y_s + j * square_size;
            grid_squares.push(
                <rect key={`grid${j}-${i}`} x={x} y={y} width={square_size} height={square_size}></rect>
            )
        }
    }

    //////////////////////////////////////////////
    // Particle Generator
    //////////////////////////////////////////////
    let num_particles = 1000;
    let particles = [];
    for (let k = 0; k < num_particles; k++) {
        let [i, j] = wet_cells[Math.floor(Math.random() * wet_cells.length)];
        let x = x_s + (i + Math.random()) * square_size;
        let y = y_s + (j + Math.random()) * square_size;
        particles.push(
            <circle className="particle" key={`particle${k}`} cx={x} cy={y} r="1" fill="white"></circle>
        );
    }

    useEffect(() => {
        let speed_scale = 4;
        
        const interval = setInterval(() => {
            document.querySelectorAll('.particle').forEach(function(d) {
                let x = parseFloat(d.getAttribute("cx"));
                let y = parseFloat(d.getAttribute("cy"));
                let grid_i = Math.floor((x - x_s) / square_size);
                let grid_j = Math.floor((y - y_s) / square_size);
                if (grid_j < 0 || grid_j >= n_rows || grid_i < 0 || grid_i >= n_cols || u[grid_j][grid_i] === "nan") {
                    d.setAttribute("fill", "red");
                    return;
                }
                let u_p = u[grid_j][grid_i] * speed_scale;
                let v_p = v[grid_j][grid_i] * speed_scale;
                d.setAttribute("cx", x + u_p);
                d.setAttribute("cy", y - v_p);
            });

            
            // selectAll(".particle")
            //     .attr("cx", function() {
            //         let x = parseFloat(this.getAttribute("cx"));
            //         let y = parseFloat(this.getAttribute("cy"));
            //         let grid_i = Math.floor((x - x_s) / square_size);
            //         let grid_j = Math.floor((y - y_s) / square_size);
            //         if (grid_j < 0 || grid_j >= n_rows || grid_i < 0 || grid_i >= n_cols || u[grid_j][grid_i] === "nan")
            //             return x;
            //         let u_p = u[grid_j][grid_i] * speed_scale;
            //         return x + u_p;
            //     })
            //     .attr("cy", function() {
            //         let x = parseFloat(this.getAttribute("cx"));
            //         let y = parseFloat(this.getAttribute("cy"));
            //         let grid_i = Math.floor((x - x_s) / square_size);
            //         let grid_j = Math.floor((y - y_s) / square_size);
            //         if (grid_j < 0 || grid_j >= n_rows || grid_i < 0 || grid_i >= n_cols || v[grid_j][grid_i] === "nan")
            //             return y;
            //         let v_p = v[grid_j][grid_i] * speed_scale;
            //         return y - v_p;
            //     })
            //     .attr("fill", function() {
            //         let x = parseFloat(this.getAttribute("cx"));
            //         let y = parseFloat(this.getAttribute("cy"));
            //         let grid_i = Math.floor((x - x_s) / square_size);
            //         let grid_j = Math.floor((y - y_s) / square_size);
            //         if (grid_j < 0 || grid_j >= n_rows || grid_i < 0 || grid_i >= n_cols || v[grid_j][grid_i] === "nan" || u[grid_j][grid_i] === "nan")
            //             return "red";
            //         return "white";
            //     });

        }, 100);
        return () => clearInterval(interval);
      }, []);

    return (
        <svg 
            className="current-chart"
            viewBox={`0 0 ${props.width} ${props.height}`}
            width={props.width}
            height={props.height}
            ref={d3_ref}
            shapeRendering="crispEdges"
            >

            { grid_squares }
            { particles }
            {/* <rect x={chart_x_s} y={0} width={chart_width} height={chart_height} stroke='black' fill='none'></rect> */}

        </svg>
    );
}

export default CurrentChart;