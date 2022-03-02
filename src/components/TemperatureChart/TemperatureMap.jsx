import { useEffect, useRef } from "react";
import { bicubic, bilinear } from "../particle";

////////////////////////////////////
// Static Constants
////////////////////////////////////

function TemperatureMap(props) {
    const canvas_ref = useRef();

    const [n_rows, n_cols] = [props.T.length, props.T[0].length];
    const aspect_ratio = n_cols / n_rows;
    const chart_width = props.height * aspect_ratio;
    const chart_height = props.height;
    let chart_x_s = (props.width - chart_width) / 2;
    if (props.width === undefined)
        chart_x_s = 0;

    useEffect(() => {
        let canvas = canvas_ref.current;
        let cx = canvas.getContext('2d');

        // Create image object
        // See https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Pixel_manipulation_with_canvas
        // For more details
        let image_data = cx.createImageData(chart_width, chart_height);
        for (let j = 0; j < chart_height; j++) {
            for (let i = 0; i < chart_width; i++) {
                let x = i / chart_width * n_cols;
                let y = j / chart_height * n_rows;
                let t_j = Math.floor(y);
                let t_i = Math.floor(x);
                if (typeof props.T[t_j][t_i] != 'number')
                    continue;

                // Bilinear    
                // let T = bilinear(x, y, props.T);

                // Nearest Neighbor
                let T = props.T[t_j][t_i];

                let [r, g, b] = props.color_palette(T);
                let pixel_index = (j * (image_data.width * 4)) + (i * 4);

                image_data.data[pixel_index + 0] = r;
                image_data.data[pixel_index + 1] = g;
                image_data.data[pixel_index + 2] = b;
                image_data.data[pixel_index + 3] = 255;
            }
        }
        cx.putImageData(image_data, 0, 0);

    }, [props.T]);
    
    return (
        <canvas ref={canvas_ref} width={chart_width} height={chart_height}></canvas>
    );
}

export default TemperatureMap;