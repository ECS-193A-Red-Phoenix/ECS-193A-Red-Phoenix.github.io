//////////////////////////////////
// Utility
//////////////////////////////////

function if_undefined(x, my_default) {
    return (x === undefined) ? my_default : x;
}

function reversed(arr) {
    let res = [];
    for (let j = arr.length - 1; j > -1; j--)
        res.push(arr[j]);
    return res;
}

function round(x, decimals) {
    if (decimals === undefined)
        decimals = 0;
    return Math.floor(x * 10**decimals) / 10**decimals;
}

function colorFromHex(hex_code) {
    let res = [];
    let start_index = (hex_code[0] === '#') ? 1 : 0;
    for (let i = start_index; i < hex_code.length; i += 2)
        res.push(Number.parseInt(hex_code.substring(i, i + 2), 16));
    return res;
}

function colorScale(...colors) {
    return (percent) => {
        if (percent <= 0)
            return colors[0];
        if (percent >= 1.0)
            return colors[colors.length - 1];
        let color_index = Math.floor(percent * (colors.length - 1)); 
        let c1 = colors[color_index];
        let c2 = colors[color_index + 1];
        // return c1; // Return here for a discrete color map
        
        let c1_percent = color_index / (colors.length - 1);
        let c2_percent = (color_index + 1) / (colors.length - 1);
        percent = (percent - c1_percent) / (c2_percent - c1_percent);
        let res = [];
        for (let i = 0; i < c1.length; i++)
            res.push(Math.floor(c1[i] + (c2[i] - c1[i]) * percent))
        return res;
    }
}

function celsius_to_f(c) {
    return c * (9 / 5) + 32;
}

function mod(a, b) {
    // Return a mod b; % is not the modulo operator in JS, see
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Remainder
    return ((a % b) + b) % b;
}

function parseMyDate(date_string) {
    // This function parses a UTC date in the format YYYY-MM-DD HH
    const year  = date_string.substring( 0,  4);
    const month = date_string.substring( 5,  7);
    const day   = date_string.substring( 8, 10);
    const hour  = date_string.substring(11, 13);
    return new Date(Date.parse(`${year}-${month}-${day}T${hour}:00Z`));
}

function point_in_polygon(point, polygon) {
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


// Cache point in lake tahoe for performance boost
const point_lake_cache = {};
const shoreline_path = require('./shoreline.json');
function point_in_lake_tahoe(point) {
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
function points_in_lake_tahoe(width, height) {
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

function draw_lake_tahoe(cx, x, y, width, height) {
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

export { if_undefined, round, reversed, colorFromHex,
    colorScale, celsius_to_f, mod, parseMyDate, 
    point_in_lake_tahoe, points_in_lake_tahoe, draw_lake_tahoe
};