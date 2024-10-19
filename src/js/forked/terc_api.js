import { apply, celsius_to_f, format_ymd, http_get, range, today } from "./util";
import DATA_STATIONS from "../../static/data_stations.json";
import { Mutex } from "async-mutex"

class TimedCache {
    constructor(expiration_time) {
        this.expiration_time = expiration_time;
        this.cache = {};
    }

    put(key, value) {
        this.cache[key] = {
            "value": value, 
            "time": Date.now()
        };
    }

    has(key) {
        if (!(key in this.cache))
            return false;
        
        const now = Date.now();
        const expired = (now - this.cache[key].time) >= this.expiration_time;
        return !expired;
    }

    get(key) {
        return this.cache[key].value;
    }

    get length() {
        return Object.keys(this.cache).length;
    }
}

class UnitConverter {
    static conversion_ratios = {
        "c": {
            "f": celsius_to_f
        },
        "m": {
            "ft": (m) => m * 3.28084
        },
    }

    static convert(value, units, converted_units) {
        if (units === converted_units)
            return value;
        
        if (!(units in UnitConverter.conversion_ratios &&
            converted_units in UnitConverter.conversion_ratios[units]))
            throw new Error(`Conversion from '${units}' to '${converted_units}' is not implemented`)

        return UnitConverter.conversion_ratios[units][converted_units](value);
    }
}

class Station {
    static TIME_UNTIL_REDOWNLOAD = 60 * 60 * 1000; // one hour

    constructor(url, data_types, name, coords) {
        this.url = url;
        this.name = name;
        this.coords = coords;
        this.data_types = data_types;
        this.download_cache = new TimedCache(Station.TIME_UNTIL_REDOWNLOAD);
        this.mutex = new Mutex();
    }

    has_data_type(data_type_name) {
        const data_type_index = this.data_types
            .findIndex((dt) => dt.name === data_type_name)
        return data_type_index !== -1;
    }

    get_data_type(data_type_name) {
        return this.data_types.find((dt) => dt.name === data_type_name);
    }

    async download_data(params, key) {
        // Fetches the raw JSON data from the Station URL
        // Arguments:
        // params (optional): params to add onto the get request
        // key (optional): a key to hash the download
        return this.mutex.runExclusive(async () => {
            params = params ?? {};
    
            // Return data if already downloaded
            if (this.download_cache.has(key))
                return this.download_cache.get(key);
    
            const json = await http_get(this.url, params); 
            this.download_cache.put(key, json);
            return json;
        });
    }

    // abstract
    async get_data(start_date, end_date, data_type_name) {
        throw new Error("get_data is not implemented for this class!");
    }

    async get_most_recent_data(start_date, end_date, data_type_name) {
        let data = await this.get_data(start_date, end_date, data_type_name);
        data = data[data_type_name];
        return data[data.length - 1];
    }
}

class DataStation extends Station {
    static TIME_KEY = "TmStamp";

    constructor(url, data_types, name, id, coords) {
        super(url, data_types, name, coords);
        this.id = id;
    }

    async download_data(start_date, end_date) {
        // Fetches the raw JSON data from the Station URL
        // Arguments:
        // start_date: a Date object, the start date of the data
        // end_date: a Date object, the end date of the data
        const start_date_str = format_ymd(start_date);
        const end_date_str = format_ymd(end_date);
        const key = `download_data-${start_date_str},${end_date_str}`;
        const params = {
            "id": this.id,
            "rptdate": start_date_str,
            "rptend": end_date_str
        };
        return await super.download_data(params, key);
    }

    async get_data(start_date, end_date, data_type_name) {
        if (!this.has_data_type(data_type_name))
            throw new Error(`Station '${this.name}' does not have data type '${data_type_name}'`);

        // Return data if already processed
        const key = `get_data-${format_ymd(start_date)},${format_ymd(end_date)},${data_type_name}`;
        if (this.download_cache.has(key)) {
            return this.download_cache.get(key);
        }

        const parseTmStamp = (date_string) => {
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

        const data_type = this.get_data_type(data_type_name);
        const raw_data = await this.download_data(start_date, end_date);
        const time = raw_data.map((datum) => parseTmStamp(datum[DataStation.TIME_KEY]));
        let data = raw_data.map((datum) => {
            let number = parseFloat(datum[data_type.key]);
            if (isNaN(number)) return 0;
            return number;
        });

        // Data Error Checking
        const data_has_nans = data.some(isNaN);
        if (data_has_nans) {
            this.download_cache.put(key, null);
            throw new Error(`Station '${this.name}' contains NaN data`)
        }
        if (time.length <= 2) {
            this.download_cache.put(key, null);
            throw new Error(`Station '${this.name}' doesn't contain enough data points (${time.length} data points)`);
        }

        // Convert units
        let current_units = data_type.key_units;
        let converted_units = data_type.name_units;
        data = data.map((x) => UnitConverter.convert(x, current_units, converted_units));

        let res = {
            [TercAPI.TIME_KEY]: time,
            [data_type_name]: data
        }
        this.download_cache.put(key, res);
        return res;
    }
}

class SotlStation extends Station {

    async download_data(year) {
        // Fetches the raw JSON data from the Station URL
        // Arguments:
        // year: a Number or String representing the calendar year of the data
        const key = `download_data-${year}`;
        const params = {
            "id": year,
        };
        const res = await super.download_data(params, key);
        return res[0];
    }

    async get_data(start_date, end_date, data_type_name) {
        if (!this.has_data_type(data_type_name))
            throw new Error(`Station '${this.name}' does not have data type '${data_type_name}'`);

        const start_date_year = start_date.getUTCFullYear();
        const end_date_year = end_date.getUTCFullYear();
        
        // Return data if already processed
        const key = `get_data-${start_date_year},${end_date_year},${data_type_name}`;
        if (this.download_cache.has(key)) {
            return this.download_cache.get(key);
        }

        const data_type = this.get_data_type(data_type_name);
        const keys = data_type.keys ?? [data_type.key];

        const dates = range(start_date_year, end_date_year + 1);
        let time = dates.map((year) => new Date(`${year}-01-01`));
        
        const raw_data = await Promise.all(
            dates.map((year) => this.download_data(year))
        );
        let data = raw_data.map((datum) => {
            const values = keys.map((key) => {
                let number = parseFloat(datum[key]);
                if (isNaN(number)) return 0;
                return number;
            });

            if (keys.length === 1) 
                return values[0];
            return values;
        });

        // Convert units
        const current_units = data_type.key_units;
        const converted_units = data_type.name_units;
        apply(data, (x) => UnitConverter.convert(x, current_units, converted_units));

        switch (data_type_name) {
            case TercAPI.MONTHLY_MAX_TEMPERATURE_NAME:
            case TercAPI.MONTHLY_MIN_TEMPERATURE_NAME:
            case TercAPI.MONTHLY_PRECIPITATION_NAME  :
                time = dates
                    .flatMap((year) => {
                        return range(1, 12 + 1)
                            .map((month) => {
                                month = `${month}`.padStart(2, "0")
                                return new Date(`${start_date_year}-${month}-05T00:00Z`)
                            });
                    });
                data = data.flat();
                time.push(new Date(`${start_date_year}-01-02T00:00Z`));
                data.push(0);
                break;
            default:
                throw Error(`Unexpected data type name ${data_type_name}!`);
        }

        let res = {
            [TercAPI.TIME_KEY]: time,
            [data_type_name]: data
        }
        this.download_cache.put(key, res);
        return res;
    }
}

////////////////////////////////////////////////////////////////
// Initialize Stations
////////////////////////////////////////////////////////////////

const STATIONS = Object.values(DATA_STATIONS)
    .flatMap(({URL, DATA_TYPES, STATIONS, STATION_TYPE}) => {
        return STATIONS
        .map(({name, id, coords}) => {
            switch (STATION_TYPE) {
                case "Sotl":
                    return new SotlStation(URL, DATA_TYPES, name, coords);
                case "Data":
                case undefined:
                    return new DataStation(URL, DATA_TYPES, name, id, coords);
                default:
                    throw new Error(`Unknown station type '${STATION_TYPE}'`)
            }
            });
    });

class TercAPI {
    static STATIONS = STATIONS;

    // Data type names
    static TIME_KEY                     = DataStation.TIME_KEY;
    static WAVE_HEIGHT_NAME             = "Wave Height";
    static WATER_TEMPERATURE_NAME       = "Water Temperature";
    static ALGAE_NAME                   = "Algae";
    static CLARITY_NAME                 = "Clarity";
    static LAKE_LEVEL_NAME              = "Lake Level";
    static RIVER_DISCHARGE_NAME         = "Discharge";
    static SECCHI_DEPTH_NAME            = "Secchi Depth";
    static MONTHLY_MAX_TEMPERATURE_NAME = "Monthly Max Temperature";
    static MONTHLY_MIN_TEMPERATURE_NAME = "Monthly Min Temperature";
    static MONTHLY_PRECIPITATION_NAME   = "Monthly Precipitation";

    static get_stations_with_data_type(data_type_name) {
        return STATIONS
            .filter((station) => station.has_data_type(data_type_name));
    }

    static get_stations_with_data_types(data_type_names) {
        return STATIONS
            .filter((station) => data_type_names.every((dt) => station.has_data_type(dt)))
    }
}

export { TercAPI };