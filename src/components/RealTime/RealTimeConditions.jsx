import { MapContainer, Marker, Popup, TileLayer, SVGOverlay } from 'react-leaflet';
import { ALL_STATIONS, DATA_DISPLAYED } from './api';
import React, { useState, useEffect } from 'react'
import MapControlButton from './MapControlButton';
import "./RealTimeConditions.css"
import StationMarker from './StationMarker';
import LinePlot from './LinePlot';

const position = [39.08999983830667, -120.03681848915485] // Lake Tahoe coords
const leafletMapStyle = {
  width: "400px",
  height: "550px",
  alignSelf: "center"
}


function RealTimeConditions(props) {
  let [stationIdx, setStationIdx] = useState(0);
  let [stationData, setStationData] = useState([]);
  let [time, setTime] = useState([]);
  let [y_data, setYData] = useState([]);
  let [dataIdx, setDataIdx] = useState(0);
  let current_data_displayed = DATA_DISPLAYED[dataIdx];
  
  useEffect(() => {
    // Retrieve data 
    for (let i = 0; i < ALL_STATIONS.length; i++) {
      let station = ALL_STATIONS[i];
      station.get_display_data().then((response) => {
        setStationData((prevStationData) => {
          console.log("Got response for station", i, response);
          let stationDataCopy = [...prevStationData];
          if (response.length == 0) {
            stationDataCopy[i] = undefined;
          } else {
            stationDataCopy[i] = response;
          }
          if (i == stationIdx) {
            setTime(response.map((x) => x['TimeStamp']));
            setYData(response.map((x) => x[current_data_displayed.name]));
          }
          return stationDataCopy;
        });
      })
    }
  }, []);

  // Station Markers
  let stationMarkers = [];
  for (let i = 0; i < ALL_STATIONS.length; i++) {
    if (stationData[i] && stationData[i].length > 0) {
      let data_to_display = stationData[i][stationData[i].length - 1][current_data_displayed.name]
      if (!data_to_display) continue;

      let { id, station_name, coords } = ALL_STATIONS[i].info;
      stationMarkers.push(
        <StationMarker key={ station_name } position={coords} data={data_to_display}
        onClick={() => {console.log("Station " + i + " was clicked");}}/>
      )
    }
  }

  function setDataDisplayed(idx) {
    if (stationData[stationIdx]) {
      setTime(stationData[stationIdx].map((x) => x['TimeStamp']));
      setYData(stationData[stationIdx].map((x) => x[DATA_DISPLAYED[idx].name]));
    }
    setDataIdx(idx);
  }

  // Map Controls
  let mapControls = [];
  for (let i = 0; i < DATA_DISPLAYED.length; i++) {
    mapControls.push(
      <MapControlButton key={DATA_DISPLAYED[i].name} name={DATA_DISPLAYED[i].name} active={i === dataIdx} 
        onClick={() => setDataDisplayed(i)}/>
    );
  }

  const chart_title = `${current_data_displayed.name} @ ${ALL_STATIONS[stationIdx].info.station_name}`;

  return (
      <div className='real-time-conditions-container content-wrapper'>

        <div className='time-plot-container'>
            <LinePlot width={800} height={500} time={time} y={y_data} title={chart_title} units={current_data_displayed.units}/>
            <div className="map-controls-container">
                { mapControls }
            </div>
        </div>

        <MapContainer style={leafletMapStyle} center={position} 
        zoomSnap={0.01} zoom={10.6} zoomControl={false}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}>

          {/* Map style chosen from here http://leaflet-extras.github.io/leaflet-providers/preview/ */}
          <TileLayer
              url='https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.{ext}'
              attribution='Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              ext='png'
          />

          { stationMarkers }

        </MapContainer>

      </div>
  )
}

export default RealTimeConditions;