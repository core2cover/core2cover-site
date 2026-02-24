"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaStar, FaMapMarkerAlt, FaBriefcase, FaRegUser } from "react-icons/fa";
import "./DesignerCard.css";

const DesignerCard = ({ id, name, category, image, avgRating, totalRatings, location, experience, bio, isLocal }) => {
  const router = useRouter();

  // Robust Image Validation to prevent "Invalid URL" crash
  const finalImage = (typeof image === "string" && image.includes("cloudinary.com"))
    ? image.replace("/upload/", "/upload/w_400,h_400,c_fill,g_face,q_auto,f_auto/")
    : image;

  const truncatedBio = bio
    ? bio.split(" ").slice(0, 6).join(" ") + (bio.split(" ").length > 6 ? "..." : "")
    : "No bio provided.";

  return (
    <article
      className={`dc-card ${isLocal ? "dc-local-highlight" : ""}`}
      onClick={() => router.push(`/designer_info?id=${id}`)}
    >
      <div className="dc-image-container">
        {finalImage ? (
          <Image
            src={finalImage}
            alt={name}
            className="dc-image"
            fill
            unoptimized
            loading="lazy"
          />
        ) : (
          <div className="dc-image dc-icon-fallback">
            <FaRegUser className="dc-fallback-icon" />
          </div>
        )}
        {/* Desktop Category Badge */}
        <span className="dc-badge-category dc-desktop-only">{category}</span>
      </div>

      <div className="dc-info">
        <div className="dc-header-row">
          <h3 className="dc-title">{name}</h3>
          <div className="dc-rating-badge">
            <FaStar className="dc-star-icon" />
            <span className="dc-rating-val">{avgRating || 0}</span>
          </div>
        </div>

        <p className="dc-bio-text">{truncatedBio || "No bio provided."}</p>

        <div className="dc-meta-group">
          <span className="dc-meta-label">
            <FaBriefcase style={{ marginRight: "6px" }} /> {experience || 0} Yrs Experience
          </span>
          <span className="dc-location-label">
            <FaMapMarkerAlt /> {location || "Remote"}
          </span>
          {/* Mobile Specific Category Label */}
          <span className="dc-mobile-category">{category}</span>
        </div>

        <div className="dc-footer-row">
          <span className="dc-status-tag">Verified</span>
          <button className="dc-view-btn">View Profile</button>
        </div>
      </div>
    </article>
  );
};

export default DesignerCard;