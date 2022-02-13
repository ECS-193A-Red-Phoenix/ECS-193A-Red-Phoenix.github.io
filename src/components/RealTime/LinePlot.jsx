import { useRef, useEffect } from 'react'; 
import { select, scaleLinear, path, transition, easeLinear, interpolate } from 'd3';
import "./RealTimeConditions.css"

const innerPadding = 0.1;
const num_ticks = 8;
const tickLength = 0.01;
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function format_date(date) {
    let day = DAYS[date.getDay()];
    let hours = String(date.getHours() % 12).padStart(2, 0);
    let am_pm = (date.getHours() >= 12) ? "PM" : "AM";
    let minutes = String(date.getMinutes()).padStart(2, 0);
    return `${day} ${hours}:${minutes} ${am_pm}`;
}

function LinePlot(props) {
    let d3_ref = useRef();
    
    const [x_s, x_e] = [props.width * innerPadding, props.width * (1 - innerPadding)];
    const [y_s, y_e] = [props.height * innerPadding, props.height * (1 - innerPadding)];

    let axes = [
        <line key="x-axis" x1={x_s} y1={y_e} x2={x_e} y2={y_e} stroke="black" strokeLinecap="square"></line>,
        <line key="y-axis" x1={x_s} y1={y_e} x2={x_s} y2={y_s} stroke="black" strokeLinecap="square"></line>
    ];
    let axes_units = <text x={x_s - 40} y={(y_s + y_e) / 2} textAnchor="end" dominantBaseline="middle" className="line-plot-label">
        {props.units ? props.units : ""}
    </text>

    let ticks = [];
    for (let i = 1; i <= num_ticks; i++) {
        // X tick
        let y1 = y_e;
        let y2 = y1 - (y_e - y_s) * tickLength;
        let x1 = x_s + (x_e - x_s) * (i / num_ticks);
        let x2 = x1;
        ticks.push(
            <line key={`x-tick-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke='black' strokeLinecap='square'></line>
        );
        // Y tick
        y1 = y_e - (y_e - y_s) * (i / num_ticks);
        y2 = y1
        x1 = x_s;
        x2 = x1 + (x_e - x_s) * (tickLength);
        ticks.push(
            <line key={`y-tick-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke='black' strokeLinecap='square'></line>
        );
    }

    const is_loading = !props.time || !props.y;
    const unavailable = !is_loading && (props.time.length == 0 || props.y.length == 0);
    const loading_text = 
        <text x={(x_e + x_s) / 2} y={(y_e + y_s) / 2} textAnchor="middle" dominantBaseline="middle" className="line-plot-loading">
        {is_loading ? "Loading" : unavailable ? "Data Temporarily Unavailable" : "Loaded"}
        </text>;
    console.log(is_loading, unavailable, is_loading ? "Loading" : unavailable ? "Data Temporarily Unavailable" : "Loaded")

    const y_padding = 0.2 * (y_e - y_s);
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
            .range([y_e - y_padding, y_s + y_padding]);
    }

    const labels = [];
    if (!is_loading && !unavailable) {
        let y_label_scale = scaleLinear()
            .domain([y_e - y_padding, y_s + y_padding])
            .range([y_min, y_max]);
        let label_margin = 5;
        for (let i = 1; i < num_ticks; i++) {
            // Y labels
            let y1 = y_e - (y_e - y_s) * (i / num_ticks);
            let x1 = x_s;
            labels.push(
                <text key={`y-label${i}`} x={x1 - label_margin} y={y1} textAnchor="end" dominantBaseline="middle" className='line-plot-label'> 
                    {Math.round(y_label_scale(y1) * 100) / 100} 
                </text>
            )
            // X labels
            x1 = x_s + (x_e - x_s) * (i / num_ticks);
            y1 = y_e
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
        if (is_loading || unavailable) {
            return;
        }

        let svg = select(d3_ref.current);
        
        const p = path();
        p.moveTo(x_scale(0), y_scale(props.y[0]))
        for (let i = 0; i < props.time.length; i++) {
            p.lineTo(x_scale(props.time[i] - t0), y_scale(props.y[i]));
        }
        
        svg.select("path")
            .attr("d", p)
            .transition()
            .duration(1000)
            .ease(easeLinear)
            .attrTween("stroke-dasharray", function() {
                const length = this.getTotalLength();
                return interpolate(`0,${length}`, `${length},${length}`);
            });
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
            
            <text x={x_s} y={y_s - 5} className="line-plot-title"> {props.title} </text>
            <path stroke="steelblue" strokeWidth="2.5" fillOpacity="0" strokeDasharray="0,1"></path>
            
            { (is_loading || unavailable) && loading_text }
            { axes }
            { props.units && axes_units }
            { ticks }
            { labels }
        </svg>
    );
}

export default LinePlot;