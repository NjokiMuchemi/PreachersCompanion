import { useEffect, useState } from "react";
import { ArrowLeft, UserPlus } from "lucide-react";
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
          Create approved users for Preacher&apos;s Companion.
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
  alignItems: "center",
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
  maxWidth: "620px",
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