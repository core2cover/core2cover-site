"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Navbar from "./Navbar";
import ProductCard from "./ProductCard";
import Footer from "./Footer";
import "./SearchResults.css";
import "./ProductListing.css";
import api from "../../api/axios";
import { FaStar, FaGem, FaRegClock, FaLayerGroup, FaArrowLeft, FaPhoneAlt, FaTools } from "react-icons/fa";
import LoadingSpinner from "../ui/LoadingSpinner";

const SearchResults = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchQuery = searchParams.get("search") || "";
  const searchType = searchParams.get("type") || "product";

  const [results, setResults] = useState([]);
  const [workerResults, setWorkerResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // Static Worker Data
  const allWorkers = [
    { id: 1, name: "Plumbers", phone: "8275922422", image: "https://images.pexels.com/photos/2310904/pexels-photo-2310904.jpeg?auto=compress&cs=tinysrgb&w=400" },
    { id: 2, name: "Carpenters", phone: "8275922422", image: "https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg?auto=compress&cs=tinysrgb&w=400" },
    { id: 3, name: "Electricians", phone: "8275922422", image: "https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=400" },
    { id: 4, name: "Construction Workers", phone: "8275922422", image: "https://images.pexels.com/photos/585419/pexels-photo-585419.jpeg?auto=compress&cs=tinysrgb&w=800" },
  ];

  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      setWorkerResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    if (searchType === "worker") {
      const cleanQuery = searchQuery.toLowerCase().trim();
      const queryWords = cleanQuery.split(" ").filter(w => w.length > 2);

      // Define "generic" words to ignore if more specific terms are present
      const genericWords = ["worker", "workers", "service", "expert"];

      const filteredWorkers = allWorkers.filter(worker => {
        const workerNameLower = worker.name.toLowerCase();

        // 1. Check for an Exact Full String Match (Highest Priority)
        if (workerNameLower.includes(cleanQuery)) return true;

        // 2. Check for Specific Industry Keywords (Plumbing, Carpenter, etc.)
        const hasSpecificIndustryMatch = queryWords.some(word => {
          // Skip matching if the only word found is a generic one like "workers"
          if (genericWords.includes(word)) return false;

          const singularWord = word.replace(/s$/, "");
          // e.g., "plumbing" matches "plumbing", "plumber" matches "plumbing"
          return workerNameLower.includes(singularWord) || "plumbing".includes(singularWord);
        });

        return hasSpecificIndustryMatch;
      });

      setWorkerResults(filteredWorkers);
      setResults([]);
      setLoading(false);
    } else {
      api.get("/products/search", { params: { q: searchQuery } })
        .then((res) => {
          setResults(Array.isArray(res.data) ? res.data : []);
          setWorkerResults([]);
        })
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }
  }, [searchQuery, searchType]);

  // UI rendering logic remains exactly the same as your provided code
  const categorizedData = useMemo(() => {
    return {
      topRated: results.filter(p => Number(p.avgRating) >= 4.5),
      premium: results.filter(p => Number(p.price) >= 15000),
      newArrivals: [...results].sort((a, b) => b.id - a.id).slice(0, 4),
      others: results.filter(p => Number(p.avgRating) < 4.5 && Number(p.price) < 15000)
    };
  }, [results]);

  const renderSection = (title, icon, list) => {
    if (list.length === 0) return null;
    return (
      <div className="portfolio-section" style={{ marginTop: '50px', textAlign: 'left' }}>
        <h2 className="section-title-themed"> {icon} {title} </h2>
        <div className="product-grid">
          {list.map((product) => (
            <ProductCard key={product.id} {...product} title={product.name} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <Navbar />
      {loading && <LoadingSpinner message="Searching our collection..." />}

      <div className="products-section">
        <div className="listing-top-nav">
          <button className="back-btn" onClick={() => router.back()}><FaArrowLeft /> Back</button>
        </div>

        <h1 className="products-title">Search Results</h1>
        <p className="products-subtitle">
          Showing results for: <strong>{searchQuery}</strong>
        </p>

        {loading ? null : (searchType === "worker" && workerResults.length > 0) ? (
          <div className="portfolio-section" style={{ marginTop: '50px' }}>
            <h2 className="section-title-themed"><FaTools /> Professional Service Workers</h2>
            <div className="product-grid">
              {workerResults.map(w => (
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
          </div>
        ) : results.length === 0 && workerResults.length === 0 ? (
          <div className="no-results">No results found matching "{searchQuery}".</div>
        ) : (
          <>
            {renderSection("Top Rated Matches", <FaStar style={{ color: '#facc15' }} />, categorizedData.topRated)}
            {renderSection("Premium Finds", <FaGem style={{ color: '#91A56E' }} />, categorizedData.premium)}
            {renderSection("Recent Additions", <FaRegClock />, categorizedData.newArrivals)}
            {renderSection("Browse All Results", <FaLayerGroup />, categorizedData.others)}
          </>
        )}
      </div>
      <Footer />

      <style jsx>{`
        .section-title-themed {
            display: flex;
            align-items: center;
            gap: 15px;
            font-size: 2rem;
            color: #606E52;
            font-family: 'Playfair Display', serif;
            font-weight: 500;
        }
      `}</style>
    </>
  );
};

export default SearchResults;