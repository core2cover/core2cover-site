"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Components
import Footer from "./Footer";
import Navbar from "./Navbar";
import LoadingSpinner from "../ui/LoadingSpinner";
import WorkerServiceCard from "./WorkerServiceButton";
import "./Home.css";

// Helper function to shuffle arrays for true randomness
const shuffleArray = (array) => {
  if (!array) return [];
  return array
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
};

// SLIDESHOW CARD COMPONENT
const Card = ({ images, title, onClick }) => {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(false);

  // Filter out any potential nulls or undefined strings
  const validImages = useMemo(() => {
    const filtered = (images || []).filter(img => typeof img === 'string' && img.trim() !== "");
    // Fallback if no images are provided
    return filtered.length > 0 ? filtered : ["https://images.pexels.com/photos/276514/pexels-photo-276514.jpeg?auto=compress&cs=tinysrgb&w=800"];
  }, [images]);

  useEffect(() => {
    if (validImages.length <= 1) return;

    const interval = setInterval(() => {
      setFade(true);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % validImages.length);
        setFade(false);
      }, 300);
    }, 4500);

    return () => clearInterval(interval);
  }, [validImages]);

  return (
    <div className="partition-card-vertical" onClick={onClick}>
      <div className="partition-img-box" style={{ background: '#f8f8f8', position: 'relative', overflow: 'hidden' }}>
        <Image
          src={validImages[index % validImages.length]}
          alt={title}
          className={`slideshow-img ${fade ? "fade-out" : "fade-in"}`}
          fill
          style={{ objectFit: 'contain' }} // Fix: Ensures full image is visible without cropping
          unoptimized={true}
        />
      </div>
      <h2 className="partition-title-under">{title}</h2>
    </div>
  );
};

const Home = () => {
  const router = useRouter();
  const [pageLoading, setPageLoading] = useState(true);

  const [finishedImages, setFinishedImages] = useState([]);
  const [rawImages, setRawImages] = useState([]);
  const [designerImages, setDesignerImages] = useState([]);
  const [workerImages, setWorkerImages] = useState([]);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [finishedRes, rawRes, designersRes, workersRes] = await Promise.all([
          fetch(`/api/products?type=finished`),
          fetch(`/api/products?type=material`),
          fetch(`/api/designers`),
          fetch(`/api/products?type=worker`)
        ]);

        // Safely parse JSON with error handling
        const finishedData = await finishedRes.json().catch(() => []);
        const rawData = await rawRes.json().catch(() => []);
        const designersData = await designersRes.json().catch(() => []);
        const workersData = await workersRes.json().catch(() => []);

        // 1. Finished Products Extraction
        const allFinished = Array.isArray(finishedData)
          ? finishedData.map(p => p.images?.[0]).filter(img => img != null && img !== "")
          : [];
        setFinishedImages(shuffleArray(allFinished).slice(0, 10));

        // 2. Raw Materials Extraction
        const allRaw = Array.isArray(rawData)
          ? rawData.map(p => p.images?.[0]).filter(img => img != null && img !== "")
          : [];
        setRawImages(shuffleArray(allRaw).slice(0, 10));

        // 3. Designers: STRICT PORTFOLIO (DesignerWork) EXTRACTION
        // This ignores profile pictures and only looks for work images
        let allDesignerWorkImages = [];
        if (Array.isArray(designersData)) {
            allDesignerWorkImages = designersData.flatMap(designer => {
            if (Array.isArray(designer.works)) {
              return designer.works
                .map(work => work.image)
                .filter(img => img && typeof img === 'string' && img.trim() !== "");
            }
            return [];
          });
        }
        setDesignerImages(shuffleArray(allDesignerWorkImages).slice(0, 15));

        // 4. Service Workers Extraction
        const allWorkers = Array.isArray(workersData)
          ? workersData.map(w => w.images?.[0]).filter(img => img != null && img !== "")
          : [];
        setWorkerImages(shuffleArray(allWorkers).slice(0, 10));

      } catch (err) {
        console.error("Failed to fetch database images:", err);
      } finally {
        setPageLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <>
      <Navbar />

      {pageLoading && <LoadingSpinner message="Welcome to Core2Cover" />}

      <div
        className={`partition-page ${!pageLoading ? "fade-in" : ""}`}
        style={{ visibility: pageLoading ? 'hidden' : 'visible' }}
      >
        <div className="partition-grid">
          {/* Section 1: Finished Products */}
          <Card
            title="Finished Products"
            images={finishedImages}
            onClick={() => router.push("/productlisting?page=Finished%20Products&desc=Find%20the%20perfect%20product%20that%20enhances%20your%20quality%20of%20living.")}
          />

          {/* Section 2: Raw Materials */}
          <Card
            title="Raw Materials"
            images={rawImages}
            onClick={() => router.push("/productlisting?page=Raw%20Materials&desc=Build%20better%20with%20high-grade%20interior%20raw%20materials.")}
          />

          {/* Section 3: Designers - Now showing strictly work portfolio images */}
          <Card
            title="Interior & Product Designers"
            images={designerImages}
            onClick={() => router.push("/designers")}
          />

          {/* Section 4: Worker Service */}
          <WorkerServiceCard
            title="Expert Service Workers"
            images={workerImages}
          />
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Home;