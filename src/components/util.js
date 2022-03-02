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

export { if_undefined, round, reversed, colorFromHex, colorScale, celsius_to_f, mod };