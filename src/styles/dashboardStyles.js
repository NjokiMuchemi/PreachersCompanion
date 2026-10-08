import { colors } from "../theme/companionTheme";
import { gradients } from "../theme/gradients";
import { shadows } from "../theme/shadows";
import { typography } from "../theme/typography";

// ======================================
// PAGE LAYOUT
// ======================================

export const pageStyle = {
  height: "100vh",
  display: "flex",
  background: colors.slate950,
  color: colors.white,
  fontFamily: typography.fontFamily,
  overflow: "hidden",
};

export const sidebarStyle = {
  width: "280px",
  height: "100vh",
  background: colors.slate900,
  padding: "30px",
  borderRight: `1px solid ${colors.slate800}`,
  boxSizing: "border-box",
  overflowY: "auto",
  flexShrink: 0,
};

export const mainStyle = {
  flex: 1,
  height: "100vh",
  padding: "40px",
  boxSizing: "border-box",
  overflowY: "auto",
};
// ======================================
// SIDEBAR BRANDING + NAVIGATION
// ======================================

export const brandBox = {
  borderBottom: `1px solid ${colors.slate800}`,
  paddingBottom: "22px",
};

export const brandTitle = {
  margin: 0,
  color: colors.white,
  fontSize: "22px",
  lineHeight: "1.1",
  letterSpacing: "0.5px",
};

export const brandScripture = {
  color: colors.amber400,
  fontWeight: "bold",
  margin: "10px 0 8px",
  lineHeight: "1.4",
};

export const poweredBy = {
  color: colors.slate500,
  fontSize: "12px",
  lineHeight: "1.5",
  margin: 0,
};

export const getNavStyle = (active) => ({
  padding: "12px",
  color: active ? colors.slate950 : colors.slate300,
  background: active ? colors.amber400 : "transparent",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: active ? "bold" : "normal",
  display: "flex",
  alignItems: "center",
  gap: "8px",
});

export const logoutNavStyle = {
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
// ======================================
// TOP BAR + HEADINGS
// ======================================

export const topBarStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "30px",
  gap: "20px",
};

export const headingStyle = {
  margin: 0,
  fontSize: "48px",
  lineHeight: "1.1",
  color: colors.white,
};

export const subtitleStyle = {
  color: colors.slate500,
  marginTop: "10px",
};

export const topActions = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
};

export const viewToggle = {
  display: "flex",
  gap: "6px",
};
// ======================================
// VIEW + ACTION BUTTONS
// ======================================

export const viewButton = {
  background: colors.slate800,
  border: `1px solid ${colors.slate700}`,
  color: colors.white,
  padding: "10px",
  borderRadius: "8px",
  cursor: "pointer",
};

export const activeViewButton = {
  ...viewButton,
  background: colors.amber400,
  color: colors.slate950,
};

export const newButtonStyle = {
  background: colors.amber400,
  color: colors.slate950,
  padding: "12px 18px",
  borderRadius: "10px",
  textDecoration: "none",
  fontWeight: "bold",
  display: "flex",
  alignItems: "center",
  gap: "8px",
};
// ======================================
// SEARCH + CARDS LAYOUT
// ======================================

export const searchBoxStyle = {
  background: colors.slate900,
  border: `1px solid ${colors.slate800}`,
  padding: "14px",
  borderRadius: "12px",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginBottom: "30px",
};

export const searchInputStyle = {
  flex: 1,
  background: "transparent",
  border: "none",
  outline: "none",
  color: colors.white,
  fontSize: "16px",
};

export const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: "20px",
};

export const listStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "16px",
};

export const cardStyle = {
  background: colors.slate900,
  padding: "25px",
  borderRadius: "16px",
  border: `1px solid ${colors.slate800}`,
  cursor: "pointer",
};

export const listCardStyle = {
  background: colors.slate900,
  padding: "20px",
  borderRadius: "16px",
  border: `1px solid ${colors.slate800}`,
  cursor: "pointer",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "20px",
};
// ======================================
// CATEGORY + TAGS
// ======================================

export const categoryHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  marginBottom: "15px",
  flexWrap: "wrap",
};

export const renameCategoryButton = {
  background: colors.slate800,
  color: colors.white,
  border: `1px solid ${colors.slate700}`,
  padding: "8px 12px",
  borderRadius: "8px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "6px",
  fontWeight: "bold",
};

export const tagRow = {
  display: "flex",
  gap: "6px",
  flexWrap: "wrap",
  marginTop: "10px",
};

export const tagChip = {
  background: colors.slate800,
  color: colors.amber400,
  border: `1px solid ${colors.slate700}`,
  borderRadius: "999px",
  padding: "4px 8px",
  fontSize: "12px",
  fontWeight: "bold",
};
// ======================================
// SERMON CARD ACTIONS
// ======================================

export const mutedText = {
  color: colors.muted,
};

export const buttonRow = {
  display: "flex",
  gap: "10px",
  marginTop: "15px",
  flexWrap: "wrap",
};

export const smallButton = {
  background: colors.slate800,
  color: colors.white,
  border: `1px solid ${colors.slate700}`,
  padding: "8px 12px",
  borderRadius: "8px",
  cursor: "pointer",
};

export const preachButton = {
  background: colors.amber400,
  color: colors.slate950,
  border: "none",
  padding: "8px 12px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
};

export const favoriteButton = {
  background: colors.slate800,
  color: colors.amber400,
  border: `1px solid ${colors.slate700}`,
  padding: "8px 12px",
  borderRadius: "8px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
};

export const trashButton = {
  background: colors.rose,
  color: colors.white,
  border: "none",
  padding: "8px 12px",
  borderRadius: "8px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
};

export const restoreButton = {
  background: colors.emerald,
  color: colors.white,
  border: "none",
  padding: "10px 14px",
  borderRadius: "8px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "6px",
};

export const emptyText = {
  color: colors.muted,
  fontSize: "18px",
};
// ======================================
// STORAGE CARD
// ======================================

export const sidebarStorageCardStyle = {
  marginTop: "22px",
  background: colors.slate950,
  border: `1px solid rgba(134,239,172,0.35)`,
  borderRadius: "14px",
  padding: "12px",
  color: colors.text,
  boxShadow: shadows.soft,
};

export const sidebarStorageHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "8px",
  fontSize: "13px",
  marginBottom: "10px",
  color: "#d9f99d",
};

export const sidebarStorageBarOuter = {
  height: "8px",
  background: colors.slate900,
  borderRadius: "999px",
  overflow: "hidden",
  border: `1px solid ${colors.slate800}`,
  marginBottom: "8px",
};

export const sidebarStorageBarInner = {
  height: "100%",
  borderRadius: "999px",
  transition: "width .3s ease",
};

export const sidebarStorageTextStyle = {
  margin: "4px 0 0",
  color: colors.muted,
  fontSize: "12px",
  lineHeight: "1.35",
};
// ======================================
// STATISTICS CARDS
// ======================================

export const statsRowStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "16px",
  marginBottom: "20px",
};

export const statsCardStyle = {
  background: colors.slate900,
  border: `1px solid ${colors.slate800}`,
  borderRadius: "14px",
  padding: "18px",
  textAlign: "center",
};

export const statsNumberStyle = {
  color: colors.amber400,
  fontSize: "32px",
  fontWeight: "bold",
};

export const statsLabelStyle = {
  color: colors.muted,
  fontSize: "14px",
  marginTop: "6px",
};