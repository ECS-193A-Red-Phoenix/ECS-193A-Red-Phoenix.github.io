import { useOutletContext } from "react-router-dom";
import { TercAPI } from "../../../js/forked/terc_api";
import StationChart from "./StationChart";
import MODULES from "../../../static/modules.json";
import { parse_time_range } from "../../../js/forked/util";
import TimePlot from "./TimePlot";


function WaveHeight(props) {
    const [_, module_container] = useOutletContext();

    const tab_index = module_container.tab_index;
    const bottom_tab_index = module_container.bottom_tab_index;
    const [chart_start_date, chart_end_date] = 
        parse_time_range(
            Object.values(MODULES.LAKE_CONDITIONS.TABS)[tab_index]
            .BOTTOM_TABS[bottom_tab_index]
            .time_range
        );

    const children = (station_data) => {
        const chart_props = {
            "y_label": "WAVE HEIGHT (FT)",
            "min_y": 0,
            "max_y": 3,
            "y_ticks": 7
        };
        let time = station_data.map(x => x[TercAPI.TIME_NAME]);
        let wave_height = station_data.map(x => x[TercAPI.WAVE_HEIGHT_NAME]);
        return <TimePlot
            time={time}
            y={wave_height}
            {...chart_props}
            />
    };

    return (
        <StationChart
            marker_data_type={TercAPI.WAVE_HEIGHT_NAME}
            children={children}
            start_date={chart_start_date}
            end_date={chart_end_date}
            />
    );
}

export default WaveHeight;