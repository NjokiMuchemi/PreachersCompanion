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
        <div style={brandBox}>
          <h1 style={brandTitle}>PREACHER&apos;S COMPANION</h1>

          <p style={tagline}>From Revelation to Proclamation</p>

          <p style={scriptureStyle}>
            He who has my word, let him speak my word faithfully.
            <br />
            Jeremiah 23:28
          </p>
        </div>

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

        <div style={forgotWrapper}>
          <Link to="/forgot-password" style={forgotLinkStyle}>
            Forgot Password?
          </Link>
        </div>

        <button style={buttonStyle} onClick={handleLogin}>
          Login
        </button>

        <p style={bottomTextStyle}>
          Need access approval?{" "}
          <Link to="/signup" style={linkStyle}>
            Contact Admin
          </Link>
        </p>

        <div style={poweredBox}>
          Powered by Nebkona Investors Ltd
          <br />
          Technologies Division @2026
        </div>
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
  maxWidth: "460px",
  boxShadow: "0 0 30px rgba(0,0,0,0.4)",
};

const brandBox = {
  textAlign: "center",
  marginBottom: "26px",
};

const brandTitle = {
  color: "#f59e0b",
  margin: 0,
  fontSize: "38px",
  lineHeight: "1.05",
  fontWeight: "900",
};

const tagline = {
  color: "white",
  fontSize: "18px",
  fontWeight: "bold",
  marginTop: "12px",
  marginBottom: "10px",
};

const scriptureStyle = {
  color: "#cbd5e1",
  fontSize: "14px",
  lineHeight: "1.6",
  fontStyle: "italic",
};

const subtitleStyle = {
  color: "#94a3b8",
  textAlign: "center",
  marginBottom: "28px",
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

const forgotWrapper = {
  textAlign: "right",
  marginTop: "-10px",
  marginBottom: "20px",
};

const forgotLinkStyle = {
  color: "#f59e0b",
  textDecoration: "none",
  fontSize: "14px",
  fontWeight: "bold",
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

const poweredBox = {
  marginTop: "28px",
  paddingTop: "18px",
  borderTop: "1px solid #334155",
  color: "#64748b",
  textAlign: "center",
  fontSize: "13px",
  lineHeight: "1.5",
};

export default Login;
