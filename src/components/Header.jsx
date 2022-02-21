import React from "react";
import Navbar from "./Navbar";
import "./styles/Header.css";

export default function Header() {
  return (
    <div className="header-container">
      <div className="title-and-logo">
        <img src="logo.png" alt="logo" className="logo--icon" />
        <div className="title--name"> Tahoe Now </div>
      </div>
    </div>
  );
}
