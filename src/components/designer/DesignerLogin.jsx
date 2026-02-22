"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./DesignerLogin.css";
import { designerLogin } from "../../api/designer";
import LoadingSpinner from "../ui/LoadingSpinner";

const DesignerLogin = () => {
  const Brand = ({ children }) => <span className="brand">{children}</span>;
  const router = useRouter();

  const [form, setForm] = useState({ email: "", password: "" });

  // 1. SESSION CHECK (Redirect if already logged in)
  React.useEffect(() => {
    const designerId = localStorage.getItem("designerId");
    if (designerId) {
      router.replace("/designerdashboard");
    }
  }, [router]);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  /* =========================================
      EASY ENCRYPTION HELPERS
  ========================================= */

  const decodePayload = (payload) => {
    try {
      return JSON.parse(atob(payload));
    } catch (e) {
      console.error("Payload decoding failed:", e);
      return null;
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await designerLogin({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      const data = res.data;
      const storage = localStorage;

      if (data?.payload) {
        const decodedDesigner = decodePayload(data.payload);

        if (decodedDesigner?.id) {
          localStorage.removeItem("designerId");
          sessionStorage.removeItem("designerId");

          const encryptedId = btoa(String(decodedDesigner.id));
          storage.setItem("designerId", encryptedId);

          router.push("/designerdashboard");
        } else {
          throw new Error("Invalid payload data");
        }
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      console.error("DESIGNER LOGIN ERROR:", err);
      setError(err?.response?.data?.message || "Invalid email or password");
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
      const res = await fetch("/api/designer/send-otp", {
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
      const res = await fetch("/api/designer/verify-otp", {
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
      const res = await fetch("/api/designer/reset-password", {
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
      <div className="designer-login-page">
        {loading && <LoadingSpinner message="Accessing workspace..." />}

        <div className="login-box login-reveal">
          <h1 className="login-logo">
            <Brand>Core2Cover</Brand>
          </h1>
          <p className="login-sub">Login to your designer workspace</p>
          {error && <p className="auth-error">{error}</p>}

          <form onSubmit={handleLogin} className="login-form">
            <div className="login-field">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="login-field password-field">
              <label>Password</label>
              <div className="password-input-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <span
                  className="eye-btn"
                  onClick={() => setShowPassword((s) => !s)}
                  role="button"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>

            <div className="fp-row">
              <button type="button" className="fp-link" onClick={openForgotPassword}>
                Forgot password?
              </button>
            </div>

            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="login-footer">
            New to Core2Cover?{" "}
            <Link href="/designersignup" className="login-link">
              Sign up as Designer
            </Link>
          </p>
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
                    <p className="fp-sub">Enter your registered designer email to receive an OTP.</p>
                    {fpError && <p className="fp-error">{fpError}</p>}
                    <input
                      className="fp-input"
                      type="email"
                      placeholder="designer@example.com"
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
                    <p className="fp-sub">Set a new password for your designer account.</p>
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

export default DesignerLogin;