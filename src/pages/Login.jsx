import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import brandHero from "../assets/brand-hero.png";

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
      <div style={loginShell}>
        <section style={formPanel}>
          <div style={brandBox}>
            <p style={miniLabel}>Digital Sermon Workspace</p>

            <h1 style={brandTitle}>PREACHER&apos;S COMPANION</h1>

            <p style={tagline}>From Revelation to Proclamation</p>

            <p style={scriptureStyle}>
              “He who has my word, let him speak my word faithfully.”
              <br />
              Jeremiah 23:28
            </p>
          </div>

          <p style={subtitleStyle}>
            Access, prepare, organize and preserve your ministry messages anywhere.
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
        </section>

        <section style={heroPanel}>
          <div style={heroOverlay} />
          <img src={brandHero} alt="Preacher's Companion digital pulpit" style={heroImage} />

          <div style={heroCaption}>
            <h2 style={heroTitle}>The Digital Pulpit</h2>
            <p style={heroText}>
              Prepare sermons, preserve revelation, and carry your ministry notes wherever you go.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "radial-gradient(circle at top, #111827 0%, #020617 55%, #000 100%)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontFamily: "Arial, sans-serif",
  padding: "24px",
};

const loginShell = {
  width: "100%",
  maxWidth: "1120px",
  minHeight: "680px",
  background: "#0f172a",
  border: "1px solid #334155",
  borderRadius: "28px",
  overflow: "hidden",
  boxShadow: "0 30px 80px rgba(0,0,0,0.55)",
  display: "grid",
  gridTemplateColumns: "460px 1fr",
};

const formPanel = {
  padding: "46px",
  background: "#0f172a",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
};

const heroPanel = {
  position: "relative",
  background: "#020617",
  overflow: "hidden",
  minHeight: "680px",
};

const heroImage = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  objectPosition: "center",
  display: "block",
};

const heroOverlay = {
  position: "absolute",
  inset: 0,
  background:
    "linear-gradient(90deg, rgba(2,6,23,0.55), rgba(2,6,23,0.1)), linear-gradient(0deg, rgba(2,6,23,0.75), transparent 45%)",
  zIndex: 1,
};

const heroCaption = {
  position: "absolute",
  zIndex: 2,
  left: "34px",
  right: "34px",
  bottom: "34px",
  background: "rgba(2, 6, 23, 0.72)",
  border: "1px solid rgba(212,160,23,0.45)",
  borderRadius: "18px",
  padding: "20px",
  backdropFilter: "blur(8px)",
};

const heroTitle = {
  color: "#d4a017",
  margin: "0 0 8px",
  fontSize: "28px",
  fontWeight: "900",
};

const heroText = {
  color: "#cbd5e1",
  lineHeight: "1.6",
  margin: 0,
};

const brandBox = {
  textAlign: "left",
  marginBottom: "26px",
};

const miniLabel = {
  color: "#d4a017",
  textTransform: "uppercase",
  letterSpacing: "2px",
  fontSize: "12px",
  fontWeight: "bold",
  marginBottom: "10px",
};

const brandTitle = {
  color: "#f8fafc",
  margin: 0,
  fontSize: "42px",
  lineHeight: "1.02",
  fontWeight: "900",
  letterSpacing: "-0.6px",
};

const tagline = {
  color: "#d4a017",
  fontSize: "19px",
  fontWeight: "bold",
  marginTop: "14px",
  marginBottom: "12px",
};

const scriptureStyle = {
  color: "#cbd5e1",
  fontSize: "14px",
  lineHeight: "1.7",
  fontStyle: "italic",
  borderLeft: "4px solid #d4a017",
  paddingLeft: "14px",
};

const subtitleStyle = {
  color: "#94a3b8",
  marginBottom: "28px",
  lineHeight: "1.6",
};

const inputStyle = {
  width: "100%",
  padding: "15px",
  marginBottom: "18px",
  borderRadius: "12px",
  border: "1px solid #334155",
  background: "#111827",
  color: "white",
  fontSize: "16px",
  boxSizing: "border-box",
};

const forgotWrapper = {
  textAlign: "right",
  marginTop: "-6px",
  marginBottom: "20px",
};

const forgotLinkStyle = {
  color: "#d4a017",
  textDecoration: "none",
  fontSize: "14px",
  fontWeight: "bold",
};

const buttonStyle = {
  width: "100%",
  padding: "15px",
  background: "linear-gradient(135deg, #d4a017, #fbbf24)",
  color: "#020617",
  border: "none",
  borderRadius: "12px",
  fontSize: "16px",
  fontWeight: "900",
  cursor: "pointer",
  boxShadow: "0 12px 30px rgba(212,160,23,0.25)",
};

const bottomTextStyle = {
  color: "#94a3b8",
  textAlign: "center",
  marginTop: "22px",
};

const linkStyle = {
  color: "#d4a017",
  textDecoration: "none",
  fontWeight: "bold",
};

const poweredBox = {
  marginTop: "30px",
  paddingTop: "18px",
  borderTop: "1px solid #334155",
  color: "#64748b",
  textAlign: "center",
  fontSize: "13px",
  lineHeight: "1.5",
};

export default Login;
