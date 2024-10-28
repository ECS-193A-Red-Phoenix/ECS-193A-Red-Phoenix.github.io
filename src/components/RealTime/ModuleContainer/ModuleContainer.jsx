import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

import ModuleTopTab from "../TabGroup/ModuleTopTabs/ModuleTopTab";
import ModuleTopTabs from "../TabGroup/ModuleTopTabs/ModuleTopTabs";
import ModuleBottomTabs from "../TabGroup/ModuleBottomTabs/ModuleBottomTabs";

import "../../../css/Modules.css";
import "./ModuleContainer.css";

function ModuleContainer(props) {
    ////////////////////////////////////////////////////////////////
    // Expected props
    // props.module: a MODULE object from modules.json
    // context: additional state information to pass to the outlet 
    let { module } = props;
    const module_tabs = Object.values(module.TABS);

    let [{tab_index, bottom_tab_index}, setModuleTabState] = useState({
        "tab_index": 0,
        "bottom_tab_index": module_tabs[0].default_bottom_tab
    });
    const setBottomTabIndex = (bottom_tab_index) => setModuleTabState(({tab_index}) => ({tab_index: tab_index, bottom_tab_index: bottom_tab_index}))
    const current_tab = module_tabs[tab_index];
    const has_bottom_tab = current_tab.BOTTOM_TABS !== undefined;
    const current_bottom_tab = (!has_bottom_tab) ? undefined : current_tab.BOTTOM_TABS[bottom_tab_index];
    const tab_name = (has_bottom_tab) ? (current_bottom_tab.header_name ?? current_tab.name) : current_tab.name;
    let tab_description = current_tab.desc;
    let transparent_tabs = current_tab.transparent_top_tabs ?? false;

    //////////////////////////////////////////////////////////
    // Determine which tab is currently active by parsing url
    //////////////////////////////////////////////////////////
    const location = useLocation();
    useEffect(() => {
        let url = location.pathname.split('/');

        let image_index = url.indexOf(module.href);
        let tab_href = url[image_index + 1];
        let t_index = module_tabs.findIndex((t) => t.href === tab_href);
        if (t_index < 0)
            throw new Error(`Unable to find tab for href ${location.pathname}`);
        else {
            setModuleTabState({tab_index: t_index, bottom_tab_index: module_tabs[t_index].default_bottom_tab});
        }
    }, [location]);
    
    const tabs = module_tabs.map((m, idx) => {
        return <ModuleTopTab
                    key={`module-tab-${m.name}`}
                    name={m.name}
                    href={m.href}
                    active={idx === tab_index}
                    />
    });

    const module_container_style = {};

    // Create image style if current tab has an image
    const background_image = current_tab.image ?? 
        current_tab.BOTTOM_TABS[bottom_tab_index].image;
    if (background_image) {
        module_container_style["backgroundImage"] = `url(${background_image})`;
        module_container_style["backgroundSize"] = "cover";
        module_container_style["backgroundPosition"] = "50%";
    }

    const tab_has_header = current_tab.desc !== undefined || (has_bottom_tab && current_bottom_tab.desc !== undefined);

    //////////////////////////////////////////////////////////////
    // Bottom tabs creation
    // - Each tab can optionally have bottom tabs if specified in modules.json
    //////////////////////////////////////////////////////////////
    let bottom_tabs;
    if (current_tab.BOTTOM_TABS !== undefined) {
        const tab_names = current_tab.BOTTOM_TABS.map((tab) => tab.name);
        
        bottom_tabs = 
            <ModuleBottomTabs
                active_tab={bottom_tab_index}
                tab_names={tab_names}
                onTabChanged={(idx) => setBottomTabIndex(idx)}
                />

        let bottom_tab_desc = current_tab.BOTTOM_TABS[bottom_tab_index].desc;
        tab_description = bottom_tab_desc ?? tab_description; 
    }

    const combined_context = [props.context, {tab_index: tab_index, bottom_tab_index: bottom_tab_index}];

    //////////////////////////////////////////////////////////////////////////
    // Scale the container down if its width exceeds the current window size
    //////////////////////////////////////////////////////////////////////////
    const [width, setWidth] = useState(document.body.clientWidth);
    useEffect(() => {
        const handleResize = () => setWidth(document.body.clientWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    const container_padding = 30;
    const max_width = 1040 + container_padding;
    const scale = width < max_width ? `scale(${width / max_width})` : 'scale(1)';
    module_container_style["transform"] = scale;
    module_container_style["transformOrigin"] = 'top';
    //////////////////////////////////////////////////////////////////////////

    return (
        <div className="module-container"
            style={ module_container_style }
            > 
            <div 
                className={transparent_tabs ? "transparent-top-tabs" : ""}>
                    
                <ModuleTopTabs>
                    {tabs}
                </ModuleTopTabs>

            </div>

            <div className="tab-content">
                <Outlet context={combined_context}/>

                {
                    tab_has_header &&
                    <div className="tab-header">
                        <div className="tab-title"> 
                            { tab_name }
                        </div>
                        <div className="tab-desc">
                            { tab_description }
                        </div>
                    </div>
                }

            </div>

            { bottom_tabs }
        </div>
    );
}

export default ModuleContainer;