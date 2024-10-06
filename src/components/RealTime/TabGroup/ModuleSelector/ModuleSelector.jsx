import TabGroup from "../TabGroup";
import "./ModuleSelector.css";

function ModuleSelector(props) {
    //////////////////////////////////////
    // Expected props
    return (
        <TabGroup 
            class_name="module-selector">
            {props.children}
        </TabGroup>
    );
}

export default ModuleSelector;