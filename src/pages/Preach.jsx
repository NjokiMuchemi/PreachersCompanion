import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { ArrowLeft, Maximize2, Minimize2 } from "lucide-react";

function Preach() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [sermon, setSermon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState(24);
  const [fullscreen, setFullscreen] = useState(false);
  const [readingWidth, setReadingWidth] = useState("85%");

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
      setLoading(false);
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

  if (!sermon) {
    return <div style={loadingStyle}>Sermon not found.</div>;
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
            onClick={() => setFontSize((prev) => Math.min(prev + 2, 42))}
          >
            A+
          </button>

          <button style={secondaryControlButton} onClick={() => setReadingWidth("70%")}>
            Narrow
          </button>

          <button style={secondaryControlButton} onClick={() => setReadingWidth("85%")}>
            Medium
          </button>

          <button style={secondaryControlButton} onClick={() => setReadingWidth("95%")}>
            Wide
          </button>

          <button style={controlButton} onClick={toggleFullscreen}>
            {fullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </div>

      <main
        style={{
          ...contentWrapper,
          maxWidth: readingWidth,
        }}
      >
        <section style={sermonPaper}>
          <header style={sermonHeader}>
            <h1 style={titleStyle}>{sermon.title}</h1>

            {sermon.scripture && (
              <p style={scriptureStyle}>{sermon.scripture}</p>
            )}
          </header>

          <div
            className="preach-content preach-reading"
            style={{
              ...contentStyle,
              fontSize: `${fontSize}px`,
            }}
            dangerouslySetInnerHTML={{
              __html: sermon.content || "<p>No sermon content available.</p>",
            }}
          />
        </section>
      </main>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "#020617",
  color: "white",
  padding: "0",
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
  background: "rgba(2, 6, 23, 0.96)",
  backdropFilter: "blur(10px)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  padding: "14px 24px",
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
  fontWeight: "bold",
};

const controls = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
};

const controlButton = {
  background: "#d4a017",
  color: "#000",
  border: "none",
  padding: "10px 14px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "16px",
};

const secondaryControlButton = {
  background: "#1e293b",
  color: "white",
  border: "1px solid #334155",
  padding: "10px 14px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "14px",
};

const contentWrapper = {
  width: "100%",
  margin: "0 auto",
  padding: "28px 20px 60px",
  boxSizing: "border-box",
};

const sermonPaper = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: "22px",
  padding: "clamp(28px, 5vw, 56px)",
  boxShadow: "0 20px 80px rgba(0,0,0,0.35)",
};

const sermonHeader = {
  textAlign: "center",
  borderBottom: "1px solid #334155",
  paddingBottom: "24px",
  marginBottom: "34px",
};

const titleStyle = {
  fontSize: "clamp(30px, 5vw, 54px)",
  margin: "0 0 14px",
  lineHeight: "1.12",
  color: "white",
  fontWeight: "900",
  letterSpacing: "-0.03em",
};

const scriptureStyle = {
  color: "#d4a017",
  fontSize: "clamp(18px, 2.4vw, 26px)",
  margin: 0,
  lineHeight: "1.4",
  fontWeight: "bold",
};

const contentStyle = {
  lineHeight: "1.65",
  color: "#f8fafc",
  overflowWrap: "break-word",
  maxWidth: "100%",
};

export default Preach;
