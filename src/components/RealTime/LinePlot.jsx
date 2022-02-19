import { useRef, useEffect, useState } from 'react'; 
import { select, scaleLinear, area, line, transition, easeLinear, interpolate, pointer} from 'd3';
import "./RealTimeConditions.css"

const inner_padding = 0.1;
const num_ticks = 8;
const tick_length = 0.01;
const y_padding = 0.1;
const label_margin = 5;
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function format_date(date) {
    let day = DAYS[date.getDay()];
    let hours = String((date.getHours() % 12) + 1).padStart(2, 0);
    let am_pm = (date.getHours() >= 12) ? "PM" : "AM";
    let minutes = String(date.getMinutes()).padStart(2, 0);
    return `${day} ${hours}:${minutes} ${am_pm}`;
}

function LinePlot(props) {
    let d3_ref = useRef();
    let [cursor_value, set_cursor_val] = useState(undefined);

    const [x_s, x_e] = [props.width * inner_padding, props.width * (1 - inner_padding)];
    const [y_s, y_e] = [props.height * inner_padding, props.height * (1 - inner_padding)];

    let axes = [
        <line key="x-axis" x1={x_s} y1={y_e} x2={x_e} y2={y_e} stroke="black" strokeLinecap="square"></line>,
        // <line key="y-axis" x1={x_s} y1={y_e} x2={x_s} y2={y_s} stroke="black" strokeLinecap="square"></line>
    ];
    let axes_units = <text x={x_s - 40} y={(y_s + y_e) / 2} textAnchor="end" dominantBaseline="middle" className="line-plot-label">
        {props.units ? props.units : ""}
    </text>

    let ticks = [];
    for (let i = 0; i <= num_ticks; i++) {
        // X tick
        let y1 = y_e;
        let y2 = y1 - (y_e - y_s) * tick_length;
        let x1 = x_s + (x_e - x_s) * (i / num_ticks);
        let x2 = x1;
        ticks.push(
            <line key={`x-tick-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke='black' strokeLinecap='square'></line>
        );
    }

    const is_loading = props.time.length == 0 || props.y.length == 0;
    const unavailable = !is_loading && (props.y[0] === undefined);
    const loading_text = 
        <text x={(x_e + x_s) / 2} y={(y_e + y_s) / 2} textAnchor="middle" dominantBaseline="middle" className="line-plot-loading">
        {is_loading ? "Loading" : unavailable ? "Data Temporarily Unavailable" : "Loaded"}
        </text>;

    const y_padding_px = y_padding * (y_e - y_s);
    let x_scale, y_scale, t0, t1, y_min, y_max;
    if (!is_loading && !unavailable) {
        [t0, t1] = [props.time[0], props.time[props.time.length - 1]];
        x_scale = scaleLinear()
            .domain([0, t1 - t0])
            .range([x_s, x_e]);

        y_min = Math.min(...props.y)
        y_max = Math.max(...props.y)
        y_scale = scaleLinear()
            .domain([y_min, y_max])
            .range([y_e - y_padding_px, y_s + y_padding_px]);
    }

    const labels = [];
    if (!is_loading && !unavailable) {
        // Y labels
        let y_label_scale = scaleLinear()
            .domain([y_e - y_padding_px, y_s + y_padding_px])
            .range([y_min, y_max]);
        let y_min_label = Math.ceil(y_label_scale(y_e));
        let y_max_label = Math.floor(y_label_scale(y_s));
        let y_label_increment = Math.max(0.5, Math.ceil((y_max_label - y_min_label) / num_ticks));
        let num_y_ticks = (y_max_label - y_min_label) / y_label_increment;
        // Remove bottom y label if we have more than 2 ticks
        if (num_y_ticks >= 2) {
            y_min_label += y_label_increment;
            num_y_ticks -= 1;
        }
        for (let i = 0; i <= num_y_ticks; i++) {
            let y1 = y_scale(y_min_label + i * y_label_increment);
            let x1 = x_s;
            labels.push(
                <text key={`y-label${i}`} x={x1 - label_margin} y={y1} textAnchor="end" dominantBaseline="middle" className='line-plot-label'> 
                    {Math.round(y_label_scale(y1) * 10) / 10} 
                </text>,
                <line key={`y-line${i}`} x1={x1} y1={y1} x2={x_e} y2={y1} stroke='black' strokeOpacity="0.1" strokeDasharray="3"></line>
            )
        }

        // X labels
        for (let i = 1; i < num_ticks; i++) {
            let x1 = x_s + (x_e - x_s) * (i / num_ticks);
            let y1 = y_e
            let x_val = (t1 - t0) * (i / num_ticks);
            x_val = new Date(t0.getTime() + x_val);
            labels.push(
                <text key={`x-label${i}`} x={x1} y={y1 + label_margin} textAnchor="middle" dominantBaseline="hanging" className='line-plot-label'>
                    { format_date(x_val) }
                </text>
            );
        }
        labels.push(
            <text key="x-label-end" x={x_e} y={y_e + label_margin} textAnchor="middle" dominantBaseline="hanging" className='line-plot-label'>
                Now
            </text>
        )
    }

    useEffect(() => {
        let svg = select(d3_ref.current);
        if (is_loading || unavailable) {
            svg.select("#line")
                .attr("d", "");
            return;
        }

        set_cursor_val(Math.round(props.y[props.y.length - 1] * 10) / 10);
        let data = [];
        for (let i = 0; i < props.time.length; i++) {
            data.push([x_scale(props.time[i] - t0), y_scale(props.y[i])])
        }

        svg.on('mousemove', function(event) {
            let [x, y] = pointer(event);
            if (x_s <= x && x <= x_e && y_s <= y && y <= y_e) {
                // Find y-value of cursor
                let x_value = (x - x_s) / (x_e - x_s) * (t1 - t0);
                let y_value = 0;
                for (let i = 1; i < props.time.length; i++) {
                    let prev = props.time[i - 1] - t0;
                    let cur = props.time[i] - t0;
                    if (prev <= x_value && x_value <= cur) {
                        y_value = props.y[i - 1] + (x_value - prev) * (props.y[i] - props.y[i - 1]) / (cur - prev);
                        break;
                    }
                }
                set_cursor_val(Math.round(y_value * 10) / 10);

                svg.select("#cursor")
                    .style('display', 'block');
                svg.select("#cursor > line")
                    .attr("x1", x)
                    .attr("x2", x)
                svg.select("#cursor > circle")
                    .attr("cx", x)
                    .attr("cy", y_scale(y_value));
                svg.select("#cursor > text")
                    .attr("x", x)
                    .text(format_date(new Date(t0.getTime() + x_value)));
            } else {
                svg.select("#cursor")
                    .style('display', 'none');
                set_cursor_val(Math.round(props.y[props.y.length - 1] * 10) / 10)
            }
        });
            
        svg.on('mouseleave', () => {
            svg.select("#cursor")
                .style('display', 'none');
        });
        
        // svg.select("g#points")
        //     .selectAll("circle")
        //     .data(data)
        //     .join("circle")
        //     .attr("cx", (d) => d[0])
        //     .attr("cy", (d) => d[1])
        //     .attr("r", "2")
        //     .attr("fill", "steelblue")

        svg.select("#line")
            .attr("d", line()(data))
            
        svg.select("#cover")
            .transition()
            .duration(1000)
            .ease(easeLinear)
            .attr("x", x_e)

    }, [props.time, props.y]);

    return (
        <svg 
            className="line-plot"
            viewBox={`0 0 ${props.width} ${props.height}`}
            width={props.width}
            height={props.height}
            ref={d3_ref}
            shapeRendering="geometricPrecision"
            >

            {/* Title */}
            <text x={x_s} y={0} dominantBaseline="hanging" className='line-plot-title'>
                <tspan> {props.title} </tspan>
                <tspan x={x_s} dy='18px' style={{fontSize: "2.5em"}}> {cursor_value} {props.units} </tspan>
            </text>


            {/* Chart data */}
            <path id="line" stroke="steelblue" strokeWidth="2.5" fillOpacity="0"></path>
            <rect id="cover" x={x_s} y={y_s} width={x_e - x_s} height={y_e - y_s} fill="white"></rect>
            <g id="points"></g>

            <g id='cursor'>
                <line x1={(x_s + x_e) / 2} y1={y_e} x2={(x_s + x_e) / 2} y2={y_s + 10} stroke="black" strokeOpacity="0.4"></line>
                <circle cx='50%' cy="50%" r="3" fill="steelblue"></circle>
                <text x={(x_s + x_e) / 2} y={y_s} textAnchor="middle" dominantBaseline="hanging"></text>
            </g>


            {/* Axes and Units */}
            { (is_loading || unavailable) && loading_text }
            { axes }
            { props.units && axes_units }
            { ticks }
            { labels }
        </svg>
    );
}

export default LinePlot;