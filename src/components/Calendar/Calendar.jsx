import "./Calendar.css";
import { useState, useRef } from "react";
import { militaryHourTo12Hour } from "../util";

////////////////////////////////////
// Static Constants
////////////////////////////////////

function formatDate(date) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const day_of_week = days[date.getDay()];
    const month = months[date.getMonth()];
    const day_of_month = date.getDate();

    return `${day_of_week}, ${month} ${day_of_month}`;
}

function formatHourString(date) {
    const am_pm = (date.getHours() < 12) ? "AM" : "PM";
    return `${militaryHourTo12Hour(date.getHours())} ${am_pm}`;
}

function Calendar(props) {
    const [active_event_idx, set_active_event_idx] = useState(0);
    const day_select_ref = useRef();
    const hour_select_ref = useRef();

    ////////////////////////////////////
    // Expected props:
    //  props.events: a list of events [{'time': Date object, 'duration': hours}]
    //  props.on_event_selected: a callback function when a new event is selected
    if (props.events.length === 0) {
        return <div className="calendar"> No forecasts are available </div>
    }
    
    // Ensure events are sorted by time
    props.events.sort((o1, o2) => o1['time'] - o2['time']);
    props.events.forEach((e, idx) => e.idx = idx);

    // Create a hashmap that maps date_string -> events on that day
    // Example: 'Sunday, January 23' -> [event1, event2]
    const dates = {};
    for (let event of props.events) {
        const date_string = formatDate(event.time);
        if (date_string in dates)
            dates[date_string].push(event);
        else
            dates[date_string] = [event];
    }

    const day_options = Object.keys(dates).map(
        (date_string, idx) => 
            <option 
                key={`day-option-${idx}`} 
                className="day-option"> 
                    { date_string }
            </option>
    )

    const active_event = props.events[active_event_idx];
    const hour_options = dates[formatDate(active_event.time)].map(
        (date_event) =>
            <option 
                key={`hour-option-${date_event.idx}`}
                className="hour-option">
                    { formatHourString(date_event.time) }
            </option> 
    )

    // Event callback function when day selector is changed
    function on_day_changed() {
        const selector = day_select_ref.current;
        const selected_date = selector.options[selector.selectedIndex].text;
        const selected_event_idx = dates[selected_date][0].idx;
        props.on_event_selected(selected_event_idx);
        set_active_event_idx(selected_event_idx);
    }

    // Event callback function when hour selector is changed
    function on_hour_changed() {
        const day_select = day_select_ref.current;
        const selected_date = day_select.options[day_select.selectedIndex].text;
        const hour_select = hour_select_ref.current;
        const selected_hour = hour_select.selectedIndex;
        const selected_event_idx = dates[selected_date][selected_hour].idx;
        props.on_event_selected(selected_event_idx);
        set_active_event_idx(selected_event_idx);
    }

    return (
        <div className="calendar">
            <span> Showing forecasts for </span>
            <select ref={day_select_ref} className="calendar-day-select" onChange={on_day_changed}>
                { day_options }
            </select>
            <span> at </span>
            <select ref={hour_select_ref} className="calendar-hour-select" onChange={on_hour_changed}>
                { hour_options }
            </select>
        </div>
    );
}

export default Calendar;