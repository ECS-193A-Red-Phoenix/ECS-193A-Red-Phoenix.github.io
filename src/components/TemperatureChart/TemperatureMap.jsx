import { useEffect, useRef } from "react";
import { draw_lake_heatmap, round } from "../util";
import { select, pointer } from "d3";

function TemperatureMap(props) {
    const canvas_ref = useRef();
    const T = props.T;

    const [n_rows, n_cols] = [props.T.length, props.T[0].length];
    const aspect_ratio = n_cols / n_rows;
    const chart_width = props.height * aspect_ratio;
    const chart_height = props.height;

    ////////////////////////////////////
    // Cursor Hover Event
    ////////////////////////////////////
    useEffect(() => {
        select(canvas_ref.current).on("mousemove", function (event) {
            const [x, y] = pointer(event);
            const [i, j] = [Math.floor(x / chart_width * n_cols), Math.floor(y / chart_height * n_rows)];
            if (i < 0 || i >= n_cols || j < 0 || j >= n_rows || isNaN(T[j][i])) {
                select(".temperature-cursor")
                    .style("display", "none");
                return;
            }        
            
            const [px, py] = [x / chart_width * 100, y / chart_height * 100];
            const temp = round(T[j][i]);
            select(".temperature-cursor")
                .style("display", "block")
                .style("left", `${px}%`)
                .style("top", `${py}%`)
                .text(`${temp} °F`);
        });
        select(canvas_ref.current).on("mouseleave", () => {
            select(".temperature-cursor")
                .style("display", "none");
        });
    }, [chart_height, chart_width, n_cols, n_rows, T]);

    ////////////////////////////////////
    // Draw Heatmap
    ////////////////////////////////////
    useEffect(() => {
        const canvas = canvas_ref.current;
        const cx = canvas.getContext('2d');
        const color_palette = props.color_palette;

        let start_time = Date.now();
        let cache_key = `temperature-${props.activeIdx}`;
        draw_lake_heatmap(cx, chart_width, chart_height, T, color_palette, 0, 0, cache_key);
        let end_time = Date.now();

        console.log(`Took ${end_time - start_time} ms to draw image`);
    }, [props.T, props.color_palette]);
    
    return (
        <div className="temperature-chart-container">
            <canvas ref={canvas_ref} width={chart_width} height={chart_height}></canvas>
            <div className="temperature-cursor"> Cursor </div>
        </div>
    );
}

export default TemperatureMap;