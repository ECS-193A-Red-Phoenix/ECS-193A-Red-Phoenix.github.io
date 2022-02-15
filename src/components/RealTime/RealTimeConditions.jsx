import { MapContainer, Marker, Popup, TileLayer, SVGOverlay, useMapEvents } from 'react-leaflet';
import { ALL_STATIONS } from './api';
import React, { useState, useEffect } from 'react'
import MapControlButton from './MapControlButton';
import "./RealTimeConditions.css"
import StationMarker from './StationMarker';
import StationMap from './StationMap';
import LinePlot from './LinePlot';

const w = 0.1;
const h = 0.2;

// Lake Tahoe coords
const leafletMapStyle = {
  width: "400px",
  height: "550px",
  alignSelf: "center"
}


function RealTimeConditions(props) {
  let [stationIdx, setStationIdx] = useState(0);
  let [stationData, setStationData] = useState([]);
  let [dataIdx, setDataIdx] = useState(0);
  
  let station_data_names = ALL_STATIONS[stationIdx].info.data;
  let current_data_displayed = station_data_names[dataIdx];
  let time = [];
  let y_data = [];
  if (stationData[stationIdx]) {
    time = stationData[stationIdx].map((x) => x['TimeStamp']);
    y_data = stationData[stationIdx].map((x) => x[current_data_displayed.name]);
  }

  useEffect(() => {
    // Retrieve data 
    for (let i = 0; i < ALL_STATIONS.length; i++) {
      let station = ALL_STATIONS[i];
      station.get_display_data().then((response) => {
        setStationData((prevStationData) => {
          let stationDataCopy = [...prevStationData];
          if (response.length == 0) {
            stationDataCopy[i] = undefined;
          } else {
            stationDataCopy[i] = response;
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
    console.log("Setting station ", idx, "to display", station_data_names[idx]);
    console.log(stationData);
    setDataIdx(idx);
  }

  // Map Controls
  let mapControls = [];
  for (let i = 0; i < station_data_names.length; i++) {
    mapControls.push(
      <MapControlButton key={station_data_names[i].name} name={station_data_names[i].name} active={i === dataIdx} 
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

        <StationMap stationIdx={stationIdx} onClick={(i) => setStationIdx(i)}/>

      </div>
  )
}

export default RealTimeConditions;