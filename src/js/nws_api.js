import { http_get, if_undefined, mean, wind_direction_mean } from "./util";

const base_url = "https://api.weather.gov/";
const tahoe_office = "REV"
const [tahoe_gx, tahoe_gy] = [33, 87];
const window_size = 3;                      // moving window size for averaging wind speed / direction
const KMH_TO_MS = 1000 / (60 * 60);         // km/h to m/s


export async function retrieve_wind_forecasts() {
    // Uses the national weather service api to retrieve wind forecasts data
    // See documentation here https://www.weather.gov/documentation/services-web-api
    // 
    // The national weather service returns a JSON object with a very specific format
    // See an example here https://api.weather.gov/gridpoints/REV/33,87 to give some
    //   context on how it is structured
    //
    // Returns:
    //  a time series array e.g. [{"time": Date Object, "values": [windSpeed, windDirection]}, ...]

    const url = `${base_url}gridpoints/${tahoe_office}/${tahoe_gx},${tahoe_gy}`;
    const headers = { "Accept": "application/geo+json" }
    
    let geo_json = await http_get(url, undefined, headers);

    // Extract properties
    if (!("properties" in geo_json))
        throw new Error("Properties not in NWS response", geo_json);
    geo_json = geo_json['properties'];

    // Extract wind data
    if (!("windSpeed" in geo_json && "windDirection" in geo_json))
        throw new Error("windSpeed or windDirection not in NWS response");

    let wind_speed = extract_time_series( geo_json['windSpeed']['values'] );
    wind_speed = average_time_series(wind_speed, window_size);
    // Convert wind speed from km/h to m/s
    wind_speed.values = wind_speed.values.map((ws) => ws * KMH_TO_MS)
    
    let wind_direction = extract_time_series( geo_json['windDirection']['values'] );
    wind_direction = average_time_series(wind_direction, window_size, true);

    return merge_time_series(wind_speed, wind_direction);
}

function average_time_series(t, window_size, use_cardinal_mean) {
    // Performs a moving average on a time series
    // Arguments:
    //  t: a time series object {"time": [...], "values": [...]}
    //  window_size: an integer, the size of the moving window
    //  use_cardinal_mean (optional, default=false): whether to use a cardinal mean
    if (window_size <= 0 || window_size > t.values.length)
        throw new Error("average_time_series(): Expected window size between 1 and values.length");
    use_cardinal_mean = if_undefined(use_cardinal_mean, false);
    
    // Perform average
    if (use_cardinal_mean)
        t.values = wind_direction_mean(t.values, window_size, 'deg');
    else
        t.values = mean(t.values, window_size);

    // Make sure time series is the same length as values
    t.time = t.time.slice(window_size - 1);
    if (t.time.length !== t.values.length)
        throw new Error("Expect time and values to have same length");
    
    return t;
}

function merge_time_series(t1, t2) {
    // Combines two time series into one. Discards all points that are not
    // shared by t1 and t2
    // Example:
    //  t1, t2: {"time": [ ... ], "values": [ ... ]}
    //  merged = [{"time": Date, "values": [t1.value0, t2.value0]}, ...]

    if (t1 === undefined || t2 === undefined)
        return [];

    let [t1_len, t2_len] = [ t1.time.length, t2.time.length ]; 
    let res = [];
    let t2_idx = 0;
    for (let t1_idx = 0; t1_idx < t1_len; t1_idx++) {
        let time1 = t1.time[t1_idx];
        let value1 = t1.values[t1_idx];

        while (t2_idx < t2_len && t2.time[t2_idx].getTime() < time1.getTime())
            t2_idx += 1;
        if (t2_idx >= t2.length)
            return res;

        let time2 = t2.time[t2_idx];
        let value2 = t2.values[t2_idx];
        if ( time1.getTime() === time2.getTime() ) {
            res.push({
                "time": time1,
                "values": [ value1, value2 ]
            });
        }
    }
    return res;
}

function extract_time_series(array) {
    // Helper function that extracts a time series from an array of objects 
    // with the following format
    // Arguments:
    //  array: an array of {"validTime": ..., "value": ...} Objects see below
    //       [{
    //           "validTime": "2022-04-11T14:00:00+00:00/PT1H",
    //           "value": 0.55555555555555558
    //       },
    //       {
    //           "validTime": "2022-04-11T15:00:00+00:00/PT6H",
    //           "value": 0
    //       },
    //       {
    //           "validTime": "2022-04-11T21:00:00+00:00/PT1H",
    //           "value": -1.1111111111111112
    //       }]
    // Returns:
    // { "time": [ Date Object ] , "values": [ Number ] }
    // the time difference between any two Dates is 1 hour
    if (array === undefined)
        return [];

    const HOUR = 60 * 60 * 1000;
    let time = [];
    let values = [];
    for (let { validTime, value } of array) {
        let [date, duration] = parse_interval(validTime);
        // Round date to nearest hour as a sanity check
        date = roundDateToHour(date);
        for (let i = 0; i < duration; i++) {
            time.push(date);
            values.push(value);
            date = new Date(date.getTime() + HOUR);
        }
    }
    
    return { "time": time, "values": values }
}

function parse_interval(interval) {
    // Utility function that parses an ISO 8601 date string with a duration of time.
    // Example:
    //   >>> let d = '2022-02-04T02:00:00+00:00/PT4H' // represents 4 hours starting from 2 am on 2022-02-04
    //   >>> parse_interval(d)
    //       [Date Object, 4]
    //
    // Expects duration to be formatted as `PTnHnMnS`.
    // See https://en.wikipedia.org/wiki/ISO_8601#Time_intervals to see how ISO 8601 
    // timestamps are formatted.
    // Arguments:
    //     interval (str): an ISO 8601 date string with an interval
    // Returns:
    //     [Date Object, an integer]: time and duration (in hours)
    const solidus = '/';
    if (!interval.includes(solidus))
        return [new Date(interval), 0];

    const is_digit = (letter) => /^\d$/.test(letter);
    let [date, duration] = interval.split(solidus);
    let hours = 0;
    let integer = 0;
    for (let letter of duration) {
        if (is_digit(letter))
            integer = 10 * integer + parseInt(letter);
        else if (letter === 'H') {
            hours += integer;
            integer = 0;
        } 
        else if (letter === 'M') {
            hours += Math.floor(integer / 60);
            integer = 0;
        }
        else if (letter === 'S') {
            hours += Math.floor(integer / 360);
            integer = 0;
        }
    }

    return [new Date(date), hours];
}

function roundDateToHour(date) {
    // Rounds date to nearest hour
    date.setMinutes(date.getMinutes() + 30);
    date.setMinutes(0, 0, 0);
    return date;
}