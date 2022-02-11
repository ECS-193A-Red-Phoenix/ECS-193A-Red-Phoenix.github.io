import React from "react";
import Header from "./components/Header";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "./components/styles/App.css";
import { Routes, Route, Outlet } from "react-router-dom";

export default function App() {
  return (
    <div className="page-container">
      <Header/>
      <Navbar/>

      {/* This makes it so that we dont have to put header, navbar, footer in
      every single component */}
      <Outlet/>

      <Footer />
    </div>
  );
}
