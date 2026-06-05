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
  LayoutGrid,
  List,
  Edit3,
  Mail,
  Eye,
  Copy,
  X,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function Dashboard() {
  const [sermons, setSermons] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [isAdmin, setIsAdmin] = useState(false);
  const [sharedSermons, setSharedSermons] = useState([]);
  const [selectedShare, setSelectedShare] = useState(null);
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
    const { data: adminData } = await supabase
      .from("admin_users")
      .select("id")
      .eq("id", user.id)
      .single();

    setIsAdmin(!!adminData);
    const { data, error } = await supabase
      .from("sermons")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setSermons(data || []);
    await fetchSharedSermons(user.id);
  }

  async function fetchSharedSermons(userId) {
    const { data, error } = await supabase
      .from("sermon_shares")
      .select("id,status,created_at,sender_id,sermon_id,sermons(*)")
      .eq("recipient_id", userId)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error.message);
      setSharedSermons([]);
      return;
    }

    setSharedSermons(data || []);
  }

  async function saveSharedSermon(share) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigate("/");
      return;
    }

    const sharedSermon = share.sermons;

    if (!sharedSermon) {
      alert("Shared sermon could not be found.");
      return;
    }

    const { error: insertError } = await supabase.from("sermons").insert([
      {
        user_id: user.id,
        title: `${sharedSermon.title || "Shared Sermon"} (Shared Copy)`,
        category: sharedSermon.category || "Shared Sermons",
        scripture: sharedSermon.scripture || "",
        tags: Array.isArray(sharedSermon.tags) ? sharedSermon.tags : [],
        content: sharedSermon.content || "",
        is_favorite: false,
        is_deleted: false,
      },
    ]);

    if (insertError) {
      alert(insertError.message);
      return;
    }

    const { error: updateError } = await supabase
      .from("sermon_shares")
      .update({ status: "accepted" })
      .eq("id", share.id);

    if (updateError) {
      alert(updateError.message);
      return;
    }

    alert("Shared sermon saved to your sermons.");
    await fetchSermons();
  }

  async function discardSharedSermon(share) {
    const confirmDiscard = window.confirm("Discard this shared sermon?");
    if (!confirmDiscard) return;

    const { error } = await supabase
      .from("sermon_shares")
      .update({ status: "discarded" })
      .eq("id", share.id);

    if (error) {
      alert(error.message);
      return;
    }

    setSelectedShare(null);
    await fetchSermons();
  }

  function getPlainPreview(html) {
    const text = String(html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    return text || "No preview available.";
  }

  async function renameCategory(oldCategory) {
    const newCategory = prompt(
      `Rename category "${oldCategory}" to:`,
      oldCategory
    );

    if (!newCategory || !newCategory.trim()) return;

    const cleanCategory = newCategory.trim();

    if (cleanCategory === oldCategory) return;

    const confirmRename = window.confirm(
      `Rename all sermons in "${oldCategory}" to "${cleanCategory}"?`
    );

    if (!confirmRename) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from("sermons")
      .update({
        category: cleanCategory,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .eq("category", oldCategory);

    if (error) {
      alert(error.message);
      return;
    }

    setSermons((current) =>
      current.map((sermon) =>
        sermon.category === oldCategory
          ? { ...sermon, category: cleanCategory }
          : sermon
      )
    );

    await fetchSermons();

    alert(`Category renamed successfully.`);
  }

  async function logout() {
    await supabase.auth.signOut();
    navigate("/");
  }

  async function toggleFavorite(sermon) {
    await supabase
      .from("sermons")
      .update({ is_favorite: !sermon.is_favorite })
      .eq("id", sermon.id);

    fetchSermons();
  }

  async function moveToTrash(sermon) {
    const confirmTrash = window.confirm("Move this sermon to Trash?");
    if (!confirmTrash) return;

    await supabase
      .from("sermons")
      .update({ is_deleted: true })
      .eq("id", sermon.id);

    fetchSermons();
  }

  async function restoreSermon(sermon) {
    await supabase
      .from("sermons")
      .update({ is_deleted: false })
      .eq("id", sermon.id);

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
      sermon.tags?.join(" ").toLowerCase().includes(search)
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
        <div style={brandBox}>
          <h2 style={brandTitle}>PREACHER&apos;S COMPANION</h2>
          <p style={brandTagline}>From Revelation to Proclamation</p>
          <p style={brandScripture}>
            He who has my word, let him speak my word faithfully. Jer 23:28
          </p>
          <p style={brandPowered}>
            Powered by Nebkona Investors Ltd<br />
            Technologies Division @2026
          </p>
        </div>

        <nav style={{ marginTop: "40px" }}>
          <p style={getNavStyle(activeTab === "all")} onClick={() => setActiveTab("all")}>
            All Sermons
          </p>

          <p style={getNavStyle(activeTab === "categories")} onClick={() => setActiveTab("categories")}>
            Categories
          </p>

          <p style={getNavStyle(activeTab === "favorites")} onClick={() => setActiveTab("favorites")}>
            Favorites
          </p>

          <p style={getNavStyle(activeTab === "trash")} onClick={() => setActiveTab("trash")}>
            Trash
          </p>

          <p style={getNavStyle(false)} onClick={() => navigate("/settings")}>
            <Settings size={16} />
            Settings
          </p>
{isAdmin && (
  <p style={getNavStyle(false)} onClick={() => navigate("/admin")}>
    Admin
  </p>
)}
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

          <div style={topActions}>
            <div style={viewToggle}>
              <button
                style={viewMode === "grid" ? activeViewButton : viewButton}
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid size={18} />
              </button>

              <button
                style={viewMode === "list" ? activeViewButton : viewButton}
                onClick={() => setViewMode("list")}
              >
                <List size={18} />
              </button>
            </div>

            <Link to="/editor" style={newButtonStyle}>
              <Plus size={18} />
              New Sermon
            </Link>
          </div>
        </div>

        <div style={searchBoxStyle}>
          <Search size={20} />
          <input
            placeholder="Search sermons, scriptures, tags or categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={searchInputStyle}
          />
        </div>

        {sharedSermons.length > 0 && (
          <div style={sharedSection}>
            <h2 style={sharedHeading}>
              <Mail size={20} />
              Shared With Me ({sharedSermons.length})
            </h2>

            <div style={sharedList}>
              {sharedSermons.map((share) => {
                const sharedSermon = share.sermons;

                return (
                  <div key={share.id} style={sharedCard}>
                    <div style={{ flex: 1 }}>
                      <strong>
                        {sharedSermon?.title || "Untitled Shared Sermon"}
                      </strong>

                      <p style={mutedText}>
                        {sharedSermon?.scripture || "No scripture listed"}
                      </p>

                      <p style={sharedDate}>
                        Shared on{" "}
                        {share.created_at
                          ? new Date(share.created_at).toLocaleDateString()
                          : "-"}
                      </p>
                    </div>

                    <div style={sharedActions}>
                      <button
                        style={smallButton}
                        onClick={() => setSelectedShare(share)}
                      >
                        <Eye size={16} />
                        Open
                      </button>

                      <button
                        style={saveSharedButton}
                        onClick={() => saveSharedSermon(share)}
                      >
                        <Copy size={16} />
                        Save
                      </button>

                      <button
                        style={trashButton}
                        onClick={() => discardSharedSermon(share)}
                      >
                        <X size={16} />
                        Discard
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {selectedShare && (
          <div style={previewOverlay}>
            <div style={previewCard}>
              <button
                style={previewClose}
                onClick={() => setSelectedShare(null)}
              >
                <X size={18} />
              </button>

              <h2>{selectedShare.sermons?.title || "Shared Sermon"}</h2>

              <p style={mutedText}>
                {selectedShare.sermons?.scripture || "No scripture listed"}
              </p>

              <div style={previewContent}>
                {getPlainPreview(selectedShare.sermons?.content)}
              </div>

              <div style={sharedActions}>
                <button
                  style={saveSharedButton}
                  onClick={() => saveSharedSermon(selectedShare)}
                >
                  <Copy size={16} />
                  Save to My Sermons
                </button>

                <button
                  style={trashButton}
                  onClick={() => discardSharedSermon(selectedShare)}
                >
                  <X size={16} />
                  Discard
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "categories" ? (
          Object.keys(groupedByCategory).length > 0 ? (
            Object.keys(groupedByCategory).map((category) => (
              <div key={category} style={{ marginBottom: "35px" }}>
                <div style={categoryHeader}>
                  <h2 style={{ color: "#f59e0b", margin: 0 }}>{category}</h2>

                  <button
                    style={renameCategoryButton}
                    onClick={() => renameCategory(category)}
                  >
                    <Edit3 size={16} />
                    Rename Category
                  </button>
                </div>

                <div style={viewMode === "grid" ? gridStyle : listStyle}>
                  {groupedByCategory[category].map((sermon) => (
                    <SermonCard
                      key={sermon.id}
                      sermon={sermon}
                      viewMode={viewMode}
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
          <div style={viewMode === "grid" ? gridStyle : listStyle}>
            {filteredSermons.length > 0 ? (
              filteredSermons.map((sermon) => (
                <SermonCard
                  key={sermon.id}
                  sermon={sermon}
                  viewMode={viewMode}
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
  viewMode,
  activeTab,
  navigate,
  toggleFavorite,
  moveToTrash,
  restoreSermon,
}) {
  return (
    <div
      style={viewMode === "grid" ? cardStyle : listCardStyle}
      onClick={() => {
        if (activeTab !== "trash") {
          navigate(`/editor/${sermon.id}`);
        }
      }}
    >
      <div style={{ flex: 1 }}>
        <BookOpen color="#f59e0b" size={28} />
        <h3>{sermon.title}</h3>
        <p style={mutedText}>{sermon.category || "Uncategorized"}</p>
        <p style={{ color: "#cbd5e1" }}>{sermon.scripture}</p>

        {Array.isArray(sermon.tags) && sermon.tags.length > 0 && (
          <div style={tagRow}>
            {sermon.tags.slice(0, 4).map((tag) => (
              <span key={tag} style={tagPill}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

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
      )}
    </div>
  );
}


const sharedSection = {
  background: "#0f172a",
  border: "1px solid #334155",
  borderRadius: "16px",
  padding: "20px",
  marginBottom: "30px",
};

const sharedHeading = {
  color: "#f59e0b",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  marginTop: 0,
};

const sharedList = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

const sharedCard = {
  background: "#020617",
  border: "1px solid #334155",
  borderRadius: "12px",
  padding: "14px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "14px",
  flexWrap: "wrap",
};

const sharedActions = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
};

const sharedDate = {
  color: "#64748b",
  fontSize: "13px",
  margin: "6px 0 0",
};

const saveSharedButton = {
  background: "#16a34a",
  color: "white",
  border: "none",
  padding: "8px 12px",
  borderRadius: "8px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "6px",
  fontWeight: "bold",
};

const previewOverlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(2, 6, 23, 0.85)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
  padding: "20px",
};

const previewCard = {
  background: "#0f172a",
  border: "1px solid #334155",
  borderRadius: "16px",
  padding: "25px",
  maxWidth: "760px",
  width: "100%",
  maxHeight: "80vh",
  overflow: "auto",
  position: "relative",
};

const previewClose = {
  position: "absolute",
  top: "14px",
  right: "14px",
  background: "#1e293b",
  color: "white",
  border: "1px solid #334155",
  borderRadius: "8px",
  padding: "8px",
  cursor: "pointer",
};

const previewContent = {
  background: "#020617",
  border: "1px solid #334155",
  borderRadius: "12px",
  padding: "16px",
  color: "#cbd5e1",
  lineHeight: "1.7",
  margin: "18px 0",
  whiteSpace: "pre-wrap",
};

const tagRow = {
  display: "flex",
  gap: "6px",
  flexWrap: "wrap",
  marginTop: "10px",
};

const tagPill = {
  background: "#1e293b",
  color: "#f59e0b",
  border: "1px solid #334155",
  borderRadius: "999px",
  padding: "4px 8px",
  fontSize: "12px",
  fontWeight: "bold",
};

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

const brandBox = {
  background: "#020617",
  border: "1px solid #334155",
  borderRadius: "16px",
  padding: "18px",
};

const brandTitle = {
  color: "#f59e0b",
  fontSize: "22px",
  lineHeight: "1.1",
  margin: "0 0 10px",
  fontWeight: "900",
  letterSpacing: "0.5px",
};

const brandTagline = {
  color: "white",
  fontSize: "14px",
  fontWeight: "bold",
  margin: "0 0 10px",
};

const brandScripture = {
  color: "#cbd5e1",
  fontSize: "13px",
  lineHeight: "1.5",
  margin: "0 0 14px",
  fontStyle: "italic",
};

const brandPowered = {
  color: "#94a3b8",
  fontSize: "12px",
  lineHeight: "1.5",
  margin: 0,
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
  flexWrap: "wrap",
  gap: "20px",
};

const topActions = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
};

const viewToggle = { display: "flex", gap: "6px" };

const viewButton = {
  background: "#1e293b",
  border: "1px solid #334155",
  color: "white",
  padding: "10px",
  borderRadius: "8px",
  cursor: "pointer",
};

const activeViewButton = {
  ...viewButton,
  background: "#f59e0b",
  color: "#000",
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

const categoryHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  marginBottom: "15px",
  flexWrap: "wrap",
};

const renameCategoryButton = {
  background: "#1e293b",
  color: "white",
  border: "1px solid #334155",
  padding: "8px 12px",
  borderRadius: "8px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "6px",
  fontWeight: "bold",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: "20px",
};

const listStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "16px",
};

const cardStyle = {
  background: "#0f172a",
  padding: "25px",
  borderRadius: "16px",
  border: "1px solid #1e293b",
  cursor: "pointer",
};

const listCardStyle = {
  background: "#0f172a",
  padding: "20px",
  borderRadius: "16px",
  border: "1px solid #1e293b",
  cursor: "pointer",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "20px",
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
  padding: "10px 14px",
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