import { select } from "d3";
import { useEffect } from "react";
import { useRef } from "react";
import "./TahoeMap.css";

function Acknowledgements(props) {
    let container_ref = useRef();

    // Popup hide/show
    useEffect(() => {
        let container = select(container_ref.current);
        let popup = container.select(".acknowledgements-popup");
        let open_button_container = container.select(".acknowledgements-title");
        let open_button = container.select(".acknowledgements-title");
        let close_button = container.select(".acknowledgements-close");

        function hide_popup() {
            open_button_container.style("display", "block");
            popup.style("display", "none");
        }

        function show_popup() {
            open_button_container.style("display", "none")
            popup.style("display", "block");
        }

        open_button.on("click", show_popup);
        close_button.on("click", hide_popup);
    }, []);

    return (
        <div ref={container_ref} className="acknowledgements">
            
            <div className="acknowledgements-title">
                <img height="40" src="/static/img/terc-logo.png" alt="TERC logo"/>
                <div> Acknowledgements </div>
            </div>

            <div className="acknowledgements-popup">

                <div className="acknowledgements-header"> Acknowledgements </div>

                Real-time, historic and forecast data for this exhibit comes from UC Davis Tahoe Environmental Research Center, U.S. Geological Survey, National Weather Service, NASA, NRCS Snotel, and others.

                <img height="40" src="/static/img/terc-logo-inverse.png" alt="TERC logo"/>

                <div className="acknowledgements-close">
                    [ × ] CLOSE
                </div>

            </div>

        </div>
    )
}

export default Acknowledgements;