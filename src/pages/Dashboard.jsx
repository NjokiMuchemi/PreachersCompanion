import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  BookOpen,
  Star,
  Trash2,
  RotateCcw,
  Settings,
  LogOut,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function Dashboard() {
  const [sermons, setSermons] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    fetchSermons();
  }, []);

  async function fetchSermons() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigate("/");
      return;
    }

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

  async function logout() {
    await supabase.auth.signOut();
    navigate("/");
  }

  async function toggleFavorite(sermon) {
    const { error } = await supabase
      .from("sermons")
      .update({ is_favorite: !sermon.is_favorite })
      .eq("id", sermon.id);

    if (error) {
      alert(error.message);
      return;
    }

    fetchSermons();
  }

  async function moveToTrash(sermon) {
    const confirmTrash = window.confirm("Move this sermon to Trash?");
    if (!confirmTrash) return;

    const { error } = await supabase
      .from("sermons")
      .update({ is_deleted: true })
      .eq("id", sermon.id);

    if (error) {
      alert(error.message);
      return;
    }

    fetchSermons();
  }

  async function restoreSermon(sermon) {
    const { error } = await supabase
      .from("sermons")
      .update({ is_deleted: false })
      .eq("id", sermon.id);

    if (error) {
      alert(error.message);
      return;
    }

    fetchSermons();
  }

  let displayedSermons = sermons;

  if (activeTab === "all") {
    displayedSermons = sermons.filter((s) => !s.is_deleted);
  }

  if (activeTab === "favorites") {
    displayedSermons = sermons.filter((s) => s.is_favorite && !s.is_deleted);
  }

  if (activeTab === "trash") {
    displayedSermons = sermons.filter((s) => s.is_deleted);
  }

  if (activeTab === "categories") {
    displayedSermons = sermons.filter((s) => !s.is_deleted);
  }

  const filteredSermons = displayedSermons.filter((sermon) => {
    const search = searchTerm.toLowerCase();

    return (
      sermon.title?.toLowerCase().includes(search) ||
      sermon.category?.toLowerCase().includes(search) ||
      sermon.scripture?.toLowerCase().includes(search) ||
      sermon.content?.toLowerCase().includes(search)
    );
  });

  const groupedByCategory = filteredSermons.reduce((groups, sermon) => {
    const category = sermon.category || "Uncategorized";

    if (!groups[category]) {
      groups[category] = [];
    }

    groups[category].push(sermon);
    return groups;
  }, {});

  return (
    <div style={pageStyle}>
      <aside style={sidebarStyle}>
        <h2>Preacher&apos;s Companion</h2>
        <p style={mutedText}>Sermon Workspace</p>

        <nav style={{ marginTop: "40px" }}>
          <p
            style={getNavStyle(activeTab === "all")}
            onClick={() => setActiveTab("all")}
          >
            All Sermons
          </p>

          <p
            style={getNavStyle(activeTab === "categories")}
            onClick={() => setActiveTab("categories")}
          >
            Categories
          </p>

          <p
            style={getNavStyle(activeTab === "favorites")}
            onClick={() => setActiveTab("favorites")}
          >
            Favorites
          </p>

          <p
            style={getNavStyle(activeTab === "trash")}
            onClick={() => setActiveTab("trash")}
          >
            Trash
          </p>

          <p style={getNavStyle(false)} onClick={() => navigate("/settings")}>
            <Settings size={16} />
            Settings
          </p>

          <p style={logoutNavStyle} onClick={logout}>
            <LogOut size={16} />
            Logout
          </p>
        </nav>
      </aside>

      <main style={mainStyle}>
        <div style={topBarStyle}>
          <div>
            <h1 style={headingStyle}>
              {activeTab === "all" && "My Sermons"}
              {activeTab === "categories" && "Categories"}
              {activeTab === "favorites" && "Favorite Sermons"}
              {activeTab === "trash" && "Trash"}
            </h1>

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

        {activeTab === "categories" ? (
          Object.keys(groupedByCategory).length > 0 ? (
            Object.keys(groupedByCategory).map((category) => (
              <div key={category} style={{ marginBottom: "35px" }}>
                <h2 style={{ color: "#f59e0b" }}>{category}</h2>

                <div style={gridStyle}>
                  {groupedByCategory[category].map((sermon) => (
                    <SermonCard
                      key={sermon.id}
                      sermon={sermon}
                      activeTab={activeTab}
                      navigate={navigate}
                      toggleFavorite={toggleFavorite}
                      moveToTrash={moveToTrash}
                      restoreSermon={restoreSermon}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p style={emptyText}>No sermons found.</p>
          )
        ) : (
          <div style={gridStyle}>
            {filteredSermons.length > 0 ? (
              filteredSermons.map((sermon) => (
                <SermonCard
                  key={sermon.id}
                  sermon={sermon}
                  activeTab={activeTab}
                  navigate={navigate}
                  toggleFavorite={toggleFavorite}
                  moveToTrash={moveToTrash}
                  restoreSermon={restoreSermon}
                />
              ))
            ) : (
              <p style={emptyText}>No sermons found.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function SermonCard({
  sermon,
  activeTab,
  navigate,
  toggleFavorite,
  moveToTrash,
  restoreSermon,
}) {
  return (
    <div
      style={cardStyle}
      onClick={() => {
        if (activeTab !== "trash") {
          navigate(`/editor/${sermon.id}`);
        }
      }}
    >
      <BookOpen color="#f59e0b" size={32} />

      <h3>{sermon.title}</h3>

      <p style={mutedText}>{sermon.category}</p>

      <p style={{ color: "#cbd5e1" }}>{sermon.scripture}</p>

      {activeTab !== "trash" ? (
        <div style={buttonRow}>
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

          <button
            style={favoriteButton}
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(sermon);
            }}
          >
            <Star size={16} fill={sermon.is_favorite ? "#f59e0b" : "none"} />
          </button>

          <button
            style={trashButton}
            onClick={(e) => {
              e.stopPropagation();
              moveToTrash(sermon);
            }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ) : (
        <div style={buttonRow}>
          <button
            style={restoreButton}
            onClick={(e) => {
              e.stopPropagation();
              restoreSermon(sermon);
            }}
          >
            <RotateCcw size={16} />
            Restore
          </button>
        </div>
      )}
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

const getNavStyle = (active) => ({
  padding: "12px",
  color: active ? "#000" : "#cbd5e1",
  background: active ? "#f59e0b" : "transparent",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: active ? "bold" : "normal",
  display: "flex",
  alignItems: "center",
  gap: "8px",
});

const logoutNavStyle = {
  padding: "12px",
  color: "#fecaca",
  background: "transparent",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "bold",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  marginTop: "20px",
};

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

const buttonRow = {
  display: "flex",
  gap: "10px",
  marginTop: "15px",
  flexWrap: "wrap",
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

const favoriteButton = {
  background: "#1e293b",
  color: "#f59e0b",
  border: "1px solid #334155",
  padding: "8px 12px",
  borderRadius: "8px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
};

const trashButton = {
  background: "#dc2626",
  color: "white",
  border: "none",
  padding: "8px 12px",
  borderRadius: "8px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
};

const restoreButton = {
  background: "#16a34a",
  color: "white",
  border: "none",
  padding: "8px 12px",
  borderRadius: "8px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "6px",
};

const emptyText = {
  color: "#94a3b8",
  fontSize: "18px",
};

export default Dashboard;