import { useState } from "react";
import "./ModuleBottomTabs.css";

function ModuleBottomTabs(props) {
    /////////////////////////////////////////////
    // Expected props
    // tab_names: a list of strings for representing each tab
    // onTabChanged: a callback function for when a particular tab is clicked
    // default_tab (optional): the index of the default tab
    let { tab_names, onTabChanged, default_tab } = props;
    default_tab = Math.max(0, default_tab) ?? 0;
    onTabChanged = onTabChanged ?? (() => {});

    let [tab_index, setTabIndex] = useState(default_tab);
    if (tab_names.length <= 0)
        throw new Error("Expected at least one tab in creating bottom tabs")

    const setTab = (idx) => {
        setTabIndex(idx);
        onTabChanged(idx);
    };

    let tabs = tab_names.map((name, idx) => {
        let class_name = "module-bottom-tab";
        if (idx === tab_index)
            class_name += " module-bottom-tab-active";

        return <div
                key={`module-bottom-tab-${idx}`}
                onClick={() => setTab(idx)} 
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