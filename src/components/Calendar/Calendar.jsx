import { militaryHourTo12Hour } from "../util";
import "./Calendar.css";

////////////////////////////////////
// Static Constants
////////////////////////////////////
const block_width = 150;
const calendar_height = 500;
const block_margin = 10;
const ONE_DAY = 24 * 60 * 60 * 1000; // ms in 1 day
const event_padding = 2; // pixels

function formatDate(date) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const day_of_week = days[date.getDay()];
    const month = months[date.getMonth()];
    const day_of_month = date.getDate();

    return `${day_of_week}, ${month} ${day_of_month}`;
}

function roundToDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}


function Calendar(props) {
    ////////////////////////////////////
    // Expected props:
    //  props.events: a list of events [{'time': Date object, 'duration': hours}]

    // Ensure events are sorted by time
    props.events.sort((o1, o2) => o1['time'] - o2['time']);
    const min_date = props.events[0]['time'];
    const max_date = props.events[props.events.length - 1]['time'];

    // Get the days of the month that are listed in the data
    const start_date = roundToDay(min_date);
    const days = [];
    for (let date = start_date; date <= max_date; date = new Date(date.getTime() + ONE_DAY)) {
        days.push(date);
    }

    // Compute calendar height
    const calendar_width = days.length * (block_width + block_margin);

    ////////////////////////////////////
    // Day Labels
    ////////////////////////////////////
    const day_labels = [];
    for (let i = 0; i < days.length; i++) {
        const day_str = formatDate(days[i]);
        const label_x = (block_width + block_margin) * (i + 0.5);
        const line_x = (block_width + block_margin) * i;
        day_labels.push(
            <div style={{left: label_x}}
                key={`calendar-day${i}`}
                className="calendar-day">
                { day_str }
            </div>,
            <div style={{left: line_x}}
                key={`calendar-day-line${i}`}
                className="calendar-day-line">
            </div>
        );
    }
    // Add line at the very end
    day_labels.push(
        <div style={{left: (block_width + block_margin) * days.length - 1}}
            key={`calendar-day-${days.length}`}
            className="calendar-day-line">
        </div>
    )


    ////////////////////////////////////
    // Hour timeline
    ////////////////////////////////////
    const hour_timeline = [];
    for (let i = 0; i <= 24; i += 4) {
        const x = `-5px`;
        const y = `${i / 24 * 100}%`;
        const hour_string = `${militaryHourTo12Hour(i)} ${(Math.floor(i / 12) % 2 === 1) ? "PM" : "AM"}`;
        
        hour_timeline.push(
            <div key={`hour${i}`} className="calendar-hour"
                style={{left: x, top: y}}>
                { hour_string }
            </div>,
            <div key={`hour-line${i}`} className="calendar-hour-line"
                style={{left: x, top: y}}>
            </div>
        )
    }

    
    ////////////////////////////////////
    // Events
    ////////////////////////////////////
    const events = [];
    const padding_height = (event_padding / calendar_height) * 100;
    const padding_width = (event_padding / calendar_width) * 100;
    for (let i = 0; i < props.events.length; i++) {
        const { time, duration } = props.events[i];

        const days_from_start = Math.floor((time - start_date) / ONE_DAY);
        const top = `${time.getHours() / 24 * 100 + padding_height}%`;
        const bottom = `${(1 - ((time.getHours() + duration) / 24)) * 100 + padding_height}%`;
        const left = `${(days_from_start / days.length) * 100 + padding_width}%`;
        const right = `${(1 - ((days_from_start + 1) / days.length)) * 100 + padding_width}%`;

        const hour = time.getHours();
        const hour_string = `${militaryHourTo12Hour(hour)} ${(hour > 12) ? "PM" : "AM"}`;

        let class_name = "calendar-event";
        if (i === props.active_event_idx)
            class_name += " calendar-active-event";

        events.push(
            <div 
                style={{left: left, right: right, bottom: bottom, top: top}}
                key={`calendar-event${i}`}
                className={class_name}
                onClick={() => props.on_event_selected(i)}
                >
                { hour_string }
            </div>
        )
    }

    return (
        <div className="calendar" style={{width: calendar_width, height: calendar_height}}>
            { day_labels }
            { hour_timeline }
            { events }
        </div>
    );
}

export default Calendar;