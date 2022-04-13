import { apply } from "../util";

const base_url = "/api/waveheight/";
const METER_TO_FEET = 3.28084;

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

    let url = `${base_url}${wind_speed},${wind_direction}`;
    let wh_data = await fetch(url, {
        method: "GET",
        mode: "same-origin",
        headers: {
            "Content-Type": 'application/json'
        }
    });
    wh_data = await wh_data.json();

    if (wh_data === undefined || !('data' in wh_data))
        throw new Error("Retrieved wave height matrix, but it's in an unexpected format");

    wh_data = wh_data['data'];

    // Convert wave height from meters to feet
    apply(wh_data, (x) => x * METER_TO_FEET);
    
    wh_cache[key] = wh_data;
    console.log("retrieved", key);
    return wh_data;
}