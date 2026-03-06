"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { FaTools, FaTimes, FaPhoneAlt } from "react-icons/fa";
import "./WorkerServiceButton.css";

const WorkerServiceButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState("All");

  const workers = [
    { id: 1, name: "Plumbing Workers", category: "Plumbing", phone: "8275922422", image: "https://images.pexels.com/photos/2310904/pexels-photo-2310904.jpeg?auto=compress&cs=tinysrgb&w=400" },
    { id: 2, name: "Carpenters Workers", category: "Carpentry", phone: "8275922422", image: "https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg?auto=compress&cs=tinysrgb&w=400" },
    { id: 3, name: "Electrician Workers", category: "Electrical", phone: "8275922422", image: "https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=400" },
  ];

  const categories = ["All", "Plumbing", "Carpentry", "Electrical"];

  const filteredWorkers = useMemo(() => {
    if (filter === "All") return workers;
    return workers.filter(w => w.category === filter);
  }, [filter, workers]);

  return (
    <>
      {isOpen && <div className="worker-overlay-backdrop" onClick={() => setIsOpen(false)} />}

      <div className="worker-service-global-wrapper">
        <button 
          className={`worker-customize-btn-global ${isOpen ? "active" : ""}`} 
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <FaTimes /> : <FaTools />}
          <span className="worker-btn-text">{isOpen ? "Close" : "Customize Service"}</span>
        </button>

        {isOpen && (
          <div className="worker-list-overlay animate-slide-up">
            <div className="worker-list-header">
              <h3>We provide these services too..</h3>
              <button className="mobile-close-btn" onClick={() => setIsOpen(false)}><FaTimes /></button>
            </div>

            <div className="worker-category-bar">
              {categories.map(cat => (
                <button 
                  key={cat} 
                  className={`cat-pill ${filter === cat ? "active" : ""}`}
                  onClick={() => setFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
            
            <div className="worker-grid-mini">
              {filteredWorkers.length > 0 ? (
                filteredWorkers.map((w) => (
                  <div key={w.id} className="worker-item-mini">
                    <div className="worker-img-mini">
                      <Image src={w.image} alt={w.name} fill style={{ objectFit: 'cover' }} unoptimized />
                    </div>
                    <div className="worker-info-mini">
                      <span className="worker-tag">CORE2COVER VERIFIED</span>
                      <h4>{w.name}</h4>
                      <a href={`tel:${w.phone}`} className="worker-call-btn-mini">
                        <FaPhoneAlt /> <span>Call {w.phone}</span>
                      </a>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-workers">No workers found in this category.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default WorkerServiceButton;