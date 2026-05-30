import { useEffect, useState } from "react";
import {
  ArrowLeft,
  UserPlus,
  Ban,
  CheckCircle,
  Download,
  Upload,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function Admin() {
  const navigate = useNavigate();

  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [status, setStatus] = useState("");

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
const [backupFile, setBackupFile] = useState(null);
  useEffect(() => {
    checkAdminAccess();
  }, []);

  async function checkAdminAccess() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigate("/");
      return;
    }

    setAdminEmail(user.email || "");

    const { data, error } = await supabase
      .from("admin_users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error || !data) {
      setIsAdmin(false);
      setCheckingAdmin(false);
      return;
    }

    setIsAdmin(true);
    setCheckingAdmin(false);

    await loadUsers(user.email);
  }

  async function createUser() {
    if (!email.trim() || !temporaryPassword.trim()) {
      alert("Please enter user email and temporary password.");
      return;
    }

    setStatus("Creating user...");

    const response = await fetch("/api/create-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        adminEmail,
        email,
        password: temporaryPassword,
        fullName,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setStatus("");
      alert(data.error || "Could not create user.");
      return;
    }

    setStatus("User created successfully.");

    setFullName("");
    setEmail("");
    setTemporaryPassword("");

    await loadUsers(adminEmail);
  }

  async function loadUsers(currentAdminEmail) {
    setLoadingUsers(true);

    try {
      const response = await fetch("/api/list-users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adminEmail: currentAdminEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Could not load users.");
        setLoadingUsers(false);
        return;
      }

      setUsers(data.users || []);
    } catch (error) {
      alert(error.message);
    }

    setLoadingUsers(false);
  }

  async function updateUserStatus(user, action) {
    const actionText = action === "suspend" ? "suspend" : "reactivate";

    const confirmAction = window.confirm(
      `Are you sure you want to ${actionText} ${user.email}?`
    );

    if (!confirmAction) return;

    setStatus(`${actionText === "suspend" ? "Suspending" : "Reactivating"} user...`);

    const response = await fetch("/api/update-user-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        adminEmail,
        userId: user.id,
        action,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setStatus("");
      alert(data.error || "Could not update user.");
      return;
    }

    setStatus(data.message || "User updated successfully.");
    await loadUsers(adminEmail);
  }
async function exportSermons() {
  try {
    setStatus("Preparing backup...");

    const response = await fetch("/api/export-sermons", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        adminEmail,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Could not export sermons.");
      setStatus("");
      return;
    }

    const blob = new Blob(
      [JSON.stringify(data, null, 2)],
      { type: "application/json" }
    );

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = `preachers-companion-backup-${
      new Date().toISOString().split("T")[0]
    }.json`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    setStatus(
      `Backup completed. ${data.total_sermons} sermons exported.`
    );
  } catch (error) {
    alert(error.message);
    setStatus("");
  }
}
async function restoreSermons() {
  if (!backupFile) {
    alert("Please select a backup file.");
    return;
  }

  try {
    setStatus("Restoring backup...");

    const fileText = await backupFile.text();
    const backup = JSON.parse(fileText);

    const response = await fetch("/api/restore-sermons", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        adminEmail,
        backup,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Could not restore backup.");
      setStatus("");
      return;
    }

    setStatus(
      `Backup restored successfully. ${data.restored_count} sermons restored.`
    );
  } catch (error) {
    alert(error.message);
    setStatus("");
  }
}
  function isUserSuspended(user) {
    if (!user.banned_until) return false;

    const bannedUntil = new Date(user.banned_until).getTime();
    const now = Date.now();

    return bannedUntil > now;
  }

  if (checkingAdmin) {
    return <div style={loadingStyle}>Checking admin access...</div>;
  }

  if (!isAdmin) {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <h1 style={headingStyle}>Access Denied</h1>
          <p style={subtitleStyle}>
            You do not have permission to access the admin dashboard.
          </p>

          <button style={backButton} onClick={() => navigate("/dashboard")}>
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <button style={backButton} onClick={() => navigate("/dashboard")}>
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        <h1 style={headingStyle}>Admin Dashboard</h1>

        <p style={subtitleStyle}>
          Create approved users, view accounts, and manage access.
        </p>

        <div style={adminBox}>
          <strong>Logged in as admin:</strong> {adminEmail}
        </div>

        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          style={inputStyle}
        />

        <input
          type="email"
          placeholder="User Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />

        <input
          type="text"
          placeholder="Temporary Password"
          value={temporaryPassword}
          onChange={(e) => setTemporaryPassword(e.target.value)}
          style={inputStyle}
        />

        <button style={createButton} onClick={createUser}>
          <UserPlus size={18} />
          Create Approved User
        </button>

        {status && <p style={statusStyle}>{status}</p>}
<div style={backupSection}>
  <button style={backupButton} onClick={exportSermons}>
    <Download size={18} />
    Download Sermon Backup
  </button>

  <div style={{ marginTop: "15px" }}>
    <input
      type="file"
      accept=".json"
      onChange={(e) => setBackupFile(e.target.files[0])}
    />
  </div>

  <button
    style={restoreButton}
    onClick={restoreSermons}
  >
    <Upload size={18} />
    Restore Backup
  </button>
</div>
        <h2 style={sectionHeading}>Registered Users</h2>

        {loadingUsers ? (
          <p style={subtitleStyle}>Loading users...</p>
        ) : (
          <div style={userListBox}>
            {users.length === 0 ? (
              <p style={subtitleStyle}>No users found.</p>
            ) : (
              users.map((user) => {
                const suspended = isUserSuspended(user);

                return (
                  <div key={user.id} style={userCard}>
                    <div>
                      <strong>{user.user_metadata?.full_name || "No Name"}</strong>

                      <p style={userText}>{user.email}</p>

                      <p style={userText}>
                        Created:{" "}
                        {user.created_at
                          ? new Date(user.created_at).toLocaleDateString()
                          : "-"}
                      </p>

                      <p style={userText}>
                        Status:{" "}
                        {suspended
                          ? "Suspended"
                          : user.email_confirmed_at
                          ? "Active"
                          : "Pending Email Confirmation"}
                      </p>
                    </div>

                    <div style={userActions}>
  {user.email === adminEmail ? (
    <span style={ownerBadge}>Owner / Admin</span>
  ) : suspended ? (
    <button
      style={reactivateButton}
      onClick={() => updateUserStatus(user, "reactivate")}
    >
      <CheckCircle size={16} />
      Reactivate
    </button>
  ) : (
    <button
      style={suspendButton}
      onClick={() => updateUserStatus(user, "suspend")}
    >
      <Ban size={16} />
      Suspend
    </button>
  )}
</div>
                  </div>
                );
              })
            )}
          </div>
        )}

        <div style={noteBox}>
          <strong>After creating a user:</strong>
          <p>
            Send them the login URL, email, and temporary password. Ask them to
            use Forgot Password immediately to create their own secure password.
          </p>
        </div>
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "#020617",
  color: "white",
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
  padding: "30px",
  fontFamily: "Arial, sans-serif",
};

const loadingStyle = {
  minHeight: "100vh",
  background: "#020617",
  color: "white",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontSize: "22px",
};

const cardStyle = {
  width: "100%",
  maxWidth: "760px",
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: "20px",
  padding: "35px",
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
  marginBottom: "25px",
};

const headingStyle = {
  margin: 0,
  fontSize: "42px",
  lineHeight: "1.1",
  color: "white",
};

const subtitleStyle = {
  color: "#94a3b8",
  marginTop: "10px",
  marginBottom: "25px",
};

const adminBox = {
  background: "#020617",
  border: "1px solid #334155",
  borderRadius: "12px",
  padding: "14px",
  marginBottom: "20px",
  color: "#cbd5e1",
};
const backupSection = {
  marginTop: "30px",
  marginBottom: "20px",
};

const backupButton = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "12px 16px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "bold",
  display: "flex",
  alignItems: "center",
  gap: "8px",
};
const restoreButton = {
  background: "#16a34a",
  color: "white",
  border: "none",
  padding: "12px 16px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "bold",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  marginTop: "12px",
};
const inputStyle = {
  width: "100%",
  padding: "14px",
  marginBottom: "16px",
  borderRadius: "10px",
  border: "1px solid #334155",
  background: "#1e293b",
  color: "white",
  fontSize: "16px",
  boxSizing: "border-box",
};

const createButton = {
  width: "100%",
  background: "#f59e0b",
  color: "#000",
  border: "none",
  padding: "14px 18px",
  borderRadius: "10px",
  fontWeight: "bold",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  fontSize: "16px",
};

const statusStyle = {
  color: "#22c55e",
  marginTop: "18px",
  textAlign: "center",
  fontWeight: "bold",
};

const sectionHeading = {
  marginTop: "35px",
  marginBottom: "15px",
  color: "white",
};

const userListBox = {
  marginTop: "15px",
};

const userCard = {
  background: "#020617",
  border: "1px solid #334155",
  borderRadius: "12px",
  padding: "14px",
  marginBottom: "12px",
  color: "#cbd5e1",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "14px",
  flexWrap: "wrap",
};

const userText = {
  margin: "6px 0",
  color: "#94a3b8",
};

const userActions = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
};

const suspendButton = {
  background: "#dc2626",
  color: "white",
  border: "none",
  padding: "10px 12px",
  borderRadius: "8px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "6px",
  fontWeight: "bold",
};

const reactivateButton = {
  background: "#16a34a",
  color: "white",
  border: "none",
  padding: "10px 12px",
  borderRadius: "8px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "6px",
  fontWeight: "bold",
};
const ownerBadge = {
  background: "#f59e0b",
  color: "#000",
  padding: "10px 12px",
  borderRadius: "8px",
  fontWeight: "bold",
};
const noteBox = {
  background: "#020617",
  border: "1px solid #334155",
  borderRadius: "12px",
  padding: "14px",
  marginTop: "24px",
  color: "#cbd5e1",
  lineHeight: "1.6",
};

export default Admin;