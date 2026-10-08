import { useEffect, useState } from "react";
import "../styles/appPolish.css";
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
import {
  pageStyle,
  sidebarStyle,
  mainStyle,
  brandBox,
 brandTitle,
 brandScripture,
 poweredBy,
 getNavStyle,
 logoutNavStyle,
 topBarStyle,
headingStyle,
subtitleStyle,
topActions,
viewToggle,
viewButton,
activeViewButton,
newButtonStyle,
searchBoxStyle,
searchInputStyle,
gridStyle,
listStyle,
cardStyle,
listCardStyle,
categoryHeader,
renameCategoryButton,
tagRow,
tagChip,
mutedText,
buttonRow,
smallButton,
preachButton,
favoriteButton,
trashButton,
restoreButton,
emptyText,
sidebarStorageCardStyle,
sidebarStorageHeaderStyle,
sidebarStorageBarOuter,
sidebarStorageBarInner,
sidebarStorageTextStyle,
statsRowStyle,
statsCardStyle,
statsNumberStyle,
statsLabelStyle,
} from "../styles/dashboardStyles";
function Dashboard() {
  const [sermons, setSermons] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [isAdmin, setIsAdmin] = useState(false);
  const [storageInfo, setStorageInfo] = useState(null);
  const [trashModalSermon, setTrashModalSermon] = useState(null);
  const [sharedSermons, setSharedSermons] = useState([]);
  const [shareModalSermon, setShareModalSermon] = useState(null);
  const [shareEmail, setShareEmail] = useState("");
  const [shareStatus, setShareStatus] = useState("");
  const [messageModal, setMessageModal] = useState(null);

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


  async function loadSharedSermons(userId) {
    const { data, error } = await supabase
      .from("sermon_shares")
      .select(`
  id,
  created_at,
  status,
  sermon_id,
  sender_id,
  sermon_title,
  sermon_category,
  sermon_scripture,
  sermon_tags,
  sermon_content,
  sender_email
`)
      .eq("recipient_id", userId)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Could not load shared sermons", error.message);
      setSharedSermons([]);
      return;
    }

    if (!data || data.length === 0) {
  setSharedSermons([]);
  return;
}

const sermonIds = data.map((share) => share.sermon_id).filter(Boolean);

const { data: sharedSermonData, error: sermonError } = await supabase
  .from("sermons")
  .select("*")
  .in("id", sermonIds);

if (sermonError) {
  console.error("Could not load shared sermon details", sermonError.message);
  setSharedSermons(data || []);
  return;
}

const mergedShares = data.map((share) => ({
  ...share,
  sermons: sharedSermonData?.find(
    (sermon) => sermon.id === share.sermon_id
  ),
}));

setSharedSermons(mergedShares);
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
    loadSharedSermons(user.id);

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


  function openShareModal(sermon) {
    setShareModalSermon(sermon);
    setShareEmail("");
    setShareStatus("");
  }

async function handleDashboardShare() {
  if (!shareModalSermon) return;

  const recipientEmail = shareEmail.trim();

  if (!recipientEmail) {
    setMessageModal({
      icon: "⚠️",
      title: "Recipient Email Required",
      message: "Please enter the recipient's login email.",
    });
    return;
  }

  try {
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

    if (recipientEmail.toLowerCase() === user.email?.toLowerCase()) {
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
        email: recipientEmail,
        recipientEmail,
        recipient_email: recipientEmail,
      }),
    });

    const lookupText = await lookupResponse.text();
    let lookupData = {};

    try {
      lookupData = lookupText ? JSON.parse(lookupText) : {};
    } catch {
      throw new Error(lookupText || "Invalid server response.");
    }

    if (!lookupResponse.ok) {
      throw new Error(lookupData.error || "Recipient not found.");
    }

    setShareStatus("Sharing sermon...");

    const recipientId =
      lookupData.user?.id || lookupData.id || lookupData.user_id;

    if (!recipientId) {
      throw new Error("Recipient user ID was not returned by the server.");
    }

    const { error } = await supabase.from("sermon_shares").insert([
  {
    sender_id: user.id,
    recipient_id: recipientId,
    sermon_id: shareModalSermon.id,
    status: "pending",
    sermon_title: shareModalSermon.title,
    sermon_category: shareModalSermon.category,
    sermon_scripture: shareModalSermon.scripture,
    sermon_tags: shareModalSermon.tags || [],
    sermon_content: shareModalSermon.content || "",
    sender_email: user.email,
  },
]);

    if (error) {
      throw new Error(error.message);
    }

    setShareModalSermon(null);
    setShareEmail("");
    setShareStatus("");

    setMessageModal({
      icon: "✅",
      title: "Sermon Shared",
      message: "Sermon shared successfully.",
    });
  } catch (error) {
    setShareStatus("");
    setMessageModal({
      icon: "⚠️",
      title: "Share Failed",
      message: error.message || "The sermon could not be shared.",
    });
  }
}
  async function dismissSharedSermon(shareId) {
    const { error } = await supabase
      .from("sermon_shares")
      .update({ status: "dismissed" })
      .eq("id", shareId);

    if (error) {
      setMessageModal({
        icon: "⚠️",
        title: "Could Not Dismiss",
        message: error.message,
      });
      return;
    }

    setSharedSermons((current) => current.filter((share) => share.id !== shareId));
  }

 async function saveSharedSermon(share) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    navigate("/");
    return;
  }

  const { error } = await supabase.from("sermons").insert([
    {
      user_id: user.id,
      title: share.sermon_title || "Shared Sermon",
      category: share.sermon_category || "Shared Sermons",
      scripture: share.sermon_scripture || "",
      tags: Array.isArray(share.sermon_tags) ? share.sermon_tags : [],
      content: share.sermon_content || "",
      is_favorite: false,
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]);

  if (error) {
    setMessageModal({
      icon: "⚠️",
      title: "Could Not Save",
      message: error.message,
    });
    return;
  }

  await dismissSharedSermon(share.id);
  await fetchSermons();

  setMessageModal({
    icon: "✅",
    title: "Saved To My Sermons",
    message: "The shared sermon has been copied into your sermons.",
  });
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

  if (activeTab === "tags") {
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

  const groupedByTag = filteredSermons.reduce((groups, sermon) => {
    const tags =
      Array.isArray(sermon.tags) && sermon.tags.length > 0
        ? sermon.tags
        : ["Untagged"];

    tags.forEach((tag) => {
      const cleanTag = String(tag || "Untagged").trim() || "Untagged";

      if (!groups[cleanTag]) {
        groups[cleanTag] = [];
      }

      groups[cleanTag].push(sermon);
    });

    return groups;
  }, {});

const totalSermonsCount = sermons.filter(
  (s) => !s.is_deleted
).length;

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
    <div style={pageStyle} className="pc-dashboard">
      <aside style={sidebarStyle} className="pc-dashboard-sidebar">
        <div style={brandBox}>
          <h2 style={brandTitle}>PREACHER&apos;S COMPANION</h2>
          <p style={brandScripture}>Plan. Preserve. Present. Proclaim.</p>
          <p style={poweredBy}>
            A SHE Ministers Forum Initiative
            <br />
            Powered by Nebkona Investors Ltd - Technologies Division
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
            style={getNavStyle(activeTab === "tags")}
            onClick={() => setActiveTab("tags")}
          >
            Tags
          </p>

          <p
            style={getNavStyle(activeTab === "favorites")}
            onClick={() => setActiveTab("favorites")}
          >
            Favorites
          </p>

          <p
            style={getNavStyle(activeTab === "shared")}
            onClick={() => setActiveTab("shared")}
          >
            Shared With Me {sharedSermons.length > 0 ? `(${sharedSermons.length})` : ""}
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

      <main style={mainStyle} className="pc-dashboard-main">
        <div style={topBarStyle} className="pc-dashboard-topbar">
          <div>
            <h1 style={headingStyle}>
              {activeTab === "all" && "My Sermons"}
              {activeTab === "categories" && "Categories"}
              {activeTab === "tags" && "Tags"}
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
<div style={statsRowStyle} className="pc-dashboard-stats">
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
        <div style={searchBoxStyle} className="pc-dashboard-search">
          <Search size={20} />
          <input
            placeholder="Search sermons, scriptures, categories, tags or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={searchInputStyle}
          />
        </div>


        {activeTab === "shared" ? (
          sharedSermons.length > 0 ? (
            <div style={viewMode === "grid" ? gridStyle : listStyle} className={viewMode === "grid" ? "pc-sermon-grid" : "pc-sermon-list"}>
              {sharedSermons.map((share) => (
                <div key={share.id} style={viewMode === "grid" ? cardStyle : listCardStyle} className="pc-sermon-card">
                  <div style={{ flex: 1 }}>
                    <BookOpen color="#f59e0b" size={28} />
                    <h3>{share.sermon_title || "Untitled Sermon"}</h3>
                    <p style={mutedText}>{share.sermon_category || "Shared Sermon"}</p>
                    <p style={{ color: "#cbd5e1" }}>{share.sermon_scripture || ""}</p>
                    <p style={mutedText}>Shared by: {share.sender_email || "Unknown sender"}</p>
                    <p style={sharedDateStyle}>
                      Shared on {new Date(share.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div style={buttonRow}>
                    <button style={preachButton} onClick={() => saveSharedSermon(share)}>
                      Save To My Library
                    </button>

                    <button style={smallButton} onClick={() => dismissSharedSermon(share.id)}>
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={emptyText}>No sermons have been shared with you yet.</p>
          )
        ) : activeTab === "categories" ? (

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

                <div style={viewMode === "grid" ? gridStyle : listStyle} className={viewMode === "grid" ? "pc-sermon-grid" : "pc-sermon-list"}>
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
        ) : activeTab === "tags" ? (
          Object.keys(groupedByTag).length > 0 ? (
            Object.keys(groupedByTag).map((tag) => (
              <div key={tag} style={{ marginBottom: "35px" }}>
                <div style={categoryHeader}>
                  <h2 style={{ color: "#f59e0b", margin: 0 }}>#{tag}</h2>
                </div>

                <div style={viewMode === "grid" ? gridStyle : listStyle} className={viewMode === "grid" ? "pc-sermon-grid" : "pc-sermon-list"}>
                  {groupedByTag[tag].map((sermon) => (
                    <SermonCard
                      key={`${tag}-${sermon.id}`}
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
            <p style={emptyText}>No tagged sermons found.</p>
          )
        ) : (
          <div style={viewMode === "grid" ? gridStyle : listStyle} className={viewMode === "grid" ? "pc-sermon-grid" : "pc-sermon-list"}>
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
  openShareModal,
}) {
  const tags = Array.isArray(sermon.tags) ? sermon.tags : [];

  return (
    <div
      style={viewMode === "grid" ? cardStyle : listCardStyle} className="pc-sermon-card"
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

const sharedDateStyle = {
  color: "#94a3b8",
  fontSize: "13px",
  marginTop: "10px",
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

export default Dashboard;
