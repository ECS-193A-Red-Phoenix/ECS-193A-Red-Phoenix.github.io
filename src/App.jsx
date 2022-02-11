import React from "react";
import Header from "./components/Header";
import Navbar from "./components/Navbar";
import PageTitle from "./components/PageTitle";
import Footer from "./components/Footer";
import HazardousBox from "./components/HazardousBox";
import "./components/styles/App.css";

export default function App() {
  return (
    <div className="page-container">
      <div className="content-wrapper">
        <Header/>
        <Navbar/>
        <PageTitle />
        <div className="Map1">
          <img src="LTPic.png" className="Pic" />
          <img src="LTPic2.png" />
        </div>
        <HazardousBox />
      </div>
      <Footer />
    </div>
  );
}
