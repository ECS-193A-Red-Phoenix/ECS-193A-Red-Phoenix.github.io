import TabGroup from "../TabGroup";
import "./ModuleTopTabs.css";

function ModuleTopTabs(props) {
    return (
        <TabGroup class_name="module-top-tabs">
            { props.children }
        </TabGroup>
    );
}


export default ModuleTopTabs;