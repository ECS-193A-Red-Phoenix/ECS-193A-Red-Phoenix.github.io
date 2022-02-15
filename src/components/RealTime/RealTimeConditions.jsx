import { ALL_STATIONS } from './api';
import React, { useState, useEffect } from 'react'
import MapControlButton from './MapControlButton';
import "./RealTimeConditions.css"
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


  function setDataDisplayed(idx) {
    setDataIdx(idx);
  }

  function onSetStationIdx(idx) {
    setDataDisplayed(0);
    setStationIdx(idx);
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
      <div className="content-wrapper">

        <div className='image-container'>
            <img src="lake-one.jpg"></img>
            <div className='page-description-container'>
                <div className='page-description-title'> Real Time Conditions </div>
                <div className='page-description'> Explore Lake Tahoe conditions in real time, routinely updated in twenty minute intervals. </div>
            </div>
        </div>

        <div className='real-time-conditions-container'>

            <div className='time-plot-container'>
                <LinePlot width={800} height={500} time={time} y={y_data} title={chart_title} units={current_data_displayed.units}/>
                <div className="map-controls-container">
                    { mapControls }
                </div>
            </div>

            <StationMap stationIdx={stationIdx} onClick={onSetStationIdx}/>

        </div>
      </div>
  )
}

export default RealTimeConditions;