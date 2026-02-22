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

  // --- Forgot Password State ---
  const [fpOpen, setFpOpen] = useState(false);
  const [fpStep, setFpStep] = useState(1); // 1: email, 2: OTP, 3: new password
  const [fpEmail, setFpEmail] = useState("");
  const [fpOtp, setFpOtp] = useState("");
  const [fpNewPassword, setFpNewPassword] = useState("");
  const [fpConfirmPassword, setFpConfirmPassword] = useState("");
  const [fpShowNew, setFpShowNew] = useState(false);
  const [fpShowConfirm, setFpShowConfirm] = useState(false);
  const [fpLoading, setFpLoading] = useState(false);
  const [fpError, setFpError] = useState("");
  const [fpSuccess, setFpSuccess] = useState("");

  // 1. SESSION CHECK (Redirect if already logged in)
  React.useEffect(() => {
    const sellerId = localStorage.getItem("sellerId") || sessionStorage.getItem("sellerId");
    if (sellerId) {
      router.replace("/sellerdashboard");
    }
  }, [router]);

  /* =========================================
      EASY ENCRYPTION HELPERS
  ========================================= */

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

      const storage = localStorage;

      localStorage.removeItem("sellerId");
      localStorage.removeItem("sellerEmail");
      localStorage.removeItem("sellerProfile");
      sessionStorage.removeItem("sellerId");
      sessionStorage.removeItem("sellerEmail");
      sessionStorage.removeItem("sellerProfile");

      if (data?.payload) {
        const decodedSeller = decodePayload(data.payload);
        const encrypt = (val) => btoa(String(val));

        storage.setItem("sellerId", encrypt(decodedSeller.id));
        storage.setItem("sellerEmail", encrypt(decodedSeller.email));
        storage.setItem("sellerProfile", encrypt(JSON.stringify(decodedSeller)));

        window.dispatchEvent(new Event("storage"));
        router.push("/sellerdashboard");
      }
    } catch (err) {
      alert(err?.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  /* =========================================
      FORGOT PASSWORD HANDLERS
  ========================================= */

  const openForgotPassword = () => {
    setFpOpen(true);
    setFpStep(1);
    setFpEmail("");
    setFpOtp("");
    setFpNewPassword("");
    setFpConfirmPassword("");
    setFpError("");
    setFpSuccess("");
  };

  const closeForgotPassword = () => {
    setFpOpen(false);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!fpEmail) { setFpError("Please enter your email."); return; }
    setFpLoading(true);
    setFpError("");
    try {
      const res = await fetch("/api/seller/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fpEmail.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setFpStep(2);
    } catch (err) {
      setFpError(err.message || "Failed to send OTP. Check your email and try again.");
    } finally {
      setFpLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!fpOtp) { setFpError("Please enter the OTP."); return; }
    setFpLoading(true);
    setFpError("");
    try {
      const res = await fetch("/api/seller/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fpEmail.trim().toLowerCase(), otp: fpOtp.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setFpStep(3);
    } catch (err) {
      setFpError(err.message || "Invalid or expired OTP.");
    } finally {
      setFpLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!fpNewPassword || !fpConfirmPassword) { setFpError("Please fill in all fields."); return; }
    if (fpNewPassword.length < 6) { setFpError("Password must be at least 6 characters."); return; }
    if (fpNewPassword !== fpConfirmPassword) { setFpError("Passwords do not match."); return; }
    setFpLoading(true);
    setFpError("");
    try {
      const res = await fetch("/api/seller/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: fpEmail.trim().toLowerCase(),
          otp: fpOtp.trim(),
          newPassword: fpNewPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setFpSuccess("Password reset successfully! You can now log in.");
      setTimeout(() => closeForgotPassword(), 2500);
    } catch (err) {
      setFpError(err.message || "Failed to reset password.");
    } finally {
      setFpLoading(false);
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

            <div className="fp-row">
              <button type="button" className="fp-link" onClick={openForgotPassword}>
                Forgot password?
              </button>
            </div>

            <p className="signup-text">
              Don&apos;t have a seller account?{" "}
              <Link href="/sellersignup">Sign up</Link>
            </p>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Authenticating..." : "Login"}
            </button>
          </form>
        </div>
      </div>

      {/* ======== FORGOT PASSWORD MODAL ======== */}
      {fpOpen && (
        <div className="fp-overlay" onClick={closeForgotPassword}>
          <div className="fp-modal" onClick={(e) => e.stopPropagation()}>
            <button className="fp-close" onClick={closeForgotPassword} aria-label="Close">✕</button>

            {/* Step indicators */}
            <div className="fp-steps">
              {[1, 2, 3].map((s) => (
                <span key={s} className={`fp-step-dot ${fpStep >= s ? "active" : ""}`} />
              ))}
            </div>

            {fpSuccess ? (
              <div className="fp-success">
                <span className="fp-success-icon">✓</span>
                <p>{fpSuccess}</p>
              </div>
            ) : (
              <>
                {/* STEP 1 — Enter Email */}
                {fpStep === 1 && (
                  <form onSubmit={handleSendOtp}>
                    <h3 className="fp-title">Forgot Password</h3>
                    <p className="fp-sub">Enter your registered seller email to receive an OTP.</p>
                    {fpError && <p className="fp-error">{fpError}</p>}
                    <input
                      className="fp-input"
                      type="email"
                      placeholder="seller@example.com"
                      value={fpEmail}
                      onChange={(e) => setFpEmail(e.target.value)}
                      required
                    />
                    <button className="fp-btn" type="submit" disabled={fpLoading}>
                      {fpLoading ? "Sending..." : "Send OTP"}
                    </button>
                  </form>
                )}

                {/* STEP 2 — Verify OTP */}
                {fpStep === 2 && (
                  <form onSubmit={handleVerifyOtp}>
                    <h3 className="fp-title">Enter OTP</h3>
                    <p className="fp-sub">We sent a 6-digit code to <strong>{fpEmail}</strong>.</p>
                    {fpError && <p className="fp-error">{fpError}</p>}
                    <input
                      className="fp-input fp-otp-input"
                      type="text"
                      placeholder="______"
                      maxLength={6}
                      value={fpOtp}
                      onChange={(e) => setFpOtp(e.target.value.replace(/\D/g, ""))}
                      required
                    />
                    <button className="fp-btn" type="submit" disabled={fpLoading}>
                      {fpLoading ? "Verifying..." : "Verify OTP"}
                    </button>
                    <button type="button" className="fp-resend" onClick={handleSendOtp} disabled={fpLoading}>
                      Resend OTP
                    </button>
                  </form>
                )}

                {/* STEP 3 — New Password */}
                {fpStep === 3 && (
                  <form onSubmit={handleResetPassword}>
                    <h3 className="fp-title">Reset Password</h3>
                    <p className="fp-sub">Set a new password for your seller account.</p>
                    {fpError && <p className="fp-error">{fpError}</p>}
                    <div className="fp-pw-wrap">
                      <input
                        className="fp-input"
                        type={fpShowNew ? "text" : "password"}
                        placeholder="New password"
                        value={fpNewPassword}
                        onChange={(e) => setFpNewPassword(e.target.value)}
                        required
                      />
                      <button type="button" className="fp-eye" onClick={() => setFpShowNew((v) => !v)}>
                        {fpShowNew ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    <div className="fp-pw-wrap">
                      <input
                        className="fp-input"
                        type={fpShowConfirm ? "text" : "password"}
                        placeholder="Confirm new password"
                        value={fpConfirmPassword}
                        onChange={(e) => setFpConfirmPassword(e.target.value)}
                        required
                      />
                      <button type="button" className="fp-eye" onClick={() => setFpShowConfirm((v) => !v)}>
                        {fpShowConfirm ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    <button className="fp-btn" type="submit" disabled={fpLoading}>
                      {fpLoading ? "Resetting..." : "Reset Password"}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default SellerLogin;
