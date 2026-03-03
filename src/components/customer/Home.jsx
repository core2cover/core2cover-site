"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Components
import Footer from "./Footer";
import Navbar from "./Navbar";
import ProductCard from "./ProductCard";
import DesignerCard from "./DesignerCard";
import LoadingSpinner from "../ui/LoadingSpinner";
import { FaArrowRight, FaBoxOpen, FaLayerGroup, FaUserTie, FaTools, FaPhoneAlt } from "react-icons/fa";
import "./Home.css";

const Home = () => {
  const router = useRouter();
  const [pageLoading, setPageLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");

  const [finishedProducts, setFinishedProducts] = useState([]);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [designers, setDesigners] = useState([]);

  const workers = [
    { id: 1, name: "Plumbers", phone: "8275922422", image: "https://images.pexels.com/photos/2310904/pexels-photo-2310904.jpeg?auto=compress&cs=tinysrgb&w=400" },
    { id: 2, name: "Carpenters", phone: "8275922422", image: "https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg?auto=compress&cs=tinysrgb&w=400" },
    { id: 3, name: "Electricians", phone: "8275922422", image: "https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=400" },
    { id: 4, name: "Construction Workers", phone: "8275922422", image: "https://images.pexels.com/photos/585419/pexels-photo-585419.jpeg?auto=compress&cs=tinysrgb&w=800" },
  ];

  const finishedRef = useRef(null);
  const rawRef = useRef(null);
  const designersRef = useRef(null);
  const workersRef = useRef(null);

  const scrollToSection = (ref) => {
    setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [finishedRes, rawRes, designersRes] = await Promise.all([
          fetch(`/api/products?type=finished`),
          fetch(`/api/products?type=material`),
          fetch(`/api/designers`)
        ]);

        const finishedData = await finishedRes.json();
        const rawData = await rawRes.json();
        const designersData = await designersRes.json();

        setFinishedProducts(Array.isArray(finishedData) ? finishedData.slice(0, 4) : []);
        setRawMaterials(Array.isArray(rawData) ? rawData.slice(0, 4) : []);
        setDesigners(Array.isArray(designersData) ? designersData.slice(0, 4) : []);
      } catch (err) {
        console.error("Home Data Fetch Error:", err);
      } finally {
        setPageLoading(false);
      }
    };
    fetchData();
  }, []);

  if (pageLoading) return <LoadingSpinner message="Welcome to Core2Cover" />;

  const showFinished = activeFilter === "All" || activeFilter === "Finished";
  const showMaterials = activeFilter === "All" || activeFilter === "Materials";
  const showDesigners = activeFilter === "All" || activeFilter === "Designers";
  const showWorkers = activeFilter === "All" || activeFilter === "Workers";

  return (
    <>
      <Navbar />

      <div className="partition-page fade-in">
        
        <div className="filter-button-group">
          <button className={`filter-pill ${activeFilter === "All" ? "active" : ""}`} onClick={() => setActiveFilter("All")}>All</button>
          <button className={`filter-pill ${activeFilter === "Finished" ? "active" : ""}`} onClick={() => { setActiveFilter("Finished"); scrollToSection(finishedRef); }}>Furniture & Products</button>
          <button className={`filter-pill ${activeFilter === "Materials" ? "active" : ""}`} onClick={() => { setActiveFilter("Materials"); scrollToSection(rawRef); }}>Raw Materials</button>
          <button className={`filter-pill ${activeFilter === "Designers" ? "active" : ""}`} onClick={() => { setActiveFilter("Designers"); scrollToSection(designersRef); }}>Designers</button>
          <button className={`filter-pill ${activeFilter === "Workers" ? "active" : ""}`} onClick={() => { setActiveFilter("Workers"); scrollToSection(workersRef); }}>Service Workers</button>
        </div>

        <div className="home-preview-container">

          {showFinished && (
            <section ref={finishedRef} className="preview-section fade-in">
              <div className="section-header">
                <h2><FaBoxOpen className="header-icon" /> Finished Products</h2>
                <button className="view-all-btn" onClick={() => router.push("/productlisting?page=Finished%20Products")}>View All <FaArrowRight /></button>
              </div>
              <div className="product-grid">
                {finishedProducts.map(p => (
                  <ProductCard key={p.id} {...p} title={p.name} origin={p.sellerBusiness ? `${p.sellerBusiness.city}` : "India"} />
                ))}
              </div>
            </section>
          )}

          {showMaterials && (
            <section ref={rawRef} className="preview-section fade-in">
              <div className="section-header">
                <h2><FaLayerGroup className="header-icon" /> Raw Materials</h2>
                <button className="view-all-btn" onClick={() => router.push("/productlisting?page=Raw%20Materials")}>View All <FaArrowRight /></button>
              </div>
              <div className="product-grid">
                {rawMaterials.map(p => (
                  <ProductCard key={p.id} {...p} title={p.name} origin={p.sellerBusiness ? `${p.sellerBusiness.city}` : "India"} />
                ))}
              </div>
            </section>
          )}

          {showDesigners && (
            <section ref={designersRef} className="preview-section fade-in">
              <div className="section-header">
                <h2><FaUserTie className="header-icon" /> Top-Tier Designers</h2>
                <button className="view-all-btn" onClick={() => router.push("/designers")}>Meet All <FaArrowRight /></button>
              </div>
              <div className="product-grid">
                {designers.map(d => (<DesignerCard key={d.id} {...d} />))}
              </div>
            </section>
          )}

          {showWorkers && (
            <section ref={workersRef} className="preview-section fade-in">
              <div className="section-header">
                <h2><FaTools className="header-icon" /> Expert Service Workers</h2>
                {/* No View All Button Here */}
              </div>
              <div className="product-grid"> {/* Reusing product-grid class for consistency */}
                {workers.map(w => (
                  <div key={w.id} className="worker-card-vertical">
                    <div className="worker-card-img-box">
                        <Image src={w.image} alt={w.name} fill className="worker-img" />
                    </div>
                    <div className="worker-card-body">
                        <span className="worker-card-brand">Core2Cover Verified</span>
                        <h3 className="worker-card-title">{w.name}</h3>
                        <a href={`tel:${w.phone}`} className="worker-card-call-btn">
                            <FaPhoneAlt /> Call {w.phone}
                        </a>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      </div>

      <Footer />
    </>
  );
};

export default Home;