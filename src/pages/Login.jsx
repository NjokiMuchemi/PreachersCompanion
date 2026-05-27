import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    navigate("/dashboard");
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={headingStyle}>Preacher&apos;s Companion</h1>

        <p style={subtitleStyle}>
          Access your sermons and ministry notes anywhere.
        </p>

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        <button style={buttonStyle} onClick={handleLogin}>
          Login
        </button>

        <p style={bottomTextStyle}>
          Don&apos;t have an account?{" "}
          <Link to="/signup" style={linkStyle}>
            Sign Up
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

export default Login;