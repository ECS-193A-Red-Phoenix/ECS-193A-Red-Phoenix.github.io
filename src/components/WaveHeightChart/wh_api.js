import { apply } from "../util";

const base_url = "https://lake-tahoe-conditions.s3.us-west-2.amazonaws.com/";
const METER_TO_FEET = 3.28084;

/* Wave Heights are stored in Amazon S3
*
* Each file located at the base url is formatted in as
    'H_ws{x}_wd{y}.json' where x and y are wind speed and wind direction 
    wind speed is in m/s rounded to integer in [0, 1, 2, ... 20]
    wind direction is in degrees rounded to the nearest multiple of 5 in [0, 5, 10, ... 360]
    
    Example: waveheight/H_ws4_wd25.json => ws = 4 m/s, wd = 25 deg
 *
 */

const wh_cache = {};

export async function retrieve_wh(wind_speed, wind_direction) {
    // Retrieves a wave height matrix from our api
    // Arguments:
    //  wind_speed: wind speed in m/s
    //  wind_direction: wind direction in degrees, following meteorological convention
    const key = `${wind_speed},${wind_direction}`;
    if (key in wh_cache) {
        console.log("Using cached value for", key);
        return wh_cache[key];
    }

    // Round down to multiple of 1, and 5
    let ws = Math.floor(wind_speed);
    let wd = Math.floor(wind_direction / 5) * 5;

    let url = `${base_url}waveheight/H_ws${ws}_wd${wd}.json`;
    let wh_data = await fetch(url, {
        method: "GET",
        mode: "cors"
    });
    wh_data = await wh_data.json();

    // Convert wave height from meters to feet
    apply(wh_data, (x) => x * METER_TO_FEET);
    
    wh_cache[key] = wh_data;
    return wh_data;
}