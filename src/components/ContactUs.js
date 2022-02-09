import React from "react";
import Header from "./Header";
import Navbar from "./Navbar";
import PageTitle from "./PageTitleCU";
import Footer from "./Footer";
import "./styles/AboutUsStyle.css";
import { Link } from "react-router-dom";

export default function ContactUs() {
  return (
    <div className="page-container">
      <div className="content-wrapper">
        <Header />
        <Navbar />
        <PageTitle />
        <div className="stack">
          <ul className="pageStack">
            <li>
              <p className="currPage">Contact Us</p>
            </li>
            <li>
              <Link to="/">Home</Link>
            </li>
          </ul>
        </div>
      </div>
      <Footer />
    </div>
  );
}
