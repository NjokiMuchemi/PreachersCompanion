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
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import brandLogo from "../assets/brand-logo.png";

function Dashboard() {
  const [sermons, setSermons] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedSermonId, setSelectedSermonId] = useState(null);
  const [previewWidth, setPreviewWidth] = useState("320px");

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

    const affectedSermons = sermons.filter(
      (sermon) => (sermon.category || "Uncategorized") === oldCategory
    );

    const affectedIds = affectedSermons.map((sermon) => sermon.id);

    if (affectedIds.length === 0) {
      alert("No sermons found in this category.");
      return;
    }

    const { error } = await supabase
      .from("sermons")
      .update({
        category: cleanCategory,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .in("id", affectedIds);

    if (error) {
      alert(error.message);
      return;
    }

    setSermons((current) =>
      current.map((sermon) =>
        affectedIds.includes(sermon.id)
          ? { ...sermon, category: cleanCategory }
          : sermon
      )
    );

    await fetchSermons();

    alert(`Category renamed to "${cleanCategory}" successfully.`);
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

    await fetchSermons();
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

    await fetchSermons();
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

    await fetchSermons();
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
    const tagsText = Array.isArray(sermon.tags) ? sermon.tags.join(" ") : "";

    return (
      sermon.title?.toLowerCase().includes(search) ||
      sermon.category?.toLowerCase().includes(search) ||
      sermon.scripture?.toLowerCase().includes(search) ||
      sermon.content?.toLowerCase().includes(search) ||
      tagsText.toLowerCase().includes(search)
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

  const selectedSermon =
    filteredSermons.find((sermon) => sermon.id === selectedSermonId) ||
    filteredSermons[0];

  return (
    <div style={pageStyle}>
      <aside style={sidebarStyle}>
        <div style={brandBox}>
          <img
            src={brandLogo}
            alt="Preacher's Companion logo"
            style={brandLogoStyle}
          />

          <h2 style={brandTitle}>PREACHER&apos;S COMPANION</h2>
          <p style={brandTagline}>From Revelation to Proclamation</p>
          <p style={brandVerse}>
            “He who has my word, let him speak my word faithfully.”
            <br />
            Jer. 23:28
          </p>
          <p style={poweredBy}>
            Powered by Nebkona Investors Ltd
            <br />
            Technologies Division @2026
          </p>
        </div>

        <nav style={{ marginTop: "35px" }}>
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
                title="Grid view"
                style={viewMode === "grid" ? activeViewButton : viewButton}
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid size={18} />
              </button>

              <button
                title="List view"
                style={viewMode === "list" ? activeViewButton : viewButton}
                onClick={() => setViewMode("list")}
              >
                <List size={18} />
              </button>

              <button
                title="Preview view"
                style={viewMode === "preview" ? activeViewButton : viewButton}
                onClick={() => setViewMode("preview")}
              >
                Preview
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
            placeholder="Search sermons, scriptures, categories or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={searchInputStyle}
          />
        </div>

        {viewMode === "preview" ? (
          <PreviewLayout
            sermons={filteredSermons}
            previewWidth={previewWidth}
            setPreviewWidth={setPreviewWidth}
            selectedSermon={selectedSermon}
            selectedSermonId={selectedSermon?.id}
            setSelectedSermonId={setSelectedSermonId}
            activeTab={activeTab}
            navigate={navigate}
            toggleFavorite={toggleFavorite}
            moveToTrash={moveToTrash}
            restoreSermon={restoreSermon}
          />
        ) : activeTab === "categories" ? (
          Object.keys(groupedByCategory).length > 0 ? (
            Object.keys(groupedByCategory).map((category) => (
              <div key={category} style={{ marginBottom: "35px" }}>
                <div style={categoryHeader}>
                  <h2 style={{ color: "#d4a017", margin: 0 }}>{category}</h2>

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

function PreviewLayout({
  sermons,
  previewWidth,
  setPreviewWidth,
  selectedSermon,
  selectedSermonId,
  setSelectedSermonId,
  activeTab,
  navigate,
  toggleFavorite,
  moveToTrash,
  restoreSermon,
}) {
  if (!sermons.length) {
    return <p style={emptyText}>No sermons found.</p>;
  }

  return (
    <>
      <div style={previewResizeControls}>
        <button style={smallButton} onClick={() => setPreviewWidth("250px")}>
          Narrow
        </button>

        <button style={smallButton} onClick={() => setPreviewWidth("320px")}>
          Normal
        </button>

        <button style={smallButton} onClick={() => setPreviewWidth("450px")}>
          Wide
        </button>
      </div>

      <div
        style={{
          ...previewLayoutStyle,
          gridTemplateColumns: `${previewWidth} 1fr`,
        }}
      >
      <div style={previewListStyle}>
        <h3 style={previewListHeading}>Sermon List</h3>

        {sermons.map((sermon) => (
          <div
            key={sermon.id}
            style={
              sermon.id === selectedSermonId
                ? activePreviewItemStyle
                : previewItemStyle
            }
            onClick={() => setSelectedSermonId(sermon.id)}
          >
            <strong>{sermon.title || "Untitled Sermon"}</strong>
            <p style={previewItemMeta}>{sermon.category || "Uncategorized"}</p>
            <p style={previewItemMeta}>{sermon.scripture || "-"}</p>
          </div>
        ))}
      </div>

      <div style={previewDetailStyle}>
        {selectedSermon ? (
          <>
            <BookOpen color="#d4a017" size={34} />

            <h2 style={previewTitleStyle}>
              {selectedSermon.title || "Untitled Sermon"}
            </h2>

            <div style={metadataRowStyle}>
              <span style={metadataBadge}>Category: {selectedSermon.category || "Uncategorized"}</span>
              <span style={metadataBadge}>Scripture: {selectedSermon.scripture || "-"}</span>
            </div>

            {Array.isArray(selectedSermon.tags) && selectedSermon.tags.length > 0 && (
              <div style={tagRowStyle}>
                {selectedSermon.tags.map((tag) => (
                  <span key={tag} style={tagBadgeStyle}>
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div style={buttonRow}>
              {activeTab !== "trash" ? (
                <>
                  <button
                    style={smallButton}
                    onClick={() => navigate(`/editor/${selectedSermon.id}`)}
                  >
                    Edit
                  </button>

                  <button
                    style={preachButton}
                    onClick={() => navigate(`/preach/${selectedSermon.id}`)}
                  >
                    Preach
                  </button>

                  <button
                    style={favoriteButton}
                    onClick={() => toggleFavorite(selectedSermon)}
                  >
                    <Star
                      size={16}
                      fill={selectedSermon.is_favorite ? "#d4a017" : "none"}
                    />
                  </button>

                  <button
                    style={trashButton}
                    onClick={() => moveToTrash(selectedSermon)}
                  >
                    <Trash2 size={16} />
                  </button>
                </>
              ) : (
                <button
                  style={restoreButton}
                  onClick={() => restoreSermon(selectedSermon)}
                >
                  <RotateCcw size={16} />
                  Restore
                </button>
              )}
            </div>

            <div
              style={sermonPreviewContentStyle}
              dangerouslySetInnerHTML={{
                __html:
                  selectedSermon.content ||
                  "<p>No sermon content available.</p>",
              }}
            />
          </>
        ) : (
          <p style={emptyText}>Select a sermon to view details.</p>
        )}
      </div>
    </div>
    </>
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
        <BookOpen color="#d4a017" size={28} />
        <h3>{sermon.title}</h3>
        <p style={mutedText}>{sermon.category || "Uncategorized"}</p>
        <p style={{ color: "#cbd5e1" }}>{sermon.scripture}</p>

        {Array.isArray(sermon.tags) && sermon.tags.length > 0 && (
          <div style={tagRowStyle}>
            {sermon.tags.map((tag) => (
              <span key={tag} style={tagBadgeStyle}>
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
            <Star size={16} fill={sermon.is_favorite ? "#d4a017" : "none"} />
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

const pageStyle = {
  minHeight: "100vh",
  display: "flex",
  background: "#020617",
  color: "white",
  fontFamily: "Arial, sans-serif",
};

const sidebarStyle = {
  width: "280px",
  background: "#0f172a",
  padding: "30px",
  borderRight: "1px solid #1e293b",
};

const brandBox = {
  background:
    "linear-gradient(180deg, rgba(17,24,39,0.98), rgba(2,6,23,0.98))",
  border: "1px solid rgba(212,160,23,0.35)",
  borderRadius: "18px",
  padding: "18px",
  textAlign: "center",
  boxShadow: "0 16px 35px rgba(0,0,0,0.25)",
};

const brandLogoStyle = {
  width: "92px",
  height: "70px",
  objectFit: "contain",
  display: "block",
  margin: "0 auto 10px",
  borderRadius: "14px",
};

const brandTitle = {
  color: "#d4a017",
  margin: 0,
  fontSize: "20px",
  lineHeight: "1.1",
  fontWeight: "900",
};

const brandTagline = {
  color: "white",
  fontSize: "13px",
  fontWeight: "bold",
  marginTop: "10px",
};

const brandVerse = {
  color: "#cbd5e1",
  fontSize: "12px",
  lineHeight: "1.5",
  fontStyle: "italic",
};

const poweredBy = {
  color: "#64748b",
  fontSize: "11px",
  lineHeight: "1.5",
  marginTop: "12px",
};

const mainStyle = { flex: 1, padding: "40px", overflow: "hidden" };
const mutedText = { color: "#94a3b8" };

const getNavStyle = (active) => ({
  padding: "12px",
  color: active ? "#000" : "#cbd5e1",
  background: active ? "#d4a017" : "transparent",
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
  background: "#d4a017",
  color: "#000",
  fontWeight: "bold",
};

const newButtonStyle = {
  background: "#d4a017",
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
  background: "#d4a017",
  color: "#000",
  border: "none",
  padding: "8px 12px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
};

const favoriteButton = {
  background: "#1e293b",
  color: "#d4a017",
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

const tagRowStyle = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
  marginTop: "10px",
};

const tagBadgeStyle = {
  background: "#1e293b",
  border: "1px solid #334155",
  color: "#d4a017",
  padding: "6px 10px",
  borderRadius: "999px",
  fontWeight: "bold",
  fontSize: "12px",
};

const previewLayoutStyle = {
  display: "grid",
  gridTemplateColumns: "320px 1fr",
  gap: "20px",
  minHeight: "620px",
};

const previewResizeControls = {
  display: "flex",
  gap: "10px",
  marginBottom: "15px",
  flexWrap: "wrap",
};

const previewListStyle = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: "16px",
  padding: "15px",
  maxHeight: "720px",
  overflowY: "auto",
};

const previewListHeading = {
  color: "#d4a017",
  marginTop: 0,
};

const previewItemStyle = {
  padding: "14px",
  borderRadius: "12px",
  border: "1px solid #1e293b",
  marginBottom: "10px",
  cursor: "pointer",
  background: "#020617",
};

const activePreviewItemStyle = {
  ...previewItemStyle,
  background: "#1e293b",
  border: "1px solid #d4a017",
};

const previewItemMeta = {
  color: "#94a3b8",
  margin: "6px 0 0",
  fontSize: "13px",
};

const previewDetailStyle = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: "16px",
  padding: "25px",
  maxHeight: "720px",
  overflowY: "auto",
};

const previewTitleStyle = {
  fontSize: "34px",
  lineHeight: "1.15",
  marginBottom: "15px",
};

const metadataRowStyle = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  marginBottom: "10px",
};

const metadataBadge = {
  background: "#020617",
  border: "1px solid #334155",
  color: "#cbd5e1",
  padding: "8px 10px",
  borderRadius: "8px",
  fontSize: "14px",
};

const sermonPreviewContentStyle = {
  background: "#020617",
  border: "1px solid #334155",
  borderRadius: "12px",
  padding: "20px",
  marginTop: "20px",
  color: "#e5e7eb",
  lineHeight: "1.8",
  fontSize: "16px",
};

const emptyText = {
  color: "#94a3b8",
  fontSize: "18px",
};

export default Dashboard;
