import { celsius_to_f, http_get, interpolate, today, zip } from "./util";
import STATION_CONFIG from "../static/station_config.json";

function parseTmStamp(date_string) {
    // Parses a date string in the format "YYYY-MM-DD HH:MM:SS"
    // Arguments:
    //  date_string: a String, in the format "YYYY-MM-DD HH:MM:SS"

    // date_string is pretty close to an ISO 8601 timestamp
    // timestamp specification see below
    // https://262.ecma-international.org/5.1/#sec-15.9.1.15
    // Convert date_string to ISO 8601 timestamp
    date_string = date_string.trim();
    date_string = date_string.replace(" ", "T");
    date_string += "Z";

    return new Date(date_string);
}

class Station {
    // days of data to retrieve from TERC API's
    static DAYS_OF_DATA = 3;  

    constructor(name, location_name, url, data_types) {
        this.name = name;
        this.location_name = location_name;
        this.url = url;
        this.data_types = data_types;
        this.data = undefined;
    }

    async get_data(extra_params) {
        // Fetches the raw JSON data from the Station URL
        // Arguments:
        // extra_params (optional): params to add onto the get request
        extra_params = extra_params ?? {};

        const format_date = (date) => {
            // Formats date to a "YYYYMMDD" string 
            const year = String(date.getUTCFullYear());
            const month = String(date.getUTCMonth() + 1).padStart(2, "0");
            const day = String(date.getUTCDate()).padStart(2, "0");
            return `${year}${month}${day}`;
        }

        const start_date = today(Station.DAYS_OF_DATA);
        const end_date = today();
        const params = { 
            "rptdate": format_date(start_date), 
            "rptend": format_date(end_date) 
        };
        Object.assign(params, extra_params);
        
        const json = await http_get(this.url, params); 
        return json;
    }

    data_loading() {
        return this.data === undefined;
    }

    data_unavailable() {
        return this.data === null;
    }

    data_available() {
        return !this.data_loading() && !this.data_unavailable();
    }
}

class NearShoreStation extends Station {
    static URL = STATION_CONFIG.NEAR_SHORE.URL;
    static DATA_TYPES = STATION_CONFIG.NEAR_SHORE.DATA_TYPES;
    
    constructor(name, location_name, id) {
        super(name, location_name, NearShoreStation.URL, NearShoreStation.DATA_TYPES);
        this.id = id;
    }

    async get_display_data() {
        const data = await this.get_data({ "id": this.id });
        const res = [];
        for (let datum of data) {
            res.push({
                "TimeStamp":         parseTmStamp(datum["TmStamp"]),
                "Water Temperature": Number.parseFloat(datum["LS_Temp_Avg"]),
                "Wave Height":       Number.parseFloat(datum["WaveHeight"])
            });
            // Convert units
            res[res.length - 1]["Water Temperature"] = celsius_to_f(res[res.length - 1]["Water Temperature"]);
            res[res.length - 1]["Wave Height"] *= 3.28084; // m to ft
        }
        this.data = res;
        return res;
    }
}

class NASABuoyStation extends Station {
    static URL = STATION_CONFIG.NASA_BUOYS.URL;
    static DATA_TYPES = STATION_CONFIG.NASA_BUOYS.DATA_TYPES;

    constructor(name, location_name, id) {
        super(name, location_name, NASABuoyStation.URL, NASABuoyStation.DATA_TYPES);
        this.id = id;
    }

    async get_display_data() {
        const data = await this.get_data({ "id": this.id });
        const res = [];
        for (let datum of data) {
            res.push({
                "TimeStamp":         parseTmStamp(datum["TmStamp"]),
                "Water Temperature": Number.parseFloat(datum["RBR_0p5_m"]),
                "Wind Direction":    Number.parseFloat(datum["WindDir_1"]),
                "Wind Speed":        Number.parseFloat(datum["WindSpeed_1"])
            });
            // Convert units
            let last_idx = res.length - 1;
            res[last_idx]["Water Temperature"] = res[last_idx]["Water Temperature"] * 9 / 5 + 32; // C to F
            res[last_idx]["Wind Speed"] *= 2.23694; // ms to mph

            // Combine Wind Speed and Wind Dir into one datum
            res[last_idx]["Wind"] = [res[last_idx]["Wind Speed"], res[last_idx]["Wind Direction"]];
            delete res[last_idx]["Wind Speed"];
            delete res[last_idx]["Wind Direction"];
        }
        this.data = res;
        return res;
    }
}

/////////////////////////////////////////////////////////
// Initialize Nearshore and NASA stations
/////////////////////////////////////////////////////////

const NEAR_SHORE_STATIONS = STATION_CONFIG.NEAR_SHORE.STATIONS
.map(({name, location_name, id}) => new NearShoreStation(name, location_name, id));

const NASA_BUOY_STATIONS = STATION_CONFIG.NASA_BUOYS.STATIONS
.map(({name, location_name, id}) => new NASABuoyStation(name, location_name, id));

/////////////////////////////////////////////////////////

class HWTCStation extends Station {
    static URL = STATION_CONFIG.TEMPERATURE_CHAIN.URL;
    static DATA_TYPES = STATION_CONFIG.TEMPERATURE_CHAIN.DATA_TYPES;
    static HOMEWOOD = NEAR_SHORE_STATIONS.find((station) => station.name === "Homewood");
    static HOMEWOOD_DEPTH = 0.5; // meters

    // Actual measurements of the temperature chain
    static dimensions = {
        "P1": 2.5,
        "C1": 2.5,
        "L16": 2.5,
        "L15": 7.5,
        "L14": 12.5,
        "L13": 17.5,
        "L12": 27.5,
        "L11": 37.5,
        "L10": 47.5,
        "L9": 57.5,
        "L8": 67.5,
        "L7": 72.5,
        "L6": 77.5,
        "L5": 82.5,
        "L4": 87.5,
        "L3": 92.5,
        "L2": 97.5,
        "L1": 102.5,
        "C2": 5
    }

    // ID #"s of the sensors on the TC
    static tc_sensor_ids = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

    static get_depth(tc_depth, tc_sensor_id) {
        // Returns the depth of a particular sensor
        // Arguments:
        //  tc_depth: the depth of the temperature chain
        //  tc_sensor_id: an Integer in [1, 16], the ID of the temperature sensor
        return tc_depth - HWTCStation.dimensions.P1 - HWTCStation.dimensions[`L${tc_sensor_id}`];
    }    

    constructor(name, location_name) {
        super(name, location_name, HWTCStation.URL, HWTCStation.DATA_TYPES);
    }

    async get_display_data() {
        const hwtc_data = await this.get_data();
        const res = [];

        // Process HWTC Data
        for (let datum of hwtc_data) {
            let date = parseTmStamp(datum["TmStamp"]);

            // Extract depths
            let tc_depth = parseFloat(datum["Depth_m4C_Avg"]);
            let depths = HWTCStation.tc_sensor_ids
                .map((id) => HWTCStation.get_depth(tc_depth, id));

            // Extract temperature
            let temperatures = HWTCStation.tc_sensor_ids
                .map((id) => {
                    const tc_name = `LS_T${id}_Avg`;
                    let T = parseFloat(datum[tc_name]);
                    T = celsius_to_f(T);
                    return T;
                });

            res.push({
                "TimeStamp": date,
                "Thermistor Chain": zip(depths, temperatures)
            });
        }

        // Add on Homewood data to result
        const hw_data = await HWTCStation.HOMEWOOD.get_display_data();
        const hwtc_times = res.map((x) => x["TimeStamp"].getTime());
        const hw_time = hw_data.map((x) => x["TimeStamp"].getTime());
        const hw_temp = hw_data.map((x) => x["Water Temperature"]);
        const hwtc_surface = interpolate(hwtc_times, hw_time, hw_temp);
        let last_idx_hwtc = res.length - 1;
        if ( isNaN(hwtc_surface[last_idx_hwtc]) ) {
            alert("Homewood is NaN value")
        }
        else {  
            res.forEach((datum, idx) => {
                // Add a [depth, temperature] tuple to the beginning of the datum
                let hw_td = [ 
                    HWTCStation.HOMEWOOD_DEPTH,
                    hwtc_surface[idx]
                ];
                datum["Thermistor Chain"].unshift(hw_td);
            });
        }

        this.data = res;
        return res;
    }
}

/////////////////////////////////////////////////////////
// Initialize HWTC Station
/////////////////////////////////////////////////////////

const HWTC_STATIONS = STATION_CONFIG.TEMPERATURE_CHAIN.STATIONS
.map(({name, location_name}) => new HWTCStation(name, location_name));

/////////////////////////////////////////////////////////

// Exports
const STATIONS = [...NEAR_SHORE_STATIONS, ...NASA_BUOY_STATIONS, ...HWTC_STATIONS];

export { STATIONS };