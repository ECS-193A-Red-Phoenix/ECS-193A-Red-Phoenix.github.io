import { DAYS_OF_WEEK, today, militaryHourTo12Hour } from "../../../js/forked/util";


function WeatherHeader(props) {
    const now = today();
    const format_date = (d, include_hours) => {
        let day_of_week = DAYS_OF_WEEK[d.getDay()];
        if (!include_hours)
            return `${day_of_week}`
        let hours = militaryHourTo12Hour(d.getHours());
        let minutes = String(d.getMinutes()).padStart(2, "0");
        let am_pm = (d.getHours() >= 12) ? "PM" : "AM";
        return `${day_of_week} ${hours}:${minutes} ${am_pm}`;
    };
    
    return (
        <div className="weather-header">
            <div className="weather-header-left">
                <i className="weather-icon wi wi-day-sunny"></i>
                <div className="weather-header-value">
                    { temperature_now }
                </div> 
                <span className="weather-header-units">
                    °F
                </span>
                <div
                    className="weather-header-stats"
                    >
                    <span> Wind: {wind_now} mph  </span>
                </div>
            </div>
            
            <div className="weather-header-right"> 
                <span className="weather-header-location">
                    { location_name }
                </span>
                <span className="weather-header-date">
                    { 
                        format_date(new Date(now), true) 
                    } 
                </span>
            </div>

        </div>
    );
}

export default WeatherHeader;