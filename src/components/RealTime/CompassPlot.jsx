import { useRef, useEffect } from 'react'; 
import { select, scaleLinear, easeElasticOut, arc} from 'd3';
import "./RealTimeConditions.css"
import { mod } from './api'
 

const inner_padding = 0.1;
const label_margin = 20;

// See Wind Chart https://www.weather.gov/media/eka/Beaufortwindchart.pdf
const wind_speeds = [
    { "speeds": [ 0,  0], "terminology": "Calm"           , "color": "#c5f0ff" },
    { "speeds": [ 1,  4], "terminology": "Light Air"      , "color": "#9cccdf" },
    { "speeds": [ 4,  8], "terminology": "Light breeze"   , "color": "#73a9be" },
    { "speeds": [ 8, 13], "terminology": "Gentle breeze"  , "color": "#49859e" },
    { "speeds": [13, 19], "terminology": "Moderate breeze", "color": "#20617d" },
    { "speeds": [19, 25], "terminology": "Fresh breeze"   , "color": "#159663" },
    { "speeds": [25, 32], "terminology": "Strong breeze"  , "color": "#0bca49" },
    { "speeds": [32, 39], "terminology": "Near gale"      , "color": "#00ff2f" },
    { "speeds": [39, 47], "terminology": "Gale"           , "color": "#ffda1f" },
    { "speeds": [47, 55], "terminology": "Severe Gale"    , "color": "#ff0000" },
]
const max_wind_speed = 50; // Everything above this is clipped to this max

function CompassPlot(props) {
    let d3_ref = useRef();

    const [x_s, x_e] = [props.radius * inner_padding, props.radius * (1 - inner_padding)];
    const [y_s, y_e] = [props.radius * inner_padding, props.radius * (1 - inner_padding)];

    const x_mid = (x_s + x_e) / 2;
    const y_mid = (y_s + y_e) / 2;
    const compass_radius = (x_e - x_s - 2 * label_margin) / 2;
    
    let labels = [
        <text key='north' x={x_mid} y={y_s + label_margin / 2} textAnchor="middle" dominantBaseline="middle">N</text>,
        <text key='south' x={x_mid} y={y_e - label_margin / 2} textAnchor="middle" dominantBaseline="middle">S</text>,
        <text key='east' x={x_e - label_margin / 2} y={y_mid} textAnchor="middle" dominantBaseline="middle">E</text>,
        <text key='west' x={x_s + label_margin / 2} y={y_mid} textAnchor='middle' dominantBaseline="middle">W</text>
    ];
    let axes = [
        <circle key="axis-outline-1" cx={x_mid} cy={y_mid} r={x_mid - x_s} stroke="black" fillOpacity="0"></circle>,
        <circle key="axis-outline-2" cx={x_mid} cy={y_mid} r={x_mid - x_s + 5} stroke="black" fillOpacity="0"></circle>,
    ];
    // Straight line axes
    let num_axes = 8;
    let axis_angle = scaleLinear().domain([0, num_axes - 1]).range([Math.PI / 2, -(Math.PI / 2) + (Math.PI / num_axes)]);
    for (let i = 0; i < num_axes; i++) {
        let x1 = x_mid + compass_radius * Math.cos(axis_angle(i));
        let y1 = y_mid + compass_radius * Math.sin(axis_angle(i));
        let x2 = x_mid + compass_radius * Math.cos(axis_angle(i) + Math.PI);
        let y2 = y_mid + compass_radius * Math.sin(axis_angle(i) + Math.PI);
        axes.push(
            <line className='compass-grid' key={`axis-line${i}`} x1={x1} y1={y1} x2={x2} y2={y2}></line>
        )
    }
    // Circle axes
    let num_circle_axes = 5;
    let axis_radius = scaleLinear().domain([1, num_circle_axes]).range([compass_radius / num_circle_axes, compass_radius]);
    for (let i = 1; i <= num_circle_axes; i++) {
        let r = axis_radius(i);
        let units_number = Math.round(r / compass_radius * max_wind_speed);
        axes.push(
            <circle className='compass-grid' key={`axis-circle${i}`} cx={x_mid} cy={y_mid} r={r} fill='none'></circle>
        )
        labels.push(
            <circle key={`axis-label-cover${i}`} cx={x_mid + r} cy={y_mid} r={"8px"} fill="white" fillOpacity="0.3"></circle>
        )
        labels.push(
            <text x={x_mid + r} y={y_mid} textAnchor="middle" dominantBaseline="central">
                <tspan> {units_number} </tspan>
                <tspan x={x_mid + r} dy="1.1em"> {props.units} </tspan>
            </text>
        )
    }


    const data_available = props.time && props.y && props.time.length > 0 && props.y.length > 0;
    let t0, current_speed, current_direction;
    if (data_available) {
        t0 = props.time[0];
        
        current_speed = Math.round(props.y[props.y.length - 1][0]);
        current_direction = props.y[props.y.length - 1][1];
        if (22.5 <= current_direction && current_direction <= 67.5)
            current_direction = "North East"
        else if (67.5 <= current_direction && current_direction <= 112.5)
            current_direction = "North";
        else if (112.5 <= current_direction && current_direction <= 157.5)
            current_direction = "North West"
        else if (157.5 <= current_direction && current_direction <= 202.5)
            current_direction = "West";
        else if (202.5 <= current_direction && current_direction <= 247.5)
            current_direction = "South West";
        else if (247.5 <= current_direction && current_direction <= 292.5)
            current_direction = "South";
        else if (292.5 <= current_direction && current_direction <= 337.5)
            current_direction = "South East";
        else
            current_direction = "East";
    }

    useEffect(() => {
        if (!data_available) {
            return
        }

        let svg = select(d3_ref.current);
        
        let data = [];
        for (let i = 0; i < props.time.length; i++)
            data.push([props.time[i] - t0, props.y[i][0], (props.y[i][1]) * Math.PI / 180]);
        data = data.slice(props.time.length - 12);

        // Bin parameters for Wind Rose
        const num_bins = 16;
        const bin_padding = 1 * Math.PI / 180; // radians
        const bin_width = Math.PI * 2 / num_bins;
        const bin_angle = scaleLinear()
            .domain([0, num_bins - 1])
            .range([-0.5 * bin_width, -1.5 * bin_width + Math.PI * 2]);

        // Put data into bins
        const bins = [];
        let max_bin_freq = 0;
        for (let i = 0; i < num_bins; i++)
            bins.push([]);
        for (let i = 0; i < data.length; i++) {
            let angle = mod(data[i][2] + 0.5 * bin_width, Math.PI * 2) - 0.5 * bin_width;
            let bin_idx = Math.floor(bin_angle.invert(angle));
            bins[bin_idx].push(data[i]);
            max_bin_freq = Math.max(max_bin_freq, bins[bin_idx].length);
        }
        // Average Wind Speed for each bin
        let avg_wind_speeds = [];
        for (let i = 0; i < bins.length; i++) {
            if (bins[i].length === 0)
                avg_wind_speeds.push(0)
            else
                avg_wind_speeds.push(bins[i].reduce((prev, cur) => prev + cur[1], 0) / bins[i].length);
        }
        
        // Create bins
        let wind_scale = (speed) => Math.min(1, speed / max_wind_speed);
        let wind_color = (speed) => wind_speeds[Math.floor(wind_speeds.length * wind_scale(speed))].color;
        let arc_gen = arc().innerRadius(0);
        svg.select("#bins")
            .selectAll("path")
            .data(bins)
            .join("path")
            .attr("fill", (d, i) => wind_color(avg_wind_speeds[i]))
            .attr("transform", `translate(${props.radius / 2} ${props.radius / 2})`)
            .transition()
            .duration(1000)
            .ease(easeElasticOut.period(0.7))
            .attrTween("d", function(d, i) {
                return function(t) {
                    return arc_gen({
                       outerRadius: t * compass_radius * wind_scale(avg_wind_speeds[i]),
                       startAngle: Math.PI / 2 - bin_angle(i) - bin_padding,
                       endAngle: Math.PI / 2 - bin_angle(i) - bin_width + bin_padding
                    })
                };
            });
    }, [props.time, props.y, props.radius, compass_radius, data_available, t0]);

    const loading_text = <text x={x_mid} y={y_mid} textAnchor="middle" dominantBaseline="middle"> Loading </text>
    const calm_circle = <g>
        <circle cx={x_mid} cy={y_mid} r={4 / max_wind_speed * compass_radius} fill="#c5f0ff"></circle>
        <text x={x_mid} y={y_mid} textAnchor="middle" dominantBaseline="central"> Calm </text>
    </g>

    const legend_y = 60;
    const legend_height = 150;
    const legend_box_size = 10;
    const legend = [
        <rect x={x_s} y={legend_y} rx="2" ry="2" width="100" height={legend_height} fill="white" fillOpacity="0.9" stroke="black"></rect>
    ];
    for (let i = 0; i < wind_speeds.length; i++) {
        let top_margin = (legend_height / wind_speeds.length - legend_box_size) / 2;
        let y = legend_y + top_margin + i / wind_speeds.length * legend_height;
        legend.push(
            <rect x={x_s + 3} y={y} width={legend_box_size} height={legend_box_size} fill={wind_speeds[i].color}></rect>,
            <text x={x_s + 5 + legend_box_size} y={y + legend_box_size / 2} dominantBaseline="central"> { wind_speeds[i].terminology }</text>
        )
    }    

    return (
        <svg 
            className="compass-plot"
            viewBox={`0 0 ${props.radius} ${props.radius}`}
            width={props.radius}
            height={props.radius}
            ref={d3_ref}
            shapeRendering="geometricPrecision"
            >
            { axes }
            { !data_available && loading_text }

            <g id="bins"></g>
            <g id="points"></g>

            { calm_circle }

            {/* Title */}
            <text x={x_s} y={0} dominantBaseline="hanging" className='line-plot-title'>
                <tspan> {props.title} </tspan>
                <tspan x={x_s} dy='18px' style={{fontSize: "2.5em"}}> {current_speed} {props.units} {current_direction} </tspan>
            </text>
            
            { labels }
            { legend }
        </svg>
    );
}

export default CompassPlot;