import { useState } from "react";
import "./ModuleBottomTabs.css";

function ModuleBottomTabs(props) {
    /////////////////////////////////////////////
    // Expected props
    // tab_names: a list of strings for representing each tab
    // onTabChanged: a callback function for when a particular tab is clicked
    // active_tab: the index of the active tab
    let { tab_names, onTabChanged, active_tab } = props;
    onTabChanged = onTabChanged ?? (() => {});

    if (tab_names.length <= 0)
        throw new Error("Expected at least one tab in creating bottom tabs")

    let tabs = tab_names.map((name, idx) => {
        let class_name = "module-bottom-tab";
        if (idx === active_tab)
            class_name += " module-bottom-tab-active";

        return <div
                key={`module-bottom-tab-${idx}`}
                onClick={() => onTabChanged(idx)} 
                className={class_name}> 
                {name} 
               </div>
    });

    return (
        <div className="module-bottom-tabs">
            {tabs}
        </div>
    );
}

export default ModuleBottomTabs;