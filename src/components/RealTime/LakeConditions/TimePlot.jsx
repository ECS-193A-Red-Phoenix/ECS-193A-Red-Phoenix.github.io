import { useState, useEffect } from "react";
import { useRef } from "react";
import { line, scaleLinear, select, zip } from "d3";

import "./LakeConditions.css";

import { time_axis_ticks_auto, axis_ticks_auto, DAYS_OF_WEEK, MONTHS, ONE_DAY, round, isNumeric } from "../../../js/forked/util";

export class Annotation {}; // documentative
export class HorizontalLineAnnotation extends Annotation {
    constructor(y) {
        super();
        this.y = y;
    }
};
export class TextAnnotation extends Annotation {
    constructor(text, x, y, textAnchor, dominantBaseline) {
        // Arguments:
        // text: annotation text
        // x: float in the range [0, 1]
        // y: y coordinate in range [min_y, max_y]
        super();
        this.text = text;
        this.x = x;
        this.y = y;
        this.textAnchor = textAnchor ?? "start";
        this.dominantBaseline = dominantBaseline ?? "auto";
    }
};
export class CircleAnnotation extends Annotation {
    constructor(x, y, r, color) {
        super();
        this.x = x;
        this.y = y;
        this.r = r;
        this.color = color;
    }
};
export class LineAnnotation extends Annotation {
    constructor(line_data, color, stroke_width) {
        super();
        this.line_data = line_data;
        this.color = color;
        this.stroke_width = stroke_width ?? 1;
    }
}

// enum
export const TimePlotType = {
    Scatter: "ScatterPlot",
    Line: "LinePlot" 
};  

function TimePlot(props) {
    ///////////////////////////////////
    // Expected props
    // |->  time: an Array of date objects                             
    // |->  y: an Array of y values corresponding to each date            
    // |->  plot_type (optional, default=Line): a TimePlotType key (enum) 
    // |->  color (optional, default="white"): the color of data
    // |
    // ----- Note:
    //   For each of these arguments, you may pass an array of arrays,
    //   in the case that you wish to overlay multiple data on the same plot
    ///////////////////////////////////////////////////////////////////////
    // chart_title (optional): a title for the chart
    // y_label (optional): the name of the y axis
    // max_y (optional): the maximum y, if undefined, determined dynamically
    // min_y (optional): the minimum y, if undefined, determined dynamically
    // y_ticks (optional, default=3), an Integer, the number of ticks to place on the y axis, or 
    //   an Array of y-values specifying where to place the tick
    // annotations (optional): a list of Annotation objects
    // x_tick_formatter (optional): a function that maps a x tick date to an Array of Strings
    // y_padding (optional): a number, or a tuple of 2 values (top, bottom), both percents in the range [0, 100].
    //   Specifies how much percent of the y-range to add to the top/bottom of the y-axis. default=0
    const svg_ref = useRef();
    const [ chart_width, setChartWidth ] = useState(700);
    const [ chart_height, setChartHeight ] = useState(350);

    let { time, y, chart_title, y_label, max_y, min_y, y_ticks, 
        annotations, plot_type, x_tick_formatter, color, y_padding } = props;
    if (time.length === 0)
        throw new Error("Expected time array to be non-empty");
    
    time = Array.isArray(time[0]) ? time : [time];
    y = Array.isArray(y[0]) ? y : [y]; 
    plot_type = plot_type ?? TimePlotType.Line;
    plot_type = Array.isArray(plot_type) ? plot_type : time.map(() => plot_type);
    color = color ?? "white";
    color = Array.isArray(color) ? color : time.map(() => color);
    y_padding = y_padding ?? 0;
    y_padding = (isNumeric(y_padding)) ? [y_padding, y_padding] : y_padding; 
    if (!Array.isArray(y_padding) || y_padding.length != 2)
        throw new Error(`Mis-formatted y_padding argument is not 2-tuple: ${y_padding}`);

    annotations = annotations ?? [];

    if (time.length !== y.length)
        throw new Error("Expected same number of x and y series")
    
    time.forEach((time_array, idx) => {
        if (time_array.length !== y[idx].length)
            throw new Error("Expected time and y data to have the same length");
        if (plot_type[idx] === TimePlotType.Line && time_array.length < 2)
            throw new Error("Expected at least two data points a Line Plot")
    });
    
    let time_as_number = time.flat().map((t) => t.getTime());
    let min_t = Math.min(...time_as_number);
    let max_t = Math.max(...time_as_number);
    const x_scale = scaleLinear()
        .domain([min_t, max_t])
        .range([0, chart_width]);

    max_y = max_y ?? Math.ceil(Math.max(...y.flat()));
    min_y = min_y ?? Math.floor(Math.min(...y.flat()));
    const y_range = max_y - min_y;
    max_y += y_range * (y_padding[0] / 100);
    min_y -= y_range * (y_padding[1] / 100);
    const y_scale = scaleLinear()
        .domain([min_y, max_y])
        .range([chart_height, 0]);

    y_ticks = y_ticks ?? 3;
    if (isFinite(y_ticks)) {
        y_ticks = axis_ticks_auto(min_y, max_y, undefined, y_ticks);
    }

    // Render chart
    useEffect(() => {
        let svg = select(svg_ref.current);
        const line_factory = line();

        const create_if_dne = (node, element_name, id) => {
            node.selectAll(`${element_name}#${id}`)
                .data([id])
                .enter()
                .append(element_name)
                .attr("id", id);
            return node.select(`${element_name}#${id}`);
        };

        time.forEach((time_array, idx) => {
            const time_series = zip(
                time_array.map(t_i => x_scale(t_i)),
                y[idx].map(y_i => y_scale(y_i))
            );

            switch (plot_type[idx]) {
                case TimePlotType.Line:
                    create_if_dne(svg, "path", `time-plot-line${idx}`)
                        .attr("d", line_factory(time_series))
                        .attr("stroke", color[idx])
                        .attr("fill", "none");
                    break;
                case TimePlotType.Scatter:
                    create_if_dne(svg, "g", `scatter${idx}`)
                        .selectAll("circle")
                        .data(time_series)
                        .join("circle")
                        .attr("r", 1.4)
                        .attr("cx", (d) => d[0])
                        .attr("cy", (d) => d[1])
                        .attr("fill", color[idx]);
                    break;
                default:
                    throw new Error(`Unknown TimePlotType '${plot_type[idx]}'`);
            }
        }); 

        // Create y labels
        svg.select("#time-plot-y-labels")
            .selectAll("text")
            .data(y_ticks)
            .join("text")
            .attr("x", -15)
            .attr("y", y_scale)
            .text((d) => round(d, 1));

        // Create x labels
        const x_tick_line1 = chart_height + 10;
        const x_tick_line2 = x_tick_line1 + 15;
        
        const x_ticks = time_axis_ticks_auto(min_t, max_t, 12);
        const day_formatter = (d) => {
            let day = DAYS_OF_WEEK[d.getDay()].toUpperCase();
            let month = MONTHS[d.getMonth()].substring(0, 3).toUpperCase();
            let date = d.getDate();
            return [`${month} ${date}`, `${day}`];
        };
        const month_formatter = (d) => {
            let month = MONTHS[d.getMonth()].substring(0, 3).toUpperCase();
            let year = d.getFullYear();
            return [month, year];
        };
        const year_formatter = (d) => {
            let year = d.getFullYear();
            return [year, ""];
        };

        const number_of_days = (max_t - min_t) / ONE_DAY; 
        x_tick_formatter = (x_tick_formatter !== undefined) ? x_tick_formatter
            : (number_of_days < 20) ? day_formatter
            : (number_of_days <= 700) ? month_formatter 
            : year_formatter;

        // getDatesBetween(new Date(min_t), new Date(max_t));
        svg.select("#time-plot-x-labels")
            .selectAll("text")
            .data(x_ticks)
            .join("text")
            .attr("x", (d) => x_scale(d))
            .attr("y", x_tick_line2)
            .text((d) => x_tick_formatter(new Date(d))[1]);
        svg.select("#time-plot-x-labels")
            .selectAll("text.day")
            .data(x_ticks)
            .join("text")
            .attr("x", (d) => x_scale(d))
            .attr("y", x_tick_line1)
            .text((d) => x_tick_formatter(new Date(d))[0]);

        // Annotations
        let path_annotations = annotations.filter((a) => a instanceof HorizontalLineAnnotation);
        let text_annotations = annotations.filter((a) => a instanceof TextAnnotation);
        let circle_annotations = annotations.filter((a) => a instanceof CircleAnnotation);
        let line_annotations = annotations.filter((a) => a instanceof LineAnnotation);
        svg.select("#horizontal-annotations")
            .selectAll("path")
            .data(path_annotations)
            .join("path")
            .attr("d", (d) => {
                const p0 = [x_scale(min_t), y_scale(d.y)];
                const p1 = [x_scale(max_t), y_scale(d.y)];
                return line_factory([p0, p1]);
            })
            .attr("fill", "none")
            .attr("stroke", "white")
            .attr("stroke-dasharray", 4);
        
        svg.select("#line-annotations")
            .selectAll("path")
            .data(line_annotations)
            .join("path")
            .attr("d", (d) => {
                const points = d.line_data.map(([x, y]) => 
                    [ x_scale(min_t + x * (max_t - min_t)),
                      y_scale(y) ]);
                return line_factory(points);
            })
            .attr("fill", "none")
            .attr("stroke", (d) => d.color)
            .attr("stroke-width", (d) => d.stroke_width)

        svg.select("#text-annotations")
            .selectAll("text")
            .data(text_annotations)
            .join("text")
            .attr("x", (d) => x_scale(min_t + d.x * (max_t - min_t)))
            .attr("y", (d) => y_scale(d.y))
            .attr("fill", "rgba(255, 255, 255, 0.6)")
            .attr("dominant-baseline", (d) => d.dominantBaseline)
            .attr("text-anchor", (d) => d.textAnchor)
            .text((d) => d.text);

        svg.select("#circle-annotations")
            .selectAll("circle")
            .data(circle_annotations)
            .join("circle")
            .attr("cx", (d) => x_scale(min_t + d.x * (max_t - min_t)) )
            .attr("cy", (d) => y_scale(d.y) )
            .attr("r", (d) => d.r)
            .attr("fill", (d) => d.color);

    }, [time, y]);

    return (
        <svg
            ref={svg_ref}
            overflow="visible"
            viewBox={`0 0 ${chart_width} ${chart_height}`}
            >

            <text
                x="0"
                y="-10"
                fill="white"
                >
                { chart_title }
            </text>

            <g transform={`translate(-70, ${0.50 * chart_height})`}>
                <text
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform="rotate(-90)"
                    fill="white"
                    >
                    { y_label }
                </text>
            </g>
            
            <g id="time-plot-y-labels"
                fill="white"
                dominantBaseline="middle"
                textAnchor="end"
                >
            </g>

            <g id="time-plot-x-labels"
                fill="white"
                dominantBaseline="hanging"
                textAnchor="middle"
                >
            </g>

            <g id="time-plot-axes">
                <line 
                    x1="0" 
                    y1={chart_height}
                    x2={chart_width}
                    y2={chart_height}
                    stroke="white"
                    strokeLinecap="square"
                    >
                </line>

                <line 
                    x1="0" 
                    y1="0"
                    x2="0"
                    y2={chart_height}
                    stroke="white"
                    strokeLinecap="square"
                    >
                </line>
            </g>

            <g id="horizontal-annotations"></g>
            <g id="vertical-annotations"></g>
            <g id="text-annotations"></g>
            <g id="circle-annotations"></g>
            <g id="line-annotations"></g>

        </svg>
    )
}

export default TimePlot;