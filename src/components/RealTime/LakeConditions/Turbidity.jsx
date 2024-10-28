import { useOutletContext } from "react-router-dom";

import "./LakeConditions.css"
import StationChart from "./StationChart";
import { TercAPI } from "../../../js/forked/terc_api";
import MODULES from "../../../static/modules.json";
import { parse_time_range } from "../../../js/forked/util";
import TimePlot from "./TimePlot";


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
                
    const data_type_name = (bottom_tab_name === "Historical") ? TercAPI.SECCHI_DEPTH_NAME 
        : TercAPI.TURBIDITY_NAME;

    const children = (station_data, station) => {
        const data_type_units = (data_type_name == TercAPI.SECCHI_DEPTH_NAME) ? "FT" : 
            (station.get_data_type(TercAPI.TURBIDITY_NAME).name_units.toUpperCase())
        const chart_props = {
            "y_label": `${data_type_name.toUpperCase()} (${data_type_units})`,
            "y_ticks": 7,
        };
        const time = station_data.map((x) => x[TercAPI.TIME_NAME])
        const turbidity = station_data.map((x) => x[data_type_name]);
        // When you change tabs, its possible that the station_data is still at the previous tab,
        // so this data type isn't available yet, but will be in a few ms. Really not sure how to fix
        // this one easily
        if (station_data.find((x) => x[data_type_name]) === undefined) {
            return (
                <div>Error loading data</div>
            );
        }
        return <TimePlot
            time={time}
            y={turbidity}
            {...chart_props}
            />
        };

    return (
        <StationChart
            marker_data_type={data_type_name}
            children={children}
            start_date={chart_start_date}
            end_date={chart_end_date}
            />
    );
}

export default Turbidity;