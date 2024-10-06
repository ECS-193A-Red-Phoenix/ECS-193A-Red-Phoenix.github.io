import { NavLink as Link } from "react-router-dom";
import "./ModuleSelector.css";

function ModuleButton(props) {
    ////////////////////////////////////////////////
    // Expected props
    // href: the path the button routes to
    // active (optional): if the button is active
    // onClick: callback function for when link is clicked
    let class_name = "module-button";
    if (props.active)
        class_name += " module-button-active";

    return (
        <Link 
            onClick={props.onClick}
            className={class_name}
            to={props.href}
            >
                <img src={props.image} alt={props.name}/>
                <span> {props.name} </span>
        </Link>
    );
}

export default ModuleButton;