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
import AppModal from "../components/AppModal";

function Dashboard() {
  const [sermons, setSermons] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [isAdmin, setIsAdmin] = useState(false);
  const [storageInfo, setStorageInfo] = useState(null);
  const [trashModalSermon, setTrashModalSermon] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchSermons();
  }, []);

  async function loadStorageUsage(userId) {
    try {
      const response = await fetch("/api/user-storage-usage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (response.ok) {
        setStorageInfo(data);
      }
    } catch (error) {
      console.error("Could not load storage usage", error);
    }
  }

  async function fetchSermons() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigate("/");
      return;
    }

    loadStorageUsage(user.id);

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

  function moveToTrash(sermon) {
    setTrashModalSermon(sermon);
  }

  async function confirmMoveToTrash() {
    if (!trashModalSermon) return;
    const { error } = await supabase
      .from("sermons")
      .update({ is_deleted: true })
      .eq("id", trashModalSermon.id);

    if (error) {
      alert(error.message);
      return;
    }

    await fetchSermons();
    setTrashModalSermon(null);
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
const totalSermonsCount = sermons.filter(
  (s) => !s.deleted_at
).length;

const categoriesCount = new Set(
  sermons
    .filter((s) => !s.deleted_at)
    .map((s) => s.category)
    .filter(Boolean)
).size;

const favoritesCount = sermons.filter(
  (s) => !s.deleted_at && (s.is_favorite || s.favorite)
).length;
  return (
    <div style={pageStyle}>
      <aside style={sidebarStyle}>
        <div style={brandBox}>
          <h2 style={brandTitle}>PREACHER&apos;S COMPANION</h2>
          <p style={brandScripture}>Scripture. Organize. Prepare. Preach.</p>
          <p style={poweredBy}>
            Powered by Nebkona Investors Ltd
            <br />
            Technologies Division
          </p>
        </div>

        <nav style={{ marginTop: "35px" }}>
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

          {isAdmin && (
            <p style={getNavStyle(false)} onClick={() => navigate("/admin")}>
              Admin
            </p>
          )}

          <p style={logoutNavStyle} onClick={logout}>
            <LogOut size={16} />
            Logout
          </p>

          {storageInfo && (
            <div style={sidebarStorageCardStyle}>
              <div style={sidebarStorageHeaderStyle}>
                <span>Storage</span>
                <strong>{storageInfo.used_mb} / {storageInfo.limit_mb} MB</strong>
              </div>

              <div style={sidebarStorageBarOuter}>
                <div
                  style={{
                    ...sidebarStorageBarInner,
                    width: `${Math.min(storageInfo.percent_used || 0, 100)}%`,
                    background:
                      (storageInfo.percent_used || 0) >= 90
                        ? "#ef4444"
                        : (storageInfo.percent_used || 0) >= 70
                        ? "#d4a017"
                        : "#86efac",
                  }}
                />
              </div>

              <p style={sidebarStorageTextStyle}>
                {storageInfo.remaining_mb} MB left
              </p>

              <p style={sidebarStorageTextStyle}>
                Approx. {storageInfo.approximate_sermons_remaining} sermons left
              </p>
            </div>
          )}

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
<div style={statsRowStyle}>
  <div style={statsCardStyle}>
    <div style={statsNumberStyle}>{totalSermonsCount}</div>
    <div style={statsLabelStyle}>Total Sermons</div>
  </div>

  <div style={statsCardStyle}>
    <div style={statsNumberStyle}>{categoriesCount}</div>
    <div style={statsLabelStyle}>Categories</div>
  </div>

  <div style={statsCardStyle}>
    <div style={statsNumberStyle}>{favoritesCount}</div>
    <div style={statsLabelStyle}>Favorites</div>
  </div>
</div>
        <div style={searchBoxStyle}>
          <Search size={20} />
          <input
            placeholder="Search sermons, scriptures, categories, tags or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={searchInputStyle}
          />
        </div>

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

      <AppModal
        open={!!trashModalSermon}
        icon="🗑️"
        title="Move Sermon to Trash?"
        message={`Move "${trashModalSermon?.title || "this sermon"}" to Trash? You can restore it later from the Trash section.`}
        onClose={() => setTrashModalSermon(null)}
      >
        <button style={deleteConfirmButtonStyle} onClick={confirmMoveToTrash}>
          Move to Trash
        </button>

        <button
          style={cancelModalButtonStyle}
          onClick={() => setTrashModalSermon(null)}
        >
          Cancel
        </button>
      </AppModal>
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
  const tags = Array.isArray(sermon.tags) ? sermon.tags : [];

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

        {tags.length > 0 && (
          <div style={tagRow}>
            {tags.map((tag) => (
              <span key={tag} style={tagChip}>
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
  borderBottom: "1px solid #1e293b",
  paddingBottom: "22px",
};

const brandTitle = {
  margin: 0,
  color: "white",
  fontSize: "22px",
  lineHeight: "1.1",
  letterSpacing: "0.5px",
};

const brandScripture = {
  color: "#f59e0b",
  fontWeight: "bold",
  margin: "10px 0 8px",
  lineHeight: "1.4",
};

const poweredBy = {
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

const tagRow = {
  display: "flex",
  gap: "6px",
  flexWrap: "wrap",
  marginTop: "10px",
};

const tagChip = {
  background: "#1e293b",
  color: "#f59e0b",
  border: "1px solid #334155",
  borderRadius: "999px",
  padding: "4px 8px",
  fontSize: "12px",
  fontWeight: "bold",
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


const sidebarStorageCardStyle = {
  marginTop: "22px",
  background: "#020617",
  border: "1px solid rgba(134, 239, 172, 0.35)",
  borderRadius: "14px",
  padding: "12px",
  color: "#e5e7eb",
  boxShadow: "0 12px 35px rgba(0,0,0,0.25)",
};

const sidebarStorageHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "8px",
  fontSize: "13px",
  marginBottom: "10px",
  color: "#d9f99d",
};

const sidebarStorageBarOuter = {
  height: "8px",
  background: "#0f172a",
  borderRadius: "999px",
  overflow: "hidden",
  border: "1px solid #1e293b",
  marginBottom: "8px",
};

const sidebarStorageBarInner = {
  height: "100%",
  borderRadius: "999px",
  transition: "width 0.3s ease",
};

const sidebarStorageTextStyle = {
  margin: "4px 0 0",
  color: "#94a3b8",
  fontSize: "12px",
  lineHeight: "1.35",
};



const deleteConfirmButtonStyle = {
  background: "#dc2626",
  color: "white",
  border: "none",
  padding: "12px 18px",
  borderRadius: "10px",
  fontWeight: "bold",
  cursor: "pointer",
};

const cancelModalButtonStyle = {
  background: "#1e293b",
  color: "white",
  border: "1px solid #334155",
  padding: "12px 18px",
  borderRadius: "10px",
  fontWeight: "bold",
  cursor: "pointer",
};

const statsRowStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "16px",
  marginBottom: "20px",
};

const statsCardStyle = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: "14px",
  padding: "18px",
  textAlign: "center",
};

const statsNumberStyle = {
  color: "#f59e0b",
  fontSize: "32px",
  fontWeight: "bold",
};

const statsLabelStyle = {
  color: "#94a3b8",
  fontSize: "14px",
  marginTop: "6px",
};

export default Dashboard;
