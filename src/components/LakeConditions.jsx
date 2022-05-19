import { useState } from "react";
import { Tabs, Tab } from "@mui/material";

import CurrentLakePage from "./CurrentChart/CurrentLakePage";
import LakeWireFrame from "./LakeWireFrame/LakeWireFrame";
import TemperaturePage from "./TemperatureChart/TemperaturePage";
import WaveHeightPage from "./WaveHeightChart/WaveHeightPage";
import "../css/LakeConditions.css";

function LakeConditions(props) {
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
