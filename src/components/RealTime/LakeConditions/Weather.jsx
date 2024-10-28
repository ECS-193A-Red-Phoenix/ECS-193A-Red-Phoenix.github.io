import { useOutletContext } from "react-router-dom";
import { TercAPI } from "../../../js/forked/terc_api";
import StationChart from "./StationChart";
import MODULES from "../../../static/modules.json";
import { parse_time_range } from "../../../js/forked/util";
import TimePlot from "./TimePlot";
import WindChart from "./WindChart";
import { useMemo } from "react";


function Weather(props) {
    const [_, module_container] = useOutletContext();

    const tab_index = module_container.tab_index;
    const bottom_tab_index = module_container.bottom_tab_index;
    const current_tab = Object.values(MODULES.LAKE_CONDITIONS.TABS)[tab_index];
    const current_bottom_tab = current_tab.BOTTOM_TABS[bottom_tab_index];
    const [chart_start_date, chart_end_date] = parse_time_range(current_bottom_tab.time_range);

    const create_air_temperature_chart = (station_data) => {
        const chart_props = {
            "y_label": "AIR TEMPERATURE (F)",
            "y_ticks": 7
        };
        let time = station_data.map((x) => x[TercAPI.TIME_NAME]);
        let air_temp = station_data.map((x) => x[TercAPI.AIR_TEMPERATURE_NAME]);
        return (
            <TimePlot
                time={time}
                y={air_temp}
                {...chart_props}
                />
        );
    };

    const create_wind_chart = (station_data) => {
        let time = station_data.map((x) => x[TercAPI.TIME_NAME]);
        let wind_speed = station_data.map((x) => x[TercAPI.WIND_SPEED_NAME]);
        let wind_direction = station_data.map((x) => x[TercAPI.WIND_DIRECTION_NAME]);
        return (
            <div className="weather-dashboard">
                <WindChart
                    speed={wind_speed}
                    direction={wind_direction}
                    time={time}
                    />
            </div>
        );
    }

    const children = (time, station_data) => {
        if (current_bottom_tab.name === "Wind")
            return create_wind_chart(time, station_data)
        else if (current_bottom_tab.name === "Air Temperature")
            return create_air_temperature_chart(time, station_data)
    };

    // useMemo to prevent re-renders when the map markers state changes and is propagated down
    const chart = useMemo(() => {
        return <StationChart
            marker_data_type={current_bottom_tab.marker_data_type ?? "Wind Speed"}
            children={children}
            start_date={chart_start_date}
            end_date={chart_end_date}
            />
    }, [tab_index, bottom_tab_index])
    return (
        chart
    );
}

export default Weather;