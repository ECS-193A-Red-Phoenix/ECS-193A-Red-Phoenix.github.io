import TabButton from "../TabButton";
import "./ModuleTopTabs.css";

function ModuleTopTab(props) {
    return <TabButton
                name={props.name}
                href={props.href}
                active={props.active}
                inactive_class={"module-top-tab"}
                active_class={"module-top-tab-active"}
                />
}

export default ModuleTopTab;