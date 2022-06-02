import { useEffect, useState } from "react";
import { Tabs, Tab } from "@mui/material";

import CurrentLakePage from "./CurrentChart/CurrentLakePage";
import LakeWireFrame from "./LakeWireFrame/LakeWireFrame";
import TemperaturePage from "./TemperatureChart/TemperaturePage";
import WaveHeightPage from "./WaveHeightChart/WaveHeightPage";
import "../css/LakeConditions.css";
import { useSearchParams } from "react-router-dom";
import { mod } from "../js/util";

function LakeConditions(props) {
    const [searchParams, setSearchParams] = useSearchParams();
    const [tab_index, setTabIndex] = useState(0);

    function change_tab(event, new_index) {
        setTabIndex(new_index);
    }

    const tabs = [
        { label: 'Water Temperature', component: <TemperaturePage/> },
        { label: 'Water Currents', component: <CurrentLakePage/> },
        { label: 'Wave Height', component: <WaveHeightPage/> },
        // { label: 'Lake Bathymetry', component: <LakeWireFrame/> }
    ];

    const tab_components = tabs.map((t, idx) => {
        return <Tab 
                    key={`tab-${idx}`}
                    label={t.label}
                />
    });

    useEffect(() => {
        // Set tab index if url has 'tab=index' parameter
        if (searchParams.has("tab")) {
            let tab = parseInt(searchParams.get("tab"));
            if (isFinite(tab)) {
                tab = mod(tab, tabs.length);
                setTabIndex(tab);
            }
        }
    }, [searchParams, tabs.length]);

    return (
        <div className="model-figure-container">
            <div className="tabs-container">
                <Tabs 
                    variant="scrollable"
                    scrollButtons
                    allowScrollButtonsMobile
                    value={tab_index} 
                    onChange={change_tab}>
                    { tab_components }
                </Tabs>
            </div>

            { tabs[tab_index].component }
        </div>
    );
}

export default LakeConditions;
