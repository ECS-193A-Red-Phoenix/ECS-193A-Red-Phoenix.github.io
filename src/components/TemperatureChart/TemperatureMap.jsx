import { useEffect, useRef } from "react";
import { draw_lake_heatmap } from "../util";

function TemperatureMap(props) {
    const canvas_ref = useRef();

    const [n_rows, n_cols] = [props.T.length, props.T[0].length];
    const aspect_ratio = n_cols / n_rows;
    const chart_width = props.height * aspect_ratio;
    const chart_height = props.height;

    useEffect(() => {
        const canvas = canvas_ref.current;
        const cx = canvas.getContext('2d');
        const T = props.T;
        const color_palette = props.color_palette;

        let start_time = Date.now();
        let cache_key = `temperature-${props.activeIdx}`;
        draw_lake_heatmap(cx, chart_width, chart_height, T, color_palette, 0, 0, cache_key);
        let end_time = Date.now();

        console.log(`Took ${end_time - start_time} ms to draw image`);
    }, [props.T, props.color_palette]);
    
    return (
        <canvas ref={canvas_ref} width={chart_width} height={chart_height}></canvas>
    );
}

export default TemperatureMap;