import "./Calendar.css";
import { useState, useRef, useEffect } from "react";
import { clamp, militaryHourTo12Hour, bisect_left } from "../../js/util";
import UpDownArrow from "./UpDownArrow";

////////////////////////////////////
// Static Constants
////////////////////////////////////

function formatDate(date) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const day_of_week = days[date.getDay()];
    const month = months[date.getMonth()];
    const day_of_month = date.getDate();
    const year = date.getFullYear();

    return `${day_of_week}, ${month} ${day_of_month}, ${year}`;
}

function formatHourString(date) {
    const am_pm = (date.getHours() < 12) ? "AM" : "PM";
    return `${militaryHourTo12Hour(date.getHours())} ${am_pm}`;
}

function Calendar(props) {
    const day_select_ref = useRef();
    const hour_select_ref = useRef();
    
    ////////////////////////////////////
    // Expected props:
    //  props.events: a list of Objects that have a time attribute [{'time': Date object}, ...]
    //  on_event_selected: a callback function when a new event is selected
    //  props.active_event_index: the index of the active event
    const { events, on_event_selected, active_event_index } = props;

    ////////////////////////////////////
    // Error Handling
    ////////////////////////////////////
    let error_message;
    if (events === undefined) 
        error_message = "Loading available forecasts";
    else if (events === null) 
        error_message = "An unexpected error occurred while retrieving forecasts";
    else if (events.length === 0)
        error_message = "No forecasts are available";
    
    if (error_message !== undefined)
        return <div className="calendar calendar-error"> {error_message} </div>;

    ////////////////////////////////////
    // Create a hashmap that groups events by date_string -> events on that day
    // Example: 'Sunday, January 23' -> [event1, event2]
    const dates = {};
    for (let event of events) {
        const date_string = formatDate(event.time);
        if (date_string in dates)
            dates[date_string].push(event);
        else
            dates[date_string] = [event];
    }
    
    const active_event = events[active_event_index];
    const active_event_date = formatDate(active_event.time); 
    const day_options = Object.keys(dates).map(
        (date_string, idx) => 
            <option 
                value={ date_string }
                key={`day-option-${idx}`} 
                className="day-option"
                > 
                    { date_string }
            </option>
    )
    
    const hours = dates[active_event_date];
    const active_hour_idx = hours.indexOf(active_event);

    const hour_options = hours.map(
        (date_event, idx) =>
            <option 
                value={ idx }
                key={`hour-option-${idx}`}
                className="hour-option"
                >
                    { formatHourString(date_event.time) }
            </option> 
    )

    // Event callback function when day selector is changed
    function on_day_changed() {
        const selector = day_select_ref.current;
        const selected_date = selector.options[selector.selectedIndex].text;
        const selected_event = dates[selected_date][0];
        on_event_selected(events.indexOf(selected_event));
    }

    // Event callback function when hour selector is changed
    function on_hour_changed() {
        const day_select = day_select_ref.current;
        const selected_date = day_select.options[day_select.selectedIndex].text;
        const hour_select = hour_select_ref.current;
        const selected_hour = hour_select.selectedIndex;
        const selected_event = dates[selected_date][selected_hour];
        on_event_selected(events.indexOf(selected_event));
    }

    // Event callback function for when up down arrow is pressed
    function change_hour(amount) {
        // Arguments:
        //  amount: an integer; how many hour events to go forward or backward
        const day_select = day_select_ref.current;
        let selected_date = day_select.options[day_select.selectedIndex].text;
        const hour_select = hour_select_ref.current;
        const selected_hour = hour_select.selectedIndex;

        // Go the new hour idx < 0 go back a day, if the new hour idx >= # hour options go forward a day.
        let new_hour_idx = selected_hour + amount;
        if (new_hour_idx < 0 && day_select.selectedIndex > 0) {
            // Get previous day
            day_select.selectedIndex -= 1;
            selected_date = day_select.options[day_select.selectedIndex].text;
            // Get the last event on the previous day
            new_hour_idx = dates[selected_date].length - 1;
        } else if (new_hour_idx >= dates[selected_date].length && day_select.selectedIndex < day_select.options.length - 1) {
            day_select.selectedIndex += 1;
            new_hour_idx = 0;
        }
        selected_date = day_select.options[day_select.selectedIndex].text;
        new_hour_idx = clamp(new_hour_idx, 0, dates[selected_date].length - 1);

        // Find index of event from the original order of props.events
        const new_event = dates[selected_date][new_hour_idx];
        on_event_selected(events.indexOf(new_event));
    }

    return (
        <div className="calendar-container">
            <div className="calendar-description">
                { props.description }
            </div>
            <div className="calendar">
                <select ref={day_select_ref} 
                    className="calendar-day-select" 
                    onChange={on_day_changed}
                    value={ active_event_date }
                    >
                    { day_options }
                </select>
                <span> at </span>

                <div className="calendar-hour-select">
                    <select ref={hour_select_ref} 
                        value={ active_hour_idx } 
                        className="calendar-hour-select" 
                        onChange={on_hour_changed}
                        >
                        { hour_options }
                    </select>
                    <UpDownArrow on_up={() => change_hour(-1)} on_down={() => change_hour(1)}/>
                </div>
            </div>
        </div>
    );
}

export default Calendar;