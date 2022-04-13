const base_url = "/api/waveheight/";

export async function retrieve_wh(wind_speed, wind_direction) {
    // Retrieves a wave height matrix from our api
    // Arguments:
    //  wind_speed: wind speed in m/s
    //  wind_direction: wind direction in degrees, following meteorological convention
    
    let url = `${base_url}${wind_speed},${wind_direction}`;
    console.log(url);
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
    return wh_data['data'];
}