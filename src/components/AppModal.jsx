function AppModal({
  open,
  icon = "⚠️",
  title,
  message,
  children,
  onClose,
}) {
  if (!open) return null;

  return (
    <div style={overlay}>
      <div style={modal}>
        <button style={closeButton} onClick={onClose}>×</button>

        <div style={iconCircle}>{icon}</div>

        <h2 style={titleStyle}>{title}</h2>

        <p style={messageStyle}>{message}</p>

        <div style={actions}>{children}</div>
      </div>
    </div>
  );
}

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(2, 6, 23, 0.78)",
  backdropFilter: "blur(8px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
  animation: "fadeIn 0.2s ease",
};

const modal = {
  width: "100%",
  maxWidth: "460px",
  background: "#0f172a",
  border: "1px solid #334155",
  borderRadius: "24px",
  padding: "34px",
  color: "white",
  boxShadow: "0 30px 90px rgba(0,0,0,0.55)",
  position: "relative",
  textAlign: "center",
};

const closeButton = {
  position: "absolute",
  right: "18px",
  top: "14px",
  background: "transparent",
  border: "none",
  color: "#cbd5e1",
  fontSize: "32px",
  cursor: "pointer",
};

const iconCircle = {
  width: "82px",
  height: "82px",
  margin: "0 auto 18px",
  borderRadius: "50%",
  background: "#d9f99d",
  color: "#0f172a",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "38px",
  boxShadow: "0 0 35px rgba(217,249,157,0.35)",
};

const titleStyle = {
  color: "#d9f99d",
  fontSize: "28px",
  margin: "0 0 14px",
  fontWeight: "900",
};

const messageStyle = {
  color: "#e5e7eb",
  fontSize: "17px",
  lineHeight: "1.6",
  whiteSpace: "pre-line",
};

const actions = {
  marginTop: "24px",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

export default AppModal;