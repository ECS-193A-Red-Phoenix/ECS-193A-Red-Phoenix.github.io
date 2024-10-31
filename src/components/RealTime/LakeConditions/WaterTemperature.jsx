import { useOutletContext } from "react-router-dom";
import "./LakeConditions.css"
import StationChart from "./StationChart";
import { TercAPI } from "../../../js/forked/terc_api";
import MODULES from "../../../static/modules.json";
import { parse_time_range } from "../../../js/forked/util";
import TimePlot from "./TimePlot";
import TCPlot from "../TCPlot";
import { today } from "../../../js/forked/util";


function WaterTemperature(props) {
    const [_, module_container] = useOutletContext();

    const tab_index = module_container.tab_index;
    const bottom_tab_index = module_container.bottom_tab_index;
    const [chart_start_date, chart_end_date] = 
        parse_time_range(
            Object.values(MODULES.LAKE_CONDITIONS.TABS)[tab_index]
            .BOTTOM_TABS[bottom_tab_index]
            .time_range
        );
        
    const children = (station_data, station) => {
        if (station.name === 'Homewood Thermistor Chain' && station_data.length > 0 && station_data[0]['Sensor0Depth'] !== undefined) {
            // filter to 3 days ago otherwise the plot will be too long
            let three_days_ago = today(-3);
            let filtered_data = station_data.filter((x) => three_days_ago < x[TercAPI.TIME_NAME]);
            let time = filtered_data.map(x => x[TercAPI.TIME_NAME]);
            let ctd_profiles = filtered_data.map((x) => {
                let temperature_depth_profile = []
                for (let i = 0; i <= 64; i++) {
                    let depth = x[`Sensor${i}Depth`]
                    let temperature = x[`Sensor${i}Temperature`]
                    if (depth === undefined || temperature === undefined)
                        break;
                    temperature_depth_profile.push([depth, temperature])
                }
                return temperature_depth_profile;
            });
            return <TCPlot
                        time={time}
                        ctd_profiles={ctd_profiles}
                        cache_id={"tc_plot"}
                        min_depth={0}
                        // max_depth is dynamic
                        min_T={40}
                        max_T={70}
                        />
        }
        const chart_props = {
            "y_label": "WATER TEMPERATURE (F)",
            "y_ticks": 7
        };
        let time = station_data.map(x => x[TercAPI.TIME_NAME]);
        let water_temp = station_data.map(x => x[TercAPI.WATER_TEMPERATURE_NAME]);
        return (
            <TimePlot
                time={time}
                y={water_temp}
                {...chart_props}
                />
        );
    };
    
    return (
        <StationChart
            marker_data_type={TercAPI.WATER_TEMPERATURE_NAME}
            children={children}
            start_date={chart_start_date}
            end_date={chart_end_date}
            />
    );
}

export default WaterTemperature;