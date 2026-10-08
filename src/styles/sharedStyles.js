import { colors } from "../theme/companionTheme";

export const pageBackground = {
  minHeight: "100vh",
  background: colors.slate950,
  color: colors.white,
  fontFamily: "Arial, sans-serif",
};

export const cardStyle = {
  background: colors.slate900,
  border: `1px solid ${colors.slate800}`,
  borderRadius: "16px",
  boxShadow: "0 18px 45px rgba(0,0,0,0.25)",
};

export const primaryButton = {
  background: colors.amber400,
  color: colors.slate950,
  border: "none",
  borderRadius: "10px",
  fontWeight: "bold",
  cursor: "pointer",
};

export const secondaryButton = {
  background: colors.slate800,
  color: colors.white,
  border: `1px solid ${colors.slate700}`,
  borderRadius: "10px",
  cursor: "pointer",
};