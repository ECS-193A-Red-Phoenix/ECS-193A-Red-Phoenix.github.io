//////////////////////////////////
// Utility
//////////////////////////////////

export function if_undefined(x, my_default) {
    return (x === undefined) ? my_default : x;
}

export function reversed(arr) {
    let res = [];
    for (let j = arr.length - 1; j > -1; j--)
        res.push(arr[j]);
    return res;
}

export function round(x, decimals) {
    // Rounds x to the nearest decimal place
    // Arguments
    //  x: a Number
    //  decimals (optional, default=0): the number of decimal places to round to
    if (decimals === undefined)
        decimals = 0;
    return Math.floor(x * 10**decimals) / 10**decimals;
}

export function colorFromHex(hex_code) {
    let res = [];
    let start_index = (hex_code[0] === '#') ? 1 : 0;
    for (let i = start_index; i < hex_code.length; i += 2)
        res.push(Number.parseInt(hex_code.substring(i, i + 2), 16));
    return res;
}

export function colorScale(colors, discrete) {
    // returns a function that maps a percent in [0, 1] to a range of colors
    // Arguments:
    //  colors: an array of 3-length rgb arrays (e.g [[0, 0, 0], [255, 255, 0]])
    //  discrete (optional, default=false): whether to create a discrete color map
    if (discrete === undefined)
        discrete = false;
    return (percent) => {
        if (percent <= 0)
            return colors[0];
        if (percent >= 1.0)
            return colors[colors.length - 1];
        let color_index = Math.floor(percent * (colors.length - 1)); 
        let c1 = colors[color_index];
        let c2 = colors[color_index + 1];
        if (discrete) {
            return c1;
        }
        
        // Linearly interpolate between c1 and c2
        let c1_percent = color_index / (colors.length - 1);
        let c2_percent = (color_index + 1) / (colors.length - 1);
        percent = (percent - c1_percent) / (c2_percent - c1_percent);
        let res = [];
        for (let i = 0; i < c1.length; i++)
            res.push(Math.floor(c1[i] + (c2[i] - c1[i]) * percent))
        return res;
    }
}
 
// Colors taken from https://github.com/Kitware/ParaView/blob/6777e1303f9d1eb341131354616241dbc5851340/Wrapping/Python/paraview/_colorMaps.py#L1599
export const ice_to_fire = colorScale(
    [[0, 0, 0], [0, 30, 77], [0, 55, 134], [14, 88, 168], [32, 126, 184], [48, 164, 202], [83, 200, 223],
    [155, 228, 239], [225, 233, 209], [243, 213, 115], [231, 176, 0], [218, 130, 0], [198, 84, 0],
    [172, 35, 0], [130, 0, 0], [76, 0, 0], [4, 0, 0]]
);

export const dark_ocean = colorScale(
    ["010108","000240","22226b","37377d","2C6FC7"].map(colorFromHex)
);

export function celsius_to_f(c) {
    return c * (9 / 5) + 32;
}

export function mod(a, b) {
    // Return a mod b; % is not the modulo operator in JS, see
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Remainder
    return ((a % b) + b) % b;
}

export function parseMyDate(date_string) {
    // This function parses a UTC date in the format YYYY-MM-DD HH
    const year  = date_string.substring( 0,  4);
    const month = date_string.substring( 5,  7);
    const day   = date_string.substring( 8, 10);
    const hour  = date_string.substring(11, 13);
    return new Date(Date.parse(`${year}-${month}-${day}T${hour}:00Z`));
}

export function point_in_polygon(point, polygon) {
    // returns true if the point is inside the given polygon
    // To do this, I implement the ray-casting algorithm shown here:
    // https://rosettacode.org/wiki/Ray-casting_algorithm
    //
    // Arguments:
    //  point: an array of size 2 [x, y]
    //  polygon: an array containing x, y pairs [[x1, y1], [x2, y2], ...]

    const epsilon = 0.0001;
    function ray_intersects_segment(p1, p2) {
        // returns 1 if eastward ray from point intersects line segment p1 -> p2
        // for a mathematical explanation see https://www.desmos.com/calculator/fjmvdmryje
        // avoid ray on vertex problem by shifting point up
        let [x, y] = point;
        if (y === p1[1] || y === p2[1])
            y += epsilon;

        const dy = p2[1] - p1[1];
        if (dy === 0)
            return 0;

        const t_p = (y - p1[1]) / dy;
        const t_r = p1[0] + (p2[0] - p1[0]) * t_p - x;
        if (t_r >= 0 && 0 <= t_p && t_p <= 1)
            return 1;
        return 0;
    }

    let count = 0;
    for (let i = 1; i < polygon.length; i++) {
        let prev = polygon[i - 1];
        let cur = polygon[i];
        count += ray_intersects_segment(prev, cur);
    }
    count += ray_intersects_segment(polygon[polygon.length - 1], polygon[0]);

    return count % 2 === 1;
}

// Bilinear Interpolation on a grid
// See https://en.wikipedia.org/wiki/Bilinear_interpolation
export function bilinear(x, y, grid, default_value) {
    if (default_value === undefined)
        default_value = 0;
    let n_rows = grid.length;
    let n_cols = grid[0].length;
    let i = Math.floor(x);
    let j = Math.floor(y);
    let get_grid = (j, i) => (i >= 0 && i < n_cols && j >= 0 && j < n_rows && typeof grid[j][i] === 'number') ? grid[j][i] : undefined;
    let f00 = if_undefined(get_grid(j, i), default_value);
    let f10 = if_undefined(get_grid(j, i + 1), f00);
    let f01 = if_undefined(get_grid(j + 1, i), f00);
    let f11 = if_undefined(get_grid(j + 1, i + 1), f00);
    x -= i;
    y -= j;
    return f00 + (f10 - f00) * x + (f01 - f00) * y + (f11 - f10 - f01 + f00) * x * y;
}

// Cache point in lake tahoe for performance boost
const point_lake_cache = {};
const shoreline_path = require('./shoreline.json');
export function point_in_lake_tahoe(point) {
    // returns true if the point exists within the boundaries of lake tahoe
    // Arguments
    //  point: an array of size 2 [x, y] with both 0 <= x, y <= 1
    const p_string = String(point);
    if (p_string in point_lake_cache)
        return point_lake_cache[p_string];
    const res = point_in_polygon(point, shoreline_path);
    point_lake_cache[p_string] = res;
    return res;
}

// Cache for performance boost
const lake_points_cache = {};
export function points_in_lake_tahoe(width, height) {
    // returns a list [(x, y), ...] of coordinates in lake tahoe
    //  within the bounds of the rectangle (0, 0, width, height) 
    // Arguments
    //  width: width of rectangle
    //  height: height of rectangle
    const key = `${width}_${height}`;
    if (key in lake_points_cache)
        return lake_points_cache[key];
    const res = [];
    for (let j = 0; j < height; j++)
        for (let i = 0; i < width; i++)
            if (point_in_lake_tahoe([i / width, 1 - j / height]))
                res.push([i, j])
    lake_points_cache[key] = res;
    return res;
}

export function draw_lake_tahoe(cx, x, y, width, height) {
    // draws a closed polygon of lake tahoe using the given context
    // Arguments:
    //  cx: HTML Canvas 2D context
    //  x: x coordinate of the top left corner of where to draw polygon
    //  y: y coordinate of the top left corner of where to draw polygon
    //  width: width of the polygon to draw
    //  height: height of the polygon to draw
    cx.beginPath();
    let [x_poly_start, y_poly_start] = shoreline_path[0];
    cx.moveTo(x + x_poly_start * width, y + (1 - y_poly_start) * height)
    for (let i = 1; i < shoreline_path.length; i++) {
        let [x_poly, y_poly] = shoreline_path[i];
        cx.lineTo(x + x_poly * width, y + (1 - y_poly) * height);
    }
    cx.lineTo(x + x_poly_start * width, x + (1 - y_poly_start) * height);
    cx.fill();
}

const heatmap_cache = {};
export function draw_lake_heatmap(cx, width, height, heatmap_data, color_palette, offsetX, offsetY, key) {
    // draws a heatmap of lake tahoe using the given context
    // Arguments:
    //  cx: HTML Canvas 2d context
    //  width: the width of the heatmap
    //  height: the height of the heatmap
    //  heatmap_data: a 2D matrix with scalar values
    //  offsetX (optional): starting x coordinate of where to draw the heatmap, default is 0
    //  offsetY (optional): starting y coordinate of where to draw the heatmap, default is 0
    //  key (optional): a string hash for the heatmap data, used in caching image creation for performance boost

    if (offsetX === undefined) offsetX = 0;
    if (offsetY === undefined) offsetY = 0;

    const [n_rows, n_cols] = [heatmap_data.length, heatmap_data[0].length];
    const T = heatmap_data;

    if (key in heatmap_cache) {
        const image_data = heatmap_cache[key];
        cx.putImageData(image_data, offsetX, offsetY);
        return;
    }

    // Create image object
    // See https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Pixel_manipulation_with_canvas
    // For more details
    const image_data = cx.createImageData(width, height);
    const points_in_lake = points_in_lake_tahoe(width, height);
    for (let [i, j] of points_in_lake) {
        let x = i / width * n_cols;
        let y = j / height * n_rows;
        let t_j = Math.floor(y);
        let t_i = Math.floor(x);

        const pixel_index = (j * (image_data.width * 4)) + (i * 4);
        let val = 0;
        
        // if this pixel is inside the lake but not defined by the heatmap matrix
        // let it's value be the average of its defined neighbors
        if (typeof T[t_j][t_i] !== 'number') {
            val = 0;
            let count = 0;
            // Average Temperature of neighboring pixels
            for (let m = 0; m < 3; m++)
                for (let n = 0; n < 3; n++) {
                    if (0 <= t_j - 1 + m && t_j - 1 + m < n_rows && 
                        0 <= t_i - 1 + n && t_i - 1 + n < n_cols && 
                        typeof T[t_j - 1 + m][t_i - 1 + n] === 'number') {
                        val += T[t_j - 1 + m][t_i - 1 + n];
                        count += 1;
                    }
                }
            if (count > 0)
                val /= count;
        }
        else {
            // Nearest Neighbor
            val = T[t_j][t_i];
        }
        // Smooth with bilinear interpolation
        val = bilinear(x, y, T, val);

        let [r, g, b] = color_palette(val);
        image_data.data[pixel_index + 0] = r;
        image_data.data[pixel_index + 1] = g;
        image_data.data[pixel_index + 2] = b;
        image_data.data[pixel_index + 3] = 255;
    }
    cx.putImageData(image_data, offsetX, offsetY);
    if (key !== undefined)
        heatmap_cache[key] = image_data;
}

export function militaryHourTo12Hour(hour) {
    // converts military hour to the 12 hour format
    // For a math explanation see https://www.desmos.com/calculator/xqlinlqtns
    // Arguments:
    //  hour: an integer between 0 and 24
    return mod(hour - 1, 12) + 1;
}