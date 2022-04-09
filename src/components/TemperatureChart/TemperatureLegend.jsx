import { useEffect, useRef } from "react";
import { round } from "../util";

////////////////////////////////////
// Static Constants
////////////////////////////////////
const num_ticks = 15;

function TemperatureLegend(props) {
    const canvas_ref = useRef();
    const { color_palette, min_T, max_T } = props;

    useEffect(() => {
        const canvas = canvas_ref.current;
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        const cx = canvas.getContext('2d');

        // Create color bar
        let image_data = cx.createImageData(canvas.width, canvas.height);
        for (let j = 0; j < canvas.height; j++) {
            for (let i = 0; i < canvas.width; i++) {
                // Nearest Neighbor
                let T = (canvas.height - j) / canvas.height;

                let [r, g, b] = color_palette(T);
                let pixel_index = (j * (image_data.width * 4)) + (i * 4);

                image_data.data[pixel_index + 0] = r;
                image_data.data[pixel_index + 1] = g;
                image_data.data[pixel_index + 2] = b;
                image_data.data[pixel_index + 3] = 255;
            }
        }
        cx.putImageData(image_data, 0, 0);
    }, [color_palette]);

    const units = [];
    for (let i = 0; i < num_ticks; i++) {
        let percent = i / (num_ticks - 1);
        let temperature = min_T + (max_T - min_T) * percent;
        temperature = round(temperature);
        units.push(
            <div key={`legend-unit${i}`}
                className="temperature-legend-unit" 
                style={{"top": `${(1 - percent) * 100}%`}}>
                <div>{`${temperature} °F`}</div>
            </div>
        );
    }

    return (
        <div className="temperature-legend-container">
            <canvas ref={canvas_ref}></canvas>
            <div className="temperature-legend-units">
                { units }
            </div>
        </div>
    )
}

export default TemperatureLegend;