import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function handleReset() {
    if (!email.trim()) {
      alert("Please enter your email address.");
      return;
    }

    const redirectTo = `${window.location.origin}/update-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      alert(error.message);
      return;
    }

    setMessage("Password reset link sent. Please check your email.");
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={headingStyle}>Reset Password</h1>

        <p style={subtitleStyle}>
          Enter your email address and we will send you a password reset link.
        </p>

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />

        <button style={buttonStyle} onClick={handleReset}>
          Send Reset Link
        </button>

        {message && <p style={successText}>{message}</p>}

        <p style={bottomTextStyle}>
          Remembered your password?{" "}
          <Link to="/" style={linkStyle}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "#020617",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontFamily: "Arial, sans-serif",
  padding: "20px",
};

const cardStyle = {
  background: "#0f172a",
  padding: "40px",
  borderRadius: "20px",
  width: "100%",
  maxWidth: "420px",
  boxShadow: "0 0 30px rgba(0,0,0,0.4)",
};

const headingStyle = {
  color: "white",
  marginBottom: "10px",
  textAlign: "center",
  fontSize: "42px",
  lineHeight: "1.05",
};

const subtitleStyle = {
  color: "#94a3b8",
  textAlign: "center",
  marginBottom: "30px",
};

const inputStyle = {
  width: "100%",
  padding: "14px",
  marginBottom: "20px",
  borderRadius: "10px",
  border: "1px solid #334155",
  background: "#1e293b",
  color: "white",
  fontSize: "16px",
  boxSizing: "border-box",
};

const buttonStyle = {
  width: "100%",
  padding: "14px",
  background: "#f59e0b",
  border: "none",
  borderRadius: "10px",
  fontSize: "16px",
  fontWeight: "bold",
  cursor: "pointer",
};

const successText = {
  color: "#22c55e",
  textAlign: "center",
  marginTop: "18px",
};

const bottomTextStyle = {
  color: "#94a3b8",
  textAlign: "center",
  marginTop: "20px",
};

const linkStyle = {
  color: "#f59e0b",
  textDecoration: "none",
  fontWeight: "bold",
};

export default ForgotPassword;