import { useEffect, useState, useRef} from "react";
import { selectAll } from "d3";

import WindChartIcon from "./WindChartIcon";
import "./Weather.css";

import { DAYS_OF_WEEK, interpolate, clamp, ONE_DAY } from "../../../js/forked/util";

const ONE_HOUR = 60 * 60 * 1000;

function WindChart(props) {
    // Expected props
    // speed: an Array(N) of speed values in mph 
    // direction: an Array(N) of wind direction in deg
    // time: an Array(N) of Date objects for these
    // time_offset: a Date object 
    let { speed, direction, time } = props;
    let [time_offset, setTimeOffset] = useState(new Date());
    let wind_chart = useRef(null);

    let t_0 = time[0].getTime();
    let t_n = time[time.length - 1].getTime();

    let days = [];
    let times = [];
    for (let t = t_0; t < t_n; t += ONE_HOUR * 3) {
        let current_time = new Date(t);
        times.push(current_time);
        if (days.length == 0 || (days[days.length - 1].getDay() != current_time.getDay())) {
            days.push(current_time);
        }
    }
    
    let icons = times
        .map((t, idx) => {
            let speed_at_t = interpolate(t, time, speed);
            let direction_at_t = interpolate(t, time, direction);
            return <WindChartIcon
                        key={`wind-chart-icon${t}`}
                        speed={speed_at_t}
                        direction={direction_at_t}
                        time={t}
                        />;
        });

    let day_icons = days
        .map((d, idx) => {
            const day = DAYS_OF_WEEK[d.getDay()].substring(0, 3);
            const time_offset_day = DAYS_OF_WEEK[time_offset.getDay()].substring(0, 3);
            return (
                <span className={`wind-chart-day-icon ${day === time_offset_day ? "wind-chart-day-icon-active" : ""}`}
                    key={`wind-chart-day-${day}`}
                    onClick={() => setTimeOffset(d)}>
                    { day }
                </span>
            );
        });

    useEffect(() => {
        let ignore = false;
        if (ignore) return;

        const time_offset_day = new Date(time_offset);
        time_offset_day.setHours(0);
        time_offset_day.setMinutes(0); 
        time_offset_day.setSeconds(0);
        let scroll_index = 0;
        while (scroll_index < times.length && times[scroll_index] < time_offset_day)
            scroll_index++;
        if (wind_chart.current) {
            const icon_width = 80;
            wind_chart.current.scrollLeft = Math.floor(scroll_index * icon_width);
        }
        return () => { ignore = true; }; 
    }, [t_0, t_n, time_offset])

    return (
        <div className="wind-chart-container">
            <div className="wind-chart" ref={wind_chart}>
                {icons} 
            </div>
            <div className="wind-chart-navigation">
                {day_icons}
            </div>
        </div>
    )

}

export default WindChart