import React from "react";

function TabGroup(props) {
    /////////////////////////////////////////////
    // Expected props
    // class_name: the class of the tab container
    // children: The TabButtons to include in the TabGroup

    return (
        <div className={props.class_name}>
            { props.children }
        </div>
    );
}

export default TabGroup;