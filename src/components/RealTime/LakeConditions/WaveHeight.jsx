import { useOutletContext } from "react-router-dom";
import { TercAPI } from "../../../js/forked/terc_api";
import StationChart from "./StationChart";
import MODULES from "../../../static/modules.json";
import { parse_time_range } from "../../../js/forked/util";

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

    const chart_props = {
        "y_label": "WAVE HEIGHT (FT)",
        "min_y": 0,
        "max_y": 3,
        "y_ticks": 7
    };

    return (
        <StationChart
            data_type_name={TercAPI.WAVE_HEIGHT_NAME}
            chart_props={chart_props}
            start_date={chart_start_date}
            end_date={chart_end_date}
            />
    );
}

export default WaveHeight;