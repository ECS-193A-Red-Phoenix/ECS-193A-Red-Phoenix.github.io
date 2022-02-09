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
        <Header />
        <Navbar />
        <PageTitle />
        <img src="Map.png" className="Map1" />
        <HazardousBox />
      </div>
      <Footer />
    </div>
  );
}
