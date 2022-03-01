import { useEffect, useRef } from "react"


function TemperatureLegend(props) {
    const canvas_ref = useRef()
    
    const canvas_width = 20;
    const canvas_height = props.height;

    useEffect(() => {
        const canvas = canvas_ref.current;
        const cx = canvas.getContext('2d');
        const get_color = props.color_palette;

        // Create color bar
        let image_data = cx.createImageData(canvas_width, canvas_height);
        for (let j = 0; j < canvas_height; j++) {
            for (let i = 0; i < canvas_width; i++) {
                // Nearest Neighbor
                let T = (canvas_height - j) / canvas_height;

                let [r, g, b] = get_color(T);
                let pixel_index = (j * (image_data.width * 4)) + (i * 4);

                image_data.data[pixel_index + 0] = r;
                image_data.data[pixel_index + 1] = g;
                image_data.data[pixel_index + 2] = b;
                image_data.data[pixel_index + 3] = 255;
            }
        }
        cx.putImageData(image_data, 0, 0);
    }, [props.color_palette, canvas_height]);

    const num_units = 8;
    const units = [];
    for (let i = 0; i < num_units; i++) {
        let percent = i / (num_units - 1);
        let temperature = props.min_T + (props.max_T - props.min_T) * percent;
        temperature = Math.floor(temperature * 10) / 10;
        units.push(
            <div key={`legend-unit${i}`} className="temperature-legend-unit" style={{"top": `${(1 - percent) * 100}%`}}>
                <div>{`${temperature} °F`}</div>
            </div>
        );
    }

    return (
        <div className="temperature-legend-container">
            <canvas ref={canvas_ref} width={canvas_width} height={canvas_height}></canvas>
            <div className="temperature-legend-units">
                { units }
            </div>
        </div>
    )
}

export default TemperatureLegend;