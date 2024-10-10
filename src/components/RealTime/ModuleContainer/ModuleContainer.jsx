import { useState, useEffect } from "react";
import { Outlet, useOutletContext, useLocation } from "react-router-dom";

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
    // default_bottom_tab_idx: (optional, default=0), the first bottom tab to display by default 
    let { module, default_bottom_tab_idx } = props;
    default_bottom_tab_idx = default_bottom_tab_idx ?? (module.default_bottom_tab ?? 0);

    let [tab_index, setTabIndex] = useState(0);
    const current_tab = Object.values(module.TABS)[tab_index];
    let tab_description = current_tab.desc;
    let transparent_tabs = current_tab.transparent_top_tabs ?? false;

    //////////////////////////////////////////////////////////
    // Determine which tab is currently active by parsing url
    //////////////////////////////////////////////////////////
    const location = useLocation();
    useEffect(() => {
        let url = location.pathname.split('/');

        let image_index = url.indexOf(module.href);
        // Case where url is '/images/'
        if (image_index < 0 || image_index + 1 >= url.length) {
            setTabIndex(0);
            return;
        }

        let tab_href = url[image_index + 1];
        let t_index = Object.values(module.TABS).findIndex((t) => t.href === tab_href);
        if (t_index < 0)
            throw new Error(`Unable to find tab for href ${location.pathname}`);
        else
            setTabIndex(t_index);
    }, [location]);
    
    const tabs = Object.values(module.TABS).map((m, idx) => {
        return <ModuleTopTab
                    key={`module-tab-${m.name}`}
                    name={m.name}
                    href={m.href}
                    active={idx === tab_index}
                    />
    });

    const module_container_style = {};

    // Create image style if current tab has an image
    const background_image = current_tab.image;
    if (background_image) {
        module_container_style["backgroundImage"] = `url(${background_image})`;
        module_container_style["backgroundSize"] = "cover";
        module_container_style["backgroundPosition"] = "50%";
    }

    const tab_has_header = current_tab.desc !== undefined;

    //////////////////////////////////////////////////////////////
    // Bottom tabs creation
    // - Each tab can optionally have bottom tabs if specified in modules.json
    //////////////////////////////////////////////////////////////
    const [bottom_tab_index, setBottomTabIndex] = useState(default_bottom_tab_idx);
    let bottom_tabs;
    if (current_tab.BOTTOM_TABS !== undefined) {
        const tab_names = current_tab.BOTTOM_TABS.map((tab) => tab.name);
        
        bottom_tabs = 
            <ModuleBottomTabs
                default_tab={bottom_tab_index}
                tab_names={tab_names}
                onTabChanged={(idx) => setBottomTabIndex(idx)}
                />

        let bottom_tab_desc = current_tab.BOTTOM_TABS[bottom_tab_index].desc;
        tab_description = bottom_tab_desc ?? tab_description; 
    }

    const module_container_state = {
        "tab_index": tab_index,
        "bottom_tab_index": bottom_tab_index
    };
    const combined_context = [props.context, module_container_state];

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
    // flex-box ignores scale so it leaves these really long margins
    // hard code set the position of the map to be right below the module
    let real_margin = 0;
    if (width < max_width) {
        const module_height = 533.6;
        let negative_margin = -module_height * (1 - (width / max_width));
        negative_margin += real_margin;
        module_container_style["marginBottom"] = `${negative_margin}px`;
    }
    else {
        module_container_style["marginBottom"] = `${real_margin}px`;
    }
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
                            { current_tab.name }
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