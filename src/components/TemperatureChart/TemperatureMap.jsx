import { useEffect, useRef } from "react";
import { bilinear } from "../particle";
import { points_in_lake_tahoe, point_in_lake_tahoe } from "../util";

////////////////////////////////////
// Static Constants
////////////////////////////////////

function TemperatureMap(props) {
    const canvas_ref = useRef();

    const [n_rows, n_cols] = [props.T.length, props.T[0].length];
    const aspect_ratio = n_cols / n_rows;
    const chart_width = props.height * aspect_ratio;
    const chart_height = props.height;

    useEffect(() => {
        let canvas = canvas_ref.current;
        let cx = canvas.getContext('2d');

        // Create image object
        // See https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Pixel_manipulation_with_canvas
        // For more details
        let start_time = Date.now();
        let image_data = cx.createImageData(chart_width, chart_height);
        let points_in_lake = points_in_lake_tahoe(chart_width, chart_height);
        for (let [i, j] of points_in_lake) {
            let x = i / chart_width * n_cols;
            let y = j / chart_height * n_rows;
            let t_j = Math.floor(y);
            let t_i = Math.floor(x);

            const pixel_index = (j * (image_data.width * 4)) + (i * 4);
            let T = 0;
            
            // if this pixel is inside the lake but not defined by the temperature matrix
            // let it's temperature be the average of its defined neighbors
            if (typeof props.T[t_j][t_i] !== 'number') {
                T = 0;
                let count = 0;
                // Average Temperature of neighboring pixels
                for (let m = 0; m < 3; m++)
                    for (let n = 0; n < 3; n++) {
                        if (0 <= t_j - 1 + m && t_j - 1 + m < n_rows && 
                            0 <= t_i - 1 + n && t_i - 1 + n < n_cols && 
                            typeof props.T[t_j - 1 + m][t_i - 1 + n] === 'number') {
                            T += props.T[t_j - 1 + m][t_i - 1 + n];
                            count += 1;
                        }
                    }
                if (count > 0)
                    T /= count;
            }
                
            // Nearest Neighbor
            // T = props.T[t_j][t_i];
            T = bilinear(x, y, props.T, T);

            let [r, g, b] = props.color_palette(T);
            image_data.data[pixel_index + 0] = r;
            image_data.data[pixel_index + 1] = g;
            image_data.data[pixel_index + 2] = b;
            image_data.data[pixel_index + 3] = 255;
        }
        cx.putImageData(image_data, 0, 0);
        let end_time = Date.now();
        console.log(`Took ${end_time - start_time} ms to draw image`);
    }, [props.T]);
    
    return (
        <canvas ref={canvas_ref} width={chart_width} height={chart_height}></canvas>
    );
}

export default TemperatureMap;