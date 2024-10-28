import React from "react";
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import App from "./App";
import ContactUs from "./components/ContactUs";
import LakeConditions from "./components/LakeConditions";
import RealTimeConditions from "./components/RealTime/RealTimeConditions";
import WaveHeight from "./components/RealTime/LakeConditions/WaveHeight";
import WaterTemperature from "./components/RealTime/LakeConditions/WaterTemperature";
import Weather from "./components/RealTime/LakeConditions/Weather";
import Turbidity from "./components/RealTime/LakeConditions/Turbidity";
import LakeConditionsPage from "./components/LakeConditionsPage";
import RealTimeConditionsPage from "./components/RealTime/RealTimeConditionsPage";
import TemperaturePage from "./components/TemperatureChart/TemperaturePage";
import CurrentLakePage from "./components/CurrentChart/CurrentLakePage";
import WaveHeightPage from "./components/WaveHeightChart/WaveHeightPage";

import "./css/reset.css";
import "./css/index.css";

function Redirect(to) {
    return (
        <Route
            path=""
            element={
                <Navigate
                    to={to}
                    replace
                />
            }
        />
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<App />}>
                <Route 
                    index 
                    element={<LakeConditionsPage/>} 
                    />

                <Route 
                    path="contact" 
                    element={<ContactUs />} 
                    />

                <Route 
                    path="real-time" 
                    element={<RealTimeConditionsPage />} 
                    >

                    {Redirect(`/real-time/water-temperature`)}

                    <Route
                        element={<WaterTemperature />}
                        path={'water-temperature'}
                        />

                    <Route
                        element={<WaveHeight />}
                        path={'wave-height'}
                        />

                    <Route
                        element={<Turbidity />}
                        path={'turbidity'}
                        />

                    <Route
                        element={<Weather />}
                        path={'weather'}
                        />

                </Route>
            </Route>

            <Route path="/isolated">

                <Route
                    path="conditions"
                    element={<LakeConditions />}
                    />

                <Route
                    path="real-time"
                    element={<RealTimeConditions />}
                    >
                    {Redirect(`/isolated/real-time/water-temperature`)}

                    <Route
                        element={<WaterTemperature />}
                        path={'water-temperature'}
                        />

                    <Route
                        element={<WaveHeight />}
                        path={'wave-height'}
                        />

                    <Route
                        element={<Turbidity />}
                        path={'turbidity'}
                        />

                    <Route
                        element={<Weather />}
                        path={'weather'}
                        />
                </Route>

                <Route
                    path="temperature"
                    element={<TemperaturePage />}
                    />

                <Route
                    path="flow"
                    element={<CurrentLakePage />}
                    />

                <Route
                    path="waveheight"
                    element={<WaveHeightPage />}
                    />

            </Route>
        </Routes>
    </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
