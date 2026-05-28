import { Link } from "react-router-dom";

function Signup() {
  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={headingStyle}>Access by Approval Only</h1>

        <p style={subtitleStyle}>
          Preacher&apos;s Companion is currently available only to approved users.
          To request access, please contact the administrator.
        </p>

        <div style={contactBox}>
          <p style={contactLine}>
            <strong>Email:</strong>{" "}
            <a href="mailto:inmuchemi@yahoo.com" style={contactLink}>
              inmuchemi@yahoo.com
            </a>
          </p>

          <p style={contactLine}>
            <strong>Phone:</strong>{" "}
            <a href="tel:+254710602627" style={contactLink}>
              +254710602627
            </a>
          </p>
        </div>

        <Link to="/" style={buttonStyle}>
          Back to Login
        </Link>
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "#020617",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontFamily: "Arial, sans-serif",
  padding: "20px",
};

const cardStyle = {
  background: "#0f172a",
  padding: "40px",
  borderRadius: "20px",
  width: "100%",
  maxWidth: "460px",
  boxShadow: "0 0 30px rgba(0,0,0,0.4)",
  textAlign: "center",
};

const headingStyle = {
  color: "white",
  marginBottom: "14px",
  fontSize: "38px",
  lineHeight: "1.08",
};

const subtitleStyle = {
  color: "#94a3b8",
  marginBottom: "28px",
  lineHeight: "1.6",
};

const contactBox = {
  background: "#020617",
  border: "1px solid #334155",
  borderRadius: "14px",
  padding: "18px",
  marginBottom: "28px",
  textAlign: "left",
};

const contactLine = {
  color: "#cbd5e1",
  margin: "10px 0",
};

const contactLink = {
  color: "#f59e0b",
  textDecoration: "none",
  fontWeight: "bold",
};

const buttonStyle = {
  display: "block",
  width: "100%",
  padding: "14px",
  background: "#f59e0b",
  color: "#000",
  borderRadius: "10px",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  boxSizing: "border-box",
};

export default Signup;