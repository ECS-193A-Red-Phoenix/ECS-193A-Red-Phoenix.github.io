import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import App from "./App";
import ContactUs from "./components/ContactUs";
import LakeConditions from "./components/LakeConditions";
import RealTimeConditions from "./components/RealTime/RealTimeConditions";
import LakeConditionsPage from "./components/LakeConditionsPage";
import RealTimeConditionsPage from "./components/RealTime/RealTimeConditionsPage";
import TemperaturePage from "./components/TemperatureChart/TemperaturePage";
import CurrentLakePage from "./components/CurrentChart/CurrentLakePage";
import WaveHeightPage from "./components/WaveHeightChart/WaveHeightPage";

import "./css/reset.css";
import "./css/index.css";


ReactDOM.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={ <LakeConditionsPage/> }/>
        <Route path="contact" element={ <ContactUs/> }/>
        <Route path="real-time" element={ <RealTimeConditionsPage/> }/> 
      </Route>
      <Route path="/isolated">
        <Route path="conditions" element={
            <div className="model-figure-container">
                <TemperaturePage />
                <CurrentLakePage />
                <WaveHeightPage />
            </div>
        }/>
        <Route path="real-time" element={<RealTimeConditions/>}/>
        <Route path="temperature" element={<TemperaturePage/>}/>
        <Route path="flow" element={<CurrentLakePage/>}/>
        <Route path="waveheight" element={<WaveHeightPage/>}/>
      </Route>
    </Routes>
  </BrowserRouter>,

  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
