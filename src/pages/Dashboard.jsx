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
  Share2,
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


  function openShareModal(sermon) {
    setShareModalSermon(sermon);
    setShareEmail("");
    setShareStatus("");
  }

  async function handleDashboardShare() {
    if (!shareModalSermon) return;

    if (!shareEmail.trim()) {
      setMessageModal({
        icon: "⚠️",
        title: "Recipient Email Required",
        message: "Please enter the recipient's login email.",
      });
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!user || !session) {
      setMessageModal({
        icon: "⚠️",
        title: "Login Required",
        message: "You must be logged in to share sermons.",
      });
      return;
    }

    if (shareEmail.trim().toLowerCase() === user.email?.toLowerCase()) {
      setMessageModal({
        icon: "⚠️",
        title: "Invalid Recipient",
        message: "You cannot share a sermon with yourself.",
      });
      return;
    }

    setShareStatus("Checking recipient...");

    const lookupResponse = await fetch("/api/find-user-by-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        email: shareEmail.trim(),
      }),
    });

    const lookupData = await lookupResponse.json();

    if (!lookupResponse.ok) {
      setShareStatus("");
      setMessageModal({
        icon: "⚠️",
        title: "Recipient Not Found",
        message: lookupData.error || "Recipient not found.",
      });
      return;
    }

    setShareStatus("Sharing sermon...");

    const { error } = await supabase.from("sermon_shares").insert([
      {
        sender_id: user.id,
        recipient_id: lookupData.user.id,
        sermon_id: shareModalSermon.id,
        status: "pending",
      },
    ]);

    if (error) {
      setShareStatus("");
      setMessageModal({
        icon: "⚠️",
        title: "Share Failed",
        message: error.message,
      });
      return;
    }

    setShareModalSermon(null);
    setShareEmail("");
    setShareStatus("");

    setMessageModal({
      icon: "✅",
      title: "Sermon Shared",
      message: "Sermon shared successfully.",
    });
  }

  async function renameCategory(oldCategory) {
    const newCategory = prompt(
      `Rename category "${oldCategory}" to:`,
      oldCategory
    );

    if (!newCategory || !newCategory.trim()) return;

    const cleanCategory = newCategory.trim();

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

    fetchSermons();
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

  if (activeTab === "shared") {
    displayedSermons = [];
  }

  if (activeTab === "categories") {
    displayedSermons = sermons.filter((s) => !s.is_deleted);
  }

  const filteredSermons = displayedSermons.filter((sermon) => {
    const search = searchTerm.toLowerCase();

    const totalSermonsCount = sermons.filter((s) => !s.is_deleted).length;

  const categoriesCount = new Set(
    sermons
      .filter((s) => !s.is_deleted)
      .map((s) => s.category)
      .filter(Boolean)
  ).size;

  const favoritesCount = sermons.filter(
    (s) => !s.is_deleted && (s.is_favorite || s.favorite)
  ).length;

  return (
      sermon.title?.toLowerCase().includes(search) ||
      sermon.category?.toLowerCase().includes(search) ||
      sermon.scripture?.toLowerCase().includes(search)
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
          <p style={getNavStyle(activeTab === "all")} onClick={() => setActiveTab("all")}>
            All Sermons
          </p>

          <p style={getNavStyle(activeTab === "categories")} onClick={() => setActiveTab("categories")}>
            Categories
          </p>

          <p style={getNavStyle(activeTab === "favorites")} onClick={() => setActiveTab("favorites")}>
            Favorites
          </p>

          <p style={getNavStyle(activeTab === "shared")} onClick={() => setActiveTab("shared")}>
            Shared With Me {sharedSermons.length > 0 ? `(${sharedSermons.length})` : ""}
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

              <p style={sidebarStorageTextStyle}>{storageInfo.remaining_mb} MB left</p>
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
              {activeTab === "shared" && "Shared With Me"}
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
            placeholder="Search sermons, scriptures or categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={searchInputStyle}
          />
        </div>

        {activeTab === "shared" && sharedSermons.length === 0 && (
          <p style={emptyText}>No sermons have been shared with you yet.</p>
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
                  openShareModal={openShareModal}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p style={emptyText}>No sermons found.</p>
          )
        ) : activeTab === "shared" ? null : (
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
                  openShareModal={openShareModal}
                />
              ))
            ) : (
              <p style={emptyText}>No sermons found.</p>
            )}
          </div>
        )}
      </main>

      <AppModal
        open={!!shareModalSermon}
        icon="🔗"
        title="Share Sermon"
        message={`Share "${shareModalSermon?.title || "this sermon"}" with another Preacher's Companion user.`}
        onClose={() => setShareModalSermon(null)}
      >
        <input
          type="email"
          placeholder="Recipient login email"
          value={shareEmail}
          onChange={(e) => setShareEmail(e.target.value)}
          style={modalInputStyle}
        />

        {shareStatus && <p style={modalStatusStyle}>{shareStatus}</p>}

        <button style={shareModalButtonStyle} onClick={handleDashboardShare}>
          Send Sermon
        </button>

        <button
          style={cancelModalButtonStyle}
          onClick={() => setShareModalSermon(null)}
        >
          Cancel
        </button>
      </AppModal>

      <AppModal
        open={!!messageModal}
        icon={messageModal?.icon}
        title={messageModal?.title}
        message={messageModal?.message}
        onClose={() => setMessageModal(null)}
      >
        <button style={shareModalButtonStyle} onClick={() => setMessageModal(null)}>
          OK
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
  openShareModal,
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
            style={shareSmallButton}
            onClick={(e) => {
              e.stopPropagation();
              openShareModal(sermon);
            }}
          >
            <Share2 size={16} />
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

const sidebarStorageCardStyle = {
  marginTop: "22px",
  background: "#020617",
  border: "1px solid rgba(134, 239, 172, 0.35)",
  borderRadius: "14px",
  padding: "12px",
  color: "#e5e7eb",
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

const shareSmallButton = {
  background: "#1e293b",
  color: "#86efac",
  border: "1px solid #334155",
  padding: "8px 12px",
  borderRadius: "8px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
};

const modalInputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #334155",
  background: "#1e293b",
  color: "white",
  fontSize: "15px",
};

const modalStatusStyle = {
  color: "#86efac",
  fontWeight: "bold",
  margin: "0",
};

const shareModalButtonStyle = {
  background: "#d9f99d",
  color: "#0f172a",
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


export default Dashboard;