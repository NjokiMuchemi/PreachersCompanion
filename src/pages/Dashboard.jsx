import { useEffect, useState } from "react";
import { Plus, Search, BookOpen } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function Dashboard() {
  const [sermons, setSermons] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchSermons();
  }, []);

  async function fetchSermons() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("sermons")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setSermons(data || []);
  }

  const filteredSermons = sermons.filter((sermon) => {
    const search = searchTerm.toLowerCase();

    return (
      sermon.title?.toLowerCase().includes(search) ||
      sermon.category?.toLowerCase().includes(search) ||
      sermon.scripture?.toLowerCase().includes(search) ||
      sermon.content?.toLowerCase().includes(search)
    );
  });

  return (
    <div style={pageStyle}>
      <aside style={sidebarStyle}>
        <h2>Preacher&apos;s Companion</h2>
        <p style={mutedText}>Sermon Workspace</p>

        <nav style={{ marginTop: "40px" }}>
          <p style={navItem}>All Sermons</p>
          <p style={navItem}>Categories</p>
          <p style={navItem}>Favorites</p>
          <p style={navItem}>Trash</p>
        </nav>
      </aside>

      <main style={mainStyle}>
        <div style={topBarStyle}>
          <div>
            <h1 style={headingStyle}>My Sermons</h1>
            <p style={subtitleStyle}>Organize and access your ministry notes.</p>
          </div>

          <Link to="/editor" style={newButtonStyle}>
            <Plus size={18} />
            New Sermon
          </Link>
        </div>

        <div style={searchBoxStyle}>
          <Search size={20} />
          <input
            placeholder="Search sermons, scriptures, categories or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={searchInputStyle}
          />
        </div>

        <div style={gridStyle}>
          {filteredSermons.map((sermon) => (
            <div
              key={sermon.id}
              style={cardStyle}
              onClick={() => navigate(`/editor/${sermon.id}`)}
            >
              <BookOpen color="#f59e0b" size={32} />
              <h3>{sermon.title}</h3>
              <p style={mutedText}>{sermon.category}</p>
              <p style={{ color: "#cbd5e1" }}>{sermon.scripture}</p>
              <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
  <button
    style={smallButton}
    onClick={(e) => {
      e.stopPropagation();
      navigate(`/editor/${sermon.id}`);
    }}
  >
    Edit
  </button>

  <button
    style={preachButton}
    onClick={(e) => {
      e.stopPropagation();
      navigate(`/preach/${sermon.id}`);
    }}
  >
    Preach
  </button>
</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  display: "flex",
  background: "#020617",
  color: "white",
  fontFamily: "Arial, sans-serif",
};

const sidebarStyle = {
  width: "260px",
  background: "#0f172a",
  padding: "30px",
  borderRight: "1px solid #1e293b",
};

const mainStyle = { flex: 1, padding: "40px" };
const mutedText = { color: "#94a3b8" };
const navItem = { padding: "12px 0", color: "#cbd5e1", cursor: "pointer" };
const headingStyle = { margin: 0, fontSize: "48px", lineHeight: "1.1" };
const subtitleStyle = { color: "#94a3b8", marginTop: "10px" };

const topBarStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "30px",
};

const newButtonStyle = {
  background: "#f59e0b",
  color: "#000",
  padding: "12px 18px",
  borderRadius: "10px",
  textDecoration: "none",
  fontWeight: "bold",
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const searchBoxStyle = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  padding: "14px",
  borderRadius: "12px",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginBottom: "30px",
};

const searchInputStyle = {
  flex: 1,
  background: "transparent",
  border: "none",
  outline: "none",
  color: "white",
  fontSize: "16px",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "20px",
};

const cardStyle = {
  background: "#0f172a",
  padding: "25px",
  borderRadius: "16px",
  border: "1px solid #1e293b",
  cursor: "pointer",
};
const smallButton = {
  background: "#1e293b",
  color: "white",
  border: "1px solid #334155",
  padding: "8px 12px",
  borderRadius: "8px",
  cursor: "pointer",
};

const preachButton = {
  background: "#f59e0b",
  color: "#000",
  border: "none",
  padding: "8px 12px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
};
export default Dashboard;