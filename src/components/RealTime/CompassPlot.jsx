import { useRef, useEffect } from 'react'; 
import { select, path, easeElasticOut} from 'd3';
import "./RealTimeConditions.css"

const inner_padding = 0.15;
const label_margin = 5;
// Compass ticks
const num_ticks = 8 * 15;
const num_bold_ticks = 8;
const tick_length = 10;

function CompassPlot(props) {
    let d3_ref = useRef();

    const [x_s, x_e] = [props.radius * inner_padding, props.radius * (1 - inner_padding)];
    const [y_s, y_e] = [props.radius * inner_padding, props.radius * (1 - inner_padding)];

    const x_mid = (x_s + x_e) / 2;
    const y_mid = (y_s + y_e) / 2;
    const compass_radius = (x_e - x_s) / 2;
    
    let labels = [
        <text key='north' x={x_mid} y={y_s + tick_length + label_margin} textAnchor="middle" dominantBaseline="hanging">N</text>,
        <text key='south' x={x_mid} y={y_e - tick_length - label_margin} textAnchor="middle" dominantBaseline="text-bottom">S</text>,
        <text key='east' x={x_e - tick_length - label_margin / 2} y={y_mid} textAnchor="end" dominantBaseline="middle">E</text>,
        <text key='west' x={x_s + tick_length + label_margin / 2} y={y_mid} textAnchor='start' dominantBaseline="middle">W</text>
    ];

    //////////////////////////////////////////////////
    // If Data Available
    //////////////////////////////////////////////////
    const data_available = props.time && props.y && props.time.length > 0 && props.y.length > 0;
    let t0, average_speed, average_direction;
    if (data_available) {
        t0 = props.time[0];
        let data = [];
        for (let i = 0; i < props.time.length; i++)
            data.push([props.time[i] - t0, props.y[i][0], props.y[i][1]]);
        data = data.slice(props.time.length - 12);

        average_speed = Math.round(data.reduce((prev, cur) => prev + cur[1], 0) / data.length);
        average_direction = data.reduce((prev, cur) => prev + cur[2], 0) / data.length;
    }

    //////////////////////////////////////////////////
    // Compass Ticks
    //////////////////////////////////////////////////
    let ticks = [];
    for (let i = 0; i < num_ticks; i++) {
        let is_bold = (i % (num_ticks / num_bold_ticks)) === 0;
        let stroke_width = is_bold ? 3 : 1;
        let tick_length_i = is_bold ? tick_length * 1.5 : tick_length;

        let angle = 2 * Math.PI * (i / num_ticks);
        let x1 = x_mid + compass_radius * Math.cos(angle);
        let y1 = y_mid - compass_radius * Math.sin(angle);
        let x2 = x_mid + (compass_radius + tick_length_i) * Math.cos(angle);
        let y2 = y_mid - (compass_radius + tick_length_i) * Math.sin(angle);
        ticks.push(
            <line key={`compass-tick${i}`} x1={x1} y1={y1} x2={x2} y2={y2} strokeOpacity="1" stroke="black" strokeWidth={stroke_width}></line>
        );
    }
    
    //////////////////////////////////////////////////
    // Center Label
    //////////////////////////////////////////////////
    let center_label = [
        <circle key="center-circle" cx={x_mid} cy={y_mid} r={compass_radius * 0.5} fill="#fdfdfd"></circle>,
        <text key="center-text" x={x_mid} y={y_mid} textAnchor="middle">
            <tspan id="compass-title" dy="-1em"> {props.title} </tspan>
            {
                data_available && 
                [
                    <tspan key="compass-number" id="compass-number" x={x_mid} dy="1.2em"> {average_speed} </tspan>,
                    <tspan key="compass-unit" id="compass-unit" x="50%" dy="1em"> {props.units.toLowerCase()} </tspan>
                ]
            }
            {
                !data_available &&
                <tspan x={x_mid} dy="1.2em">Loading </tspan>
            }            
        </text>
    ];

    //////////////////////////////////////////////////
    // Compass Arrow
    //////////////////////////////////////////////////
    let arrow_direction = 90 * Math.PI / 180;
    let x_start = x_mid - compass_radius * Math.cos(arrow_direction);
    let y_start = y_mid + compass_radius * Math.sin(arrow_direction);
    let x_end = x_mid + compass_radius * Math.cos(arrow_direction);
    let y_end = y_mid - compass_radius * Math.sin(arrow_direction);
    let arrow_length = 22;
    let dr_length = 17;
    let r_theta = Math.atan2(-(y_end - y_mid), x_end - x_mid);
    let arrow_width = 60;
    let dr_theta = r_theta + (180 - arrow_width) * Math.PI / 180;
    let arrow_path = path();
    arrow_path.moveTo(x_end, y_end);
    arrow_path.lineTo(x_end + dr_length * Math.cos(dr_theta), y_end - dr_length * Math.sin(dr_theta))
    arrow_path.lineTo(x_end + arrow_length * Math.cos(r_theta), y_end - arrow_length * Math.sin(r_theta));
    dr_theta = r_theta - (180 - arrow_width) * Math.PI / 180;
    arrow_path.lineTo(x_end + dr_length * Math.cos(dr_theta), y_end - dr_length * Math.sin(dr_theta));
    arrow_path.closePath();
    let circle_radius = 10;
    let circle_x = x_start + circle_radius * Math.cos(Math.PI + r_theta);
    let circle_y = y_start - circle_radius * Math.sin(Math.PI + r_theta);

    let compass_arrow = <g id="compass-arrow">
        <line key="arrow-line" x1={x_start} y1={y_start} x2={x_end} y2={y_end} stroke="steelblue" strokeWidth="5"></line>
        <path key="arrow-tip" d={arrow_path._} fill="steelblue"></path>
        <circle key="arrow-tail" cx={circle_x} cy={circle_y} r={circle_radius} fill="none" strokeWidth="5" stroke="steelblue"></circle>
    </g>;


    ////////////////////////////////////////////////////
    // Animate arrow when data loaded
    ////////////////////////////////////////////////////
    useEffect(() => {
        if (!data_available) {
            return
        }
        let svg = select(d3_ref.current);

        svg.select("#compass-arrow")
            .transition()
            .duration(1000)
            .ease(easeElasticOut.period(0.6))
            .attrTween("transform", function() {
                return function(t) {
                    return `rotate(${t * (90 - average_direction)} ${x_mid} ${y_mid})`;
                }
            });

    }, [props.time, props.y, data_available, x_mid, y_mid, average_direction]);

    const loading_text = <text x={x_mid} y={y_mid} textAnchor="middle" dominantBaseline="middle"> Loading </text>

    return (
        <svg 
            className="compass-plot"
            viewBox={`0 0 ${props.radius} ${props.radius}`}
            ref={d3_ref}
            shapeRendering="geometricPrecision"
            >
            { !data_available && loading_text }
            { ticks }
            { compass_arrow }
            { center_label }

            { labels }
        </svg>
    );
}

export default CompassPlot;