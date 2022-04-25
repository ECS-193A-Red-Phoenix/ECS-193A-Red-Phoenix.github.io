import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import reportWebVitals from "./reportWebVitals";

import App from "./App";
import ContactUs from "./components/ContactUs";
import LakeConditions from "./components/LakeConditions";
import RealTimeConditions from "./components/RealTime/RealTimeConditions";

import "./css/reset.css";
import "./css/index.css";

ReactDOM.render(
  <Router>
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={ <LakeConditions/> }/>
        <Route path="contact" element={ <ContactUs/> }/>
        <Route path="real-time" element={ <RealTimeConditions/> }/> 
      </Route>
    </Routes>
  </Router>,

  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
