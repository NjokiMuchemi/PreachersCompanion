import { useEffect, useState } from "react";
import { ArrowLeft, Save, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { APP_VERSION } from "../version";
function Settings() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [ministryTitle, setMinistryTitle] = useState("");
  const [churchName, setChurchName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigate("/");
      return;
    }

    setEmail(user.email || "");

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data) {
      setFullName(data.full_name || "");
      setMinistryTitle(data.ministry_title || "");
      setChurchName(data.church_name || "");
      setPhone(data.phone || "");
      setCountry(data.country || "");
    }
  }

  async function saveProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("You must be logged in.");
      return;
    }

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: fullName,
      ministry_title: ministryTitle,
      church_name: churchName,
      phone,
      country,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Profile saved successfully.");
  }

  async function logout() {
    await supabase.auth.signOut();
    navigate("/");
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <button style={backButton} onClick={() => navigate("/dashboard")}>
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        <h1 style={headingStyle}>Profile & Settings</h1>
        <p style={subtitleStyle}>Manage your preacher profile and account details.</p>

        <div style={emailBox}>
          <strong>Email:</strong> {email}
        </div>

<div style={versionBox}>
  <strong>Version:</strong> {APP_VERSION}
</div>
        <input
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          style={inputStyle}
        />

        <input
          placeholder="Ministry Title e.g. Pastor, Bishop, Teacher"
          value={ministryTitle}
          onChange={(e) => setMinistryTitle(e.target.value)}
          style={inputStyle}
        />

        <input
          placeholder="Church / Ministry Name"
          value={churchName}
          onChange={(e) => setChurchName(e.target.value)}
          style={inputStyle}
        />

        <input
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={inputStyle}
        />

        <input
          placeholder="Country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          style={inputStyle}
        />

        <div style={buttonRow}>
          <button style={saveButton} onClick={saveProfile}>
            <Save size={18} />
            Save Profile
          </button>

          <button style={logoutButton} onClick={logout}>
            <LogOut size={18} />
            Logout
          </button>
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

const emailBox = {
  background: "#020617",
  border: "1px solid #334155",
  borderRadius: "12px",
  padding: "14px",
  marginBottom: "20px",
  color: "#cbd5e1",
};

const versionBox = {
  background: "#020617",
  border: "1px solid #334155",
  borderRadius: "12px",
  padding: "14px",
  marginBottom: "20px",
  color: "#22c55e",
  fontWeight: "bold",
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

const buttonRow = {
  display: "flex",
  gap: "12px",
  flexWrap: "wrap",
  marginTop: "10px",
};

const saveButton = {
  background: "#f59e0b",
  color: "#000",
  border: "none",
  padding: "12px 18px",
  borderRadius: "10px",
  fontWeight: "bold",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const logoutButton = {
  background: "#dc2626",
  color: "white",
  border: "none",
  padding: "12px 18px",
  borderRadius: "10px",
  fontWeight: "bold",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

export default Settings;