"use client";

import React, { useState } from "react";
import "./SellerLogin.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { sellerLogin } from "../../api/auth";
import CoreToCoverLogo from "../../assets/logo/CoreToCover_2_.png";
import LoadingSpinner from "../ui/LoadingSpinner";

const SellerLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 1. SESSION CHECK (Redirect if already logged in)
  React.useEffect(() => {
    // Check both, but preference key is in localStorage now
    const sellerId = localStorage.getItem("sellerId") || sessionStorage.getItem("sellerId");
    if (sellerId) {
      router.replace("/sellerdashboard");
    }
  }, [router]);

  /* =========================================
      EASY ENCRYPTION HELPERS
  ========================================= */

  /**
   * Scrambles data before saving to Storage to prevent plain-text visibility.
   */
  const secureSetItem = (storage, key, value) => {
    if (!value) return;
    const encodedValue = btoa(String(value)); // Encodes to Base64
    storage.setItem(key, encodedValue);
  };

  /**
   * Decodes the backend payload.
   */
  const decodePayload = (payload) => {
    try {
      return JSON.parse(atob(payload));
    } catch (e) {
      console.error("Payload decoding failed:", e);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert("Please enter email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await sellerLogin({
        email: email.toLowerCase().trim(),
        password
      });

      const data = response?.data ?? response;

      // FORCE PERSISTENCE: Always use localStorage (Like Designer Login)
      const storage = localStorage;

      // Clear specific keys in BOTH storages to avoid conflicts/leftovers
      localStorage.removeItem("sellerId");
      localStorage.removeItem("sellerEmail");
      localStorage.removeItem("sellerProfile");
      sessionStorage.removeItem("sellerId");
      sessionStorage.removeItem("sellerEmail");
      sessionStorage.removeItem("sellerProfile");

      // Handle the encrypted payload from the backend
      if (data?.payload) {
        const decodedSeller = decodePayload(data.payload);

        // Save new data in scrambled format for privacy in "Inspect" tool
        const encrypt = (val) => btoa(String(val));

        storage.setItem("sellerId", encrypt(decodedSeller.id));
        storage.setItem("sellerEmail", encrypt(decodedSeller.email));
        storage.setItem("sellerProfile", encrypt(JSON.stringify(decodedSeller)));

        // Trigger storage event for Navbar/Sidebar synchronization
        window.dispatchEvent(new Event("storage"));
        router.push("/sellerdashboard");
      }
    } catch (err) {
      alert(err?.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <LoadingSpinner message="Accessing your store dashboard..." />}

      <div className="login-container">
        <div className="login-card">
          <Image
            src={CoreToCoverLogo}
            alt="CoreToCover"
            className="brand-logo"
            width={150}
            height={50}
            priority
            style={{ width: 'auto', height: 'auto', maxWidth: '200px' }}
          />
          <h4>Welcome back, Seller</h4>
          <p className="subtitle">Log in to manage your store</p>

          <form onSubmit={handleSubmit}>
            <div className="input-groups">
              <label>Email</label>
              <input
                type="email"
                placeholder="seller@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-groups">
              <label>Password</label>
              <div className="password-fld">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ borderRadius: '0', border: 'none', outline: 'none', height: '100%', width: '100%' }}
                />
                <button
                  type="button"
                  className="toggle_btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <p className="signup-text">
              Don’t have a seller account?{" "}
              <Link href="/sellersignup">Sign up</Link>
            </p>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Authenticating..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default SellerLogin;