import { useOutletContext } from "react-router-dom";

import "./LakeConditions.css"
import StationChart from "./StationChart";
import { TercAPI } from "../../../js/forked/terc_api";
import MODULES from "../../../static/modules.json";
import { parse_time_range } from "../../../js/forked/util";


function Turbidity(props) {
    const [_, module_container] = useOutletContext();

    const bottom_tab_index = module_container.bottom_tab_index;
    const [chart_start_date, chart_end_date] = 
        parse_time_range(
            MODULES.LAKE_CONDITIONS.TABS.TURBIDITY
            .BOTTOM_TABS[bottom_tab_index]
            .time_range
        );

    const bottom_tab_name = MODULES.LAKE_CONDITIONS
        .TABS
        .TURBIDITY
        .BOTTOM_TABS[bottom_tab_index]
        .name;
        
    const data_type_name = (bottom_tab_name === "Historical") ? TercAPI.SECCHI_DEPTH_NAME : TercAPI.TURBIDITY_NAME;
    const chart_props = {
        "y_label": `${data_type_name.toUpperCase()} (NTU)`,
        "y_ticks": 7,
    };

    return (
        <StationChart
            data_type_name={data_type_name}
            chart_props={chart_props}
            start_date={chart_start_date}
            end_date={chart_end_date}
            />
    );
}

export default Turbidity;