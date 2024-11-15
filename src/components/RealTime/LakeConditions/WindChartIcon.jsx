import { scaleLinear } from "d3";
import { round, militaryHourTo12Hour, DAYS_OF_WEEK } from "../../../js/forked/util";

const speed_scale = scaleLinear().domain([0, 20]).range([30, 70]).clamp(true);

function WindChartIcon(props) {
    let { speed, direction, time } = props;

    const format_date = (d) => {
        let hours = militaryHourTo12Hour(d.getHours());
        let am_pm = (d.getHours() >= 12) ? "PM" : "AM";
        let day = DAYS_OF_WEEK[d.getDay()].substring(0, 3);
        return (
            <>
                <span className="wind-chart-icon-time">{`${hours} ${am_pm}`}</span>
            </>
        );
    };

    return (
        <div className="wind-chart-icon">
            <span className="wind-chart-icon-speed"> { round(speed) } mph </span>
            <div className="wind-chart-icon-arrow-wrapper">
                <i 
                    className="wind-chart-icon-arrow wi wi-direction-up"
                    style={{
                        "transform": `rotate(${direction + 180}deg)`,
                        "fontSize": `${speed_scale(speed)}px`
                    }}
                    />
            </div>
            { format_date(new Date(time)) }
        </div>
    )
}

export default WindChartIcon;