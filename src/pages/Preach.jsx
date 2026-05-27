import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { ArrowLeft, Maximize2, Minimize2 } from "lucide-react";

function Preach() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [sermon, setSermon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState(28);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    fetchSermon();
  }, []);

  async function fetchSermon() {
    const { data, error } = await supabase
      .from("sermons")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    setSermon(data);
    setLoading(false);
  }

  async function toggleFullscreen() {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      setFullscreen(true);
    } else {
      await document.exitFullscreen();
      setFullscreen(false);
    }
  }

  if (loading) {
    return <div style={loadingStyle}>Loading sermon...</div>;
  }

  return (
    <div style={pageStyle}>
      <div style={topBar}>
        <button style={backButton} onClick={() => navigate("/dashboard")}>
          <ArrowLeft size={18} />
          Dashboard
        </button>

        <div style={controls}>
          <button
            style={controlButton}
            onClick={() => setFontSize((prev) => Math.max(prev - 2, 18))}
          >
            A-
          </button>

          <button
            style={controlButton}
            onClick={() => setFontSize((prev) => Math.min(prev + 2, 60))}
          >
            A+
          </button>

          <button style={controlButton} onClick={toggleFullscreen}>
            {fullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </div>

      <div style={contentWrapper}>
        <h1 style={titleStyle}>{sermon.title}</h1>

        {sermon.scripture && <p style={scriptureStyle}>{sermon.scripture}</p>}

        <div
          className="preach-content"
          style={{
            ...contentStyle,
            fontSize: `clamp(20px, 4.8vw, ${fontSize}px)`,
          }}
          dangerouslySetInnerHTML={{ __html: sermon.content }}
        />
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "#020617",
  color: "white",
  padding: "clamp(12px, 3vw, 24px)",
  boxSizing: "border-box",
};

const loadingStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#020617",
  color: "white",
  fontSize: "24px",
};

const topBar = {
  position: "sticky",
  top: 0,
  zIndex: 100,
  background: "#020617",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  paddingBottom: "14px",
  borderBottom: "1px solid #1e293b",
  flexWrap: "wrap",
};

const backButton = {
  background: "#1e293b",
  color: "white",
  border: "1px solid #334155",
  padding: "10px 14px",
  borderRadius: "10px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  fontSize: "14px",
};

const controls = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
};

const controlButton = {
  background: "#f59e0b",
  color: "#000",
  border: "none",
  padding: "10px 14px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "16px",
};

const contentWrapper = {
  width: "100%",
  maxWidth: "900px",
  margin: "clamp(24px, 6vw, 48px) auto",
  boxSizing: "border-box",
};

const titleStyle = {
  fontSize: "clamp(30px, 7vw, 56px)",
  marginBottom: "18px",
  lineHeight: "1.15",
  color: "white",
};

const scriptureStyle = {
  color: "#f59e0b",
  fontSize: "clamp(18px, 4vw, 26px)",
  marginBottom: "32px",
  lineHeight: "1.5",
};

const contentStyle = {
  lineHeight: "1.85",
  color: "#f8fafc",
  overflowWrap: "break-word",
};

export default Preach;