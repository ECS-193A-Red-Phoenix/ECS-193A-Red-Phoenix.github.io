import { Link } from "react-router-dom";



function TabButton(props) {
    ////////////////////////////////////////////////
    // Expected props
    // href: the path the button routes to
    // inactive_class: the class_name for when the button is not active
    // active_class: the class name for when the button is active
    // onClick: callback function for when the button is clicked
    // active (optional): if the button is active
    let class_name = props.inactive_class;
    if (props.active)
        class_name += " " + props.active_class;

    return (
        <Link 
            onClick={props.onClick}
            to={props.href}
            className={class_name}> 
            {props.name} 
        </Link>
    );
}

export default TabButton;