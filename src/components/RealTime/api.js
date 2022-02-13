/////////////////////////////////////////////////
// Global constants here
const NEAR_SHORE_URL = "https://tepfsail50.execute-api.us-west-2.amazonaws.com/v1/report/ns-station-range";
const NASA_BUOY_URL = "https://tepfsail50.execute-api.us-west-2.amazonaws.com/v1/report/nasa-tb";

// These are the working stations at this time
const NEAR_SHORE_STATION_INFO = [
    { 'id': 2, 'station_name': 'Dollar Point' , "coords": [    39.184,   -120.093] },
    { 'id': 3, 'station_name': 'Glenbrook'    , "coords": [    39.088,   -119.942] },
    { 'id': 4, 'station_name': 'Homewood'     , "coords": [    39.090,   -120.161] },
    { 'id': 6, 'station_name': 'Rubicon'      , "coords": [    39.007,   -120.109] },
    { 'id': 7, 'station_name': 'Sand Harbor'  , "coords": [    39.201,   -119.931] },
    { 'id': 9, 'station_name': 'Tahoe City'   , "coords": [39.1555087, -120.18275] }
];

const NASA_BUOY_INFO = [
    { 'id': 1, 'station_name': 'tb1', "coords": [   39.153, -120.00033] },
    { 'id': 2, 'station_name': 'tb2', "coords": [39.109366, -120.01075] },
    { 'id': 3, 'station_name': 'tb3', "coords": [  39.1102, -120.07535] },
    { 'id': 4, 'station_name': 'tb4', "coords": [   39.155, -120.07216] }
];


const DATA_DISPLAYED = [
    { name: "Water Temperature", units: "° F" },
    { name: "Wave Height",       units: "Inches" },
    { name: "Wind Direction",    units: "Degrees" },
    { name: "Wind Speed",        units: "MPH" },
];

// Utility function that makes a CORS GET request to a url
async function get(url) {
    let request = await fetch(url, {
        method: "GET",
        mode: "cors",
        headers: {
            "Content-Type": "application/json"
        }
    });
    return await request.json();
}

// Utility function for getting the current date in UTC
function today(days) {
    days = days ? days : 0;
    console.log(days)
    let now = new Date();
    now = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const year = String(now.getUTCFullYear());
    const month = String(now.getUTCMonth() + 1).padStart(2, "0");
    const day = String(now.getUTCDate()).padStart(2, "0");
    return `${year}${month}${day}`;
}

/////////////////////////////////////////////////
// Station Objects
// - An object is a station if it implements the following
// 1. get_data() 2. get_display_data()
/////////////////////////////////////////////////

class Station {
    constructor(info, url) {
        this.url = url;
        this.info = info // id, name, coords
    }

    async get_data() {
        const url_obj = new URL(this.url);
        const params = { "id": this.info.id, "rptdate": today(3), "rptend": today()};
        url_obj.search = new URLSearchParams(params).toString();
        return get(url_obj);
    }
}

class NearShoreStation extends Station {
    async get_display_data() {
        const data = await this.get_data();
        const res = [];
        for (let datum of data) {
            res.push({
                "TimeStamp":         new Date(datum['TmStamp'] + " UTC"),
                "Water Temperature": Number.parseFloat(datum['LS_Temp_Avg']),
                "Wave Height":       Number.parseFloat(datum['WaveHeight'])
            });
            // Convert units
            res[res.length - 1]['Water Temperature'] = res[res.length - 1]['Water Temperature'] * 9 / 5 + 32; // C to F
            res[res.length - 1]['Wave Height'] *= 39.3701; // m to ft
        }
        return res;
    }
}

class NASABuoyStation extends Station {
    async get_display_data() {
        const data = await this.get_data();
        const res = [];
        for (let datum of data) {
            res.push({
                "TimeStamp":         new Date(datum['TmStamp'] + " UTC"),
                "Water Temperature": Number.parseFloat(datum['RBR_0p5_m']),
                "Wind Direction":    Number.parseFloat(datum['WindDir_1']),
                "Wind Speed":        Number.parseFloat(datum['WindSpeed_1'])
            });
            // Convert units
            res[res.length - 1]['Water Temperature'] = res[res.length - 1]['Water Temperature'] * 9 / 5 + 32;
            res[res.length - 1]['Wind Speed'] *= 2.23694; // ms to mph
        }
        return res;
    }
}

/////////////////////////////////////////////////////////
// Initialize stations
/////////////////////////////////////////////////////////

const NEAR_SHORE_STATIONS = [];
for (let i = 0; i < NEAR_SHORE_STATION_INFO.length; i++) 
    NEAR_SHORE_STATIONS.push( new NearShoreStation(NEAR_SHORE_STATION_INFO[i], NEAR_SHORE_URL) )

const NASA_BUOY_STATIONS = [];
for (let i = 0; i < NASA_BUOY_INFO.length; i++)
    NASA_BUOY_STATIONS.push( new NASABuoyStation(NASA_BUOY_INFO[i], NASA_BUOY_URL) )

const ALL_STATIONS = [...NEAR_SHORE_STATIONS, ... NASA_BUOY_STATIONS];

export { ALL_STATIONS, DATA_DISPLAYED };