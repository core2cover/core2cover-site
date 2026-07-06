"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  FaSearch,
  FaShoppingCart,
  FaSignOutAlt,
  FaStore,
  FaPalette,
  FaUserCircle,
  FaUserGraduate,
  FaTimes,
  FaSignInAlt,
  FaTools 
} from "react-icons/fa";
import { IoMdInformationCircle } from "react-icons/io";
import "./Navbar.css";
import CoreToCoverLogo from "../../assets/logo/CoreToCover_3.png";

const BrandBold = ({ children }) => (
  <span className="brand brand-bold">{children}</span>
);

const Navbar = () => {
  const { data: session, status } = useSession();
  const [profileOpen, setProfileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [localUser, setLocalUser] = useState(null);
  const [mounted, setMounted] = useState(false);

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const profileRef = useRef(null);
  const searchRef = useRef(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const rawMaterialSuggestions = ["Plywood", "Laminates", "Paints", "Hardware", "Glass & Mirrors", "Tiles", "Flooring", "Adhesives", "Electricals", "Plumbing"];
  const designerSuggestions = ["Interior Designer", "Kitchen Designer", "Product Designer", "Architect", "3D Visualizer"];
  const readymadeSuggestions = ["Furniture", "Lights", "Lighting", "Decor Items", "Sofa", "Dining Table", "Beds", "Wardrobes", "Office Chairs"];
  
  // NEW: Worker Suggestions
  const workerSuggestions = ["Plumber", "Plumbing", "Plumbing Workers", "Carpenter", "Electrician", "Construction Worker", "Painter"];

  useEffect(() => {
    setMounted(true);
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const secureGetItem = useCallback((key) => {
    if (typeof window === "undefined") return null;
    const item = localStorage.getItem(key);
    try {
      return item ? atob(item) : null;
    } catch (e) {
      return item;
    }
  }, []);

  useEffect(() => {
    const email = secureGetItem("userEmail");
    const name = secureGetItem("userName");
    const id = secureGetItem("userId");

    if (email) {
      setLocalUser({ email, name, id });
    } else {
      setLocalUser(null);
    }
  }, [pathname, secureGetItem]);

  const isUserAuthenticated = status === "authenticated" || !!localUser;
  const displayUser = session?.user || localUser;

  const isDesignerSection = pathname.includes("/designers") || pathname.includes("/designer_info");
  const isRawMaterialsPage = searchParams.get("page") === "Raw Materials";
  const isHomePage = pathname === "/";
  const isContactPage = pathname === "/contact";
  const isProfilePage = pathname === "/userprofile";
  const isTermsPage = pathname === "/terms";
  const isRefundPage = pathname === "/refund-policy";
  const isShippingPage = pathname === "/shipping-policy";
  const isPrivacyPage = pathname === "/privacy";

  const currentPageTitle = isDesignerSection 
    ? "Professional Designers" 
    : isRawMaterialsPage 
    ? "Raw Materials" 
    : isHomePage 
    ? "Products or Workers" 
    : "Readymade Products";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);

    if (value.trim().length > 0) {
      let pool = [];
      if (isDesignerSection) {
        pool = designerSuggestions;
      } else if (isRawMaterialsPage) {
        pool = rawMaterialSuggestions;
      } else if (isHomePage) {
        pool = [...readymadeSuggestions, ...workerSuggestions, ...rawMaterialSuggestions];
      } else {
        pool = readymadeSuggestions;
      }

      const filtered = pool.filter(item =>
        item.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions([...new Set(filtered)].slice(0, 8));
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const performSearch = (query) => {
    const lowerQuery = query.toLowerCase();
    
    // Logic to detect if searching for a worker
    const isWorkerQuery = workerSuggestions.some(w => lowerQuery.includes(w.toLowerCase()));

    if (isWorkerQuery) {
      router.push(`/searchresults?search=${encodeURIComponent(query)}&type=worker`);
    } else if (lowerQuery.includes("near me") && (isRawMaterialsPage || isHomePage)) {
      const cleanQuery = lowerQuery.replace("near me", "").trim();
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            router.push(`/searchresults?search=${encodeURIComponent(cleanQuery)}&lat=${latitude}&lng=${longitude}&nearby=true`);
          },
          () => {
            router.push(`/searchresults?search=${encodeURIComponent(query)}`);
          }
        );
      }
    } else {
      let finalQuery = query;
      if (isDesignerSection) {
        finalQuery = query.replace(/\bdesigners?\b/gi, "").trim() || "Interior";
      }
      const targetPath = isDesignerSection ? "/designers" : "/searchresults";
      const pageParam = isRawMaterialsPage ? "&page=Raw%20Materials" : "";
      router.push(`${targetPath}?search=${encodeURIComponent(finalQuery)}${pageParam}`);
    }
    setShowSuggestions(false);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (searchValue.trim()) performSearch(searchValue);
  };

  const handleProfileToggle = () => setProfileOpen(!profileOpen);

  const handleSignOut = async () => {
    localStorage.clear();
    setLocalUser(null);
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <>
      <header className="navbar">
        <div className="nav-container">
          <div className="nav-left">
            <Link href="/" className="nav-logo-link">
              <span className="nav-logo-wrap">
                <Image src={CoreToCoverLogo} alt="Logo" width={50} height={50} priority />
                <BrandBold>Core2Cover</BrandBold>
              </span>
            </Link>
          </div>

          <div className="nav-right">
            <div className="nav-icons-desktop">
              <Link href="/about" className="nav-link-wrapper">
                <div className="ico">
                  <IoMdInformationCircle className="info-icon-themed" />
                  <span className="nav-icon-link">About</span>
                </div>
              </Link>
              <Link href="/designers" className="nav-link-wrapper">
                <div className="ico">
                  <FaUserGraduate className="info-icon-themed" />
                  <span className="nav-icon-link">Designers</span>
                </div>
              </Link>
              {!isMobile && (
                <Link href="/cart" className="nav-link-wrapper">
                  <div className="ico">
                    <FaShoppingCart className="info-icon-themed" />
                    <span className="nav-icon-link">Cart</span>
                  </div>
                </Link>
              )}
              <div className="profile-dropdown-container" ref={profileRef}>
                <div className="nav-profile-trigger" onClick={handleProfileToggle}>
                  <div className="ico">
                    {mounted && displayUser?.image ? (
                      <Image src={displayUser.image} alt="User" className="nav-user-avatar" width={35} height={35} unoptimized />
                    ) : (
                      <FaUserCircle className="info-icon-themed" />
                    )}
                  </div>
                </div>
                {profileOpen && (
                  <div className="profile-popover shadow-reveal">
                    <button className="pop-close-btn" onClick={() => setProfileOpen(false)}><FaTimes /></button>
                    {isUserAuthenticated ? (
                      <>
                        <div className="popover-header">
                          <p className="pop-name">{displayUser?.name || "User"}</p>
                          <p className="pop-email">{displayUser?.email}</p>
                        </div>
                        <div className="popover-body">
                          <Link href="/userprofile" className="pop-item" onClick={() => setProfileOpen(false)}><FaUserCircle /> My Account</Link>
                          {isMobile && <Link href="/cart" className="pop-item" onClick={() => setProfileOpen(false)}><FaShoppingCart /> My Cart</Link>}
                          <Link href="/sellersignup" className="pop-item" onClick={() => setProfileOpen(false)}><FaStore /> Become a Seller</Link>
                          <Link href="/designersignup" className="pop-item" onClick={() => setProfileOpen(false)}><FaPalette /> I am a Designer</Link>
                        </div>
                        <div className="popover-footer">
                          <button className="pop-signout" onClick={handleSignOut}>SignOut <FaSignOutAlt /></button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="popover-header">
                          <p className="pop-name">Welcome Guest</p>
                          <p className="pop-email">Please login to manage your account</p>
                        </div>
                        <div className="popover-body">
                          <Link href="/login" className="pop-item" onClick={() => setProfileOpen(false)}><FaSignInAlt /> Login / Sign Up</Link>
                          <Link href="/sellersignup" className="pop-item" onClick={() => setProfileOpen(false)}><FaStore /> Become a Seller</Link>
                          <Link href="/designersignup" className="pop-item" onClick={() => setProfileOpen(false)}><FaPalette /> I am a Designer</Link>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Renders on Home and standard product pages */}
      {!isContactPage && !isProfilePage && !isTermsPage && !isRefundPage && !isShippingPage && !isPrivacyPage && (
        <div className="search-container">
          <div className="search-wrapper" ref={searchRef}>
            <form onSubmit={handleFormSubmit} className="search_form">
              <input
                name="search"
                className="search_input"
                type="text"
                placeholder={`Search ${currentPageTitle}...`}
                value={searchValue}
                onChange={handleInputChange}
                autoComplete="off"
              />
              <button type="submit" className="search_button"><FaSearch /></button>
            </form>
            {showSuggestions && suggestions.length > 0 && (
              <ul className="search-suggestions">
                {suggestions.map((s, i) => (
                  <li key={i} onClick={() => { setSearchValue(s); performSearch(s); }}>
                    <FaSearch className="suggestion-icon" />
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;