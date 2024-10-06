import { useOutletContext } from "react-router-dom";
import "./LakeConditions.css"
import StationChart from "./StationChart";
import { TercAPI } from "../../../js/forked/terc_api";
import MODULES from "../../../static/modules.json";
import { parse_time_range } from "../../../js/forked/util";


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

    const chart_props = {
        "y_label": "WATER TEMPERATURE (F)",
        "y_ticks": 7
    };
    
    return (
        <StationChart
            data_type_name={TercAPI.WATER_TEMPERATURE_NAME}
            chart_props={chart_props}
            start_date={chart_start_date}
            end_date={chart_end_date}
            />
    );
}

export default WaterTemperature;