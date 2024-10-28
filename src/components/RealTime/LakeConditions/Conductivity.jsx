import { useOutletContext } from "react-router-dom";
import "./LakeConditions.css"
import StationChart from "./StationChart";
import { TercAPI } from "../../../js/forked/terc_api";
import MODULES from "../../../static/modules.json";
import { parse_time_range } from "../../../js/forked/util";
import TimePlot from "./TimePlot";


function Conductivity(props) {
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
            "y_label": "CONDUCTIVITY (μS/cm)",
            "y_ticks": 7
        };
        let time = station_data.map(x => x[TercAPI.TIME_NAME]);
        let water_temp = station_data.map(x => x[TercAPI.CONDUCTIVITY_NAME]);
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
            marker_data_type={TercAPI.CONDUCTIVITY_NAME}
            children={children}
            start_date={chart_start_date}
            end_date={chart_end_date}
            />
    );
}

export default Conductivity;