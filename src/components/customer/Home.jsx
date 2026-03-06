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
  return array
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
};

// SLIDESHOW CARD COMPONENT (Used for Finished, Raw, and Designers)
const Card = ({ images, title, onClick }) => {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    if (!images || images.length <= 1) return;

    const interval = setInterval(() => {
      setFade(true);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % images.length);
        setFade(false);
      }, 300); 
    }, 4500); 

    return () => clearInterval(interval);
  }, [images?.length]);

  const displayImages = useMemo(() => {
    if (images && images.length > 0) return images;
    // Default fallback if DB is empty
    return ["https://images.pexels.com/photos/276514/pexels-photo-276514.jpeg?auto=compress&cs=tinysrgb&w=800"];
  }, [images]);

  return (
    <div className="partition-card-vertical" onClick={onClick}>
      <div className="partition-img-box">
        <Image
          src={displayImages[index % displayImages.length]}
          alt={title}
          className={`slideshow-img ${fade ? "fade-out" : "fade-in"}`}
          fill
          style={{ objectFit: 'cover' }}
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
  const [workerImages, setWorkerImages] = useState([]); // State for Service Workers

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [finishedRes, rawRes, designersRes, workersRes] = await Promise.all([
          fetch(`/api/products?type=finished`),
          fetch(`/api/products?type=material`),
          fetch(`/api/designers`),
          fetch(`/api/products?type=worker`) // Fetching workers from DB
        ]);

        const finishedData = await finishedRes.json();
        const rawData = await rawRes.json();
        const designersData = await designersRes.json();
        const workersData = await workersRes.json();

        // 1. Finished Products: Shuffle and slice top 10
        const allFinished = Array.isArray(finishedData) 
          ? finishedData.map(p => p.images?.[0]).filter(Boolean) 
          : [];
        setFinishedImages(shuffleArray(allFinished).slice(0, 10));

        // 2. Raw Materials: Shuffle and slice top 10
        const allRaw = Array.isArray(rawData) 
          ? rawData.map(p => p.images?.[0]).filter(Boolean) 
          : [];
        setRawImages(shuffleArray(allRaw).slice(0, 10));
        
        // 3. Designers: Extracting from DesignerWork model (works relation)
        const allWorkImages = Array.isArray(designersData) 
          ? designersData.flatMap(d => (d.works || []).map(w => w.image)).filter(Boolean)
          : [];
        setDesignerImages(shuffleArray(allWorkImages).slice(0, 15));

        // 4. Service Workers: Shuffle and slice images from worker listings
        const allWorkers = Array.isArray(workersData)
          ? workersData.map(w => w.images?.[0]).filter(Boolean)
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

          {/* Section 3: Designers */}
          <Card
            title="Interior & Product Designers"
            images={designerImages}
            onClick={() => router.push("/designers")}
          />

          {/* Section 4: Worker Service (Separate Component with Customize button) */}
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