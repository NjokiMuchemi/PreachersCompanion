import { colors } from "../theme/companionTheme";
import { gradients } from "../theme/gradients";
import { shadows } from "../theme/shadows";
import { typography } from "../theme/typography";

export const pageStyle = {
  width: "100vw",
  minHeight: "100svh",
  overflow: "auto",
  background: colors.page,
  display: "flex",
  flexDirection: "column",
  margin: 0,
  padding: 0,
  boxSizing: "border-box",
  fontFamily: typography.fontFamily,
};

export const loginShell = {
  width: "100vw",
  height: "100vh",
  display: "grid",
  gridTemplateColumns: "33% 67%",
  overflow: "hidden",
  background: colors.page,
};

export const formPanel = {
  minHeight: "100svh",
  overflow: "auto",
  padding: "40px 24px",
  background: gradients.panel,
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-start",
  boxSizing: "border-box",
};

export const formContent = {
  width: "100%",
  maxWidth: "520px",
  maxHeight: "94vh",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
};
export const brandHeader = {
  display: "flex",
  alignItems: "center",
  gap: "16px",
  marginBottom: "clamp(24px, 4vh, 42px)",
};

export const brandLogoStyle = {
  width: "70px",
  height: "70px",
  minWidth: "70px",
  objectFit: "contain",
  display: "block",
  flexShrink: 0,
};
export const brandTitle = {
  margin: "0",
  textTransform: "uppercase",
  letterSpacing: "1px",
  fontSize: "clamp(24px, 2.5vw, 46px)",
  fontWeight: "900",
  lineHeight: "1.1",
  display: "flex",
  flexDirection: "column",
};

export const titleFirstWord = {
  color: colors.amber400,
  fontStyle: "normal",
};

export const titleSecondWord = {
  color: colors.white,
  fontStyle: "italic",
  fontWeight: "700",
};

export const headlineBlock = {
  marginTop: "0px",
  marginBottom: "24px",
};

export const mainHeadline = {
  color: colors.amber400,
  margin: "0",
  textTransform: "uppercase",
  letterSpacing: "1px",
  fontSize: "clamp(13px, 1.1vw, 16px)",
  fontWeight: "600",
  fontStyle: "italic",
  lineHeight: "1.3",
};

export const scriptureStyle = {
  color: colors.heading,
  fontSize: "clamp(13px, 0.95vw, 16px)",
  lineHeight: "1.65",
  fontStyle: "italic",
  borderLeft: `4px solid ${colors.amber400}`,
  paddingLeft: "16px",
  margin: "0 0 6px 0",
};

export const goldText = {
  color: colors.amber400,
};

export const formBox = {
  marginTop: "clamp(6px, 1vh, 12px)",
};

export const inputStyle = {
  width: "100%",
  padding: "13px 15px",
  marginBottom: "12px",
  borderRadius: "12px",
  border: `1px solid ${colors.border}`,
  background: colors.inputBg,
  color: colors.white,
  fontSize: "14px",
  boxSizing: "border-box",
};

export const forgotWrapper = {
  textAlign: "right",
  marginTop: "-4px",
  marginBottom: "clamp(16px, 2vh, 22px)",
};

export const forgotLinkStyle = {
  color: colors.amber400,
  textDecoration: "none",
  fontSize: "clamp(12px, 0.9vw, 14px)",
  fontWeight: "bold",
};

export const buttonStyle = {
  width: "100%",
  padding: "clamp(14px, 1.8vh, 18px)",
  background: gradients.amber,
  color: colors.slate950,
  border: "none",
  borderRadius: "14px",
  fontSize: "clamp(15px, 1vw, 18px)",
  fontWeight: "900",
  cursor: "pointer",
  boxShadow: shadows.amber,
};

export const dividerRow = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
  margin: "8px 0px 6px 0px",
};

export const dividerLine = {
  height: "1px",
  flex: 1,
  background: colors.border,
};

export const dividerText = {
  color: colors.muted,
  fontSize: "12px",
  fontWeight: "700",
};

export const bottomTextStyle = {
  color: colors.text,
  textAlign: "center",
  margin: "0",
  lineHeight: "1.2",
  paddingTop: "6px",
  paddingBottom: "6px",
  fontSize: "clamp(13px, 0.95vw, 16px)",
};

export const linkStyle = {
  color: colors.amber400,
  textDecoration: "none",
  fontWeight: "bold",
};

export const poweredBox = {
  marginTop: "18px",
  paddingTop: "12px",
  borderTop: `1px solid ${colors.border}`,
  color: colors.text,
  textAlign: "center",
  fontSize: "11px",
  lineHeight: "1.4",
};

export const initiativeText = {
  color: colors.white,
  fontWeight: "600",
};
// ======================================
// HERO SECTION
// ======================================

export const heroPanel = {
  position: "relative",
  height: "100%",
  minHeight: 0,
  overflow: "hidden",
  background: colors.page,
};

export const heroImage = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  objectPosition: "center center",
  display: "block",
  filter: "saturate(1.08) contrast(1.06)",
};

export const heroOverlay = {
  position: "absolute",
  inset: 0,
  background: gradients.heroOverlay,
  zIndex: 1,
};

export const heroTextBlock = {
  position: "absolute",
  zIndex: 2,
  top: "clamp(55px, 10vh, 120px)",
  left: "clamp(42px, 5vw, 95px)",
  maxWidth: "520px",
};

export const heroKicker = {
  color: colors.heading,
  margin: "0",
  textTransform: "uppercase",
  letterSpacing: "1px",
  fontSize: "clamp(24px, 2.5vw, 46px)",
  fontWeight: "900",
  lineHeight: "1",
};

export const heroBigTitle = {
  color: colors.amber400,
  margin: "6px 0 18px",
  textTransform: "uppercase",
  fontSize: "clamp(52px, 5.5vw, 110px)",
  fontWeight: "900",
  lineHeight: "0.9",
  letterSpacing: "-2px",
};

export const heroIntro = {
  color: colors.heading,
  margin: 0,
  fontSize: "clamp(12px, 0.95vw, 15px)",
  lineHeight: "1.55",
  textAlign: "center",
  fontStyle: "italic",
};
// ======================================
// FEATURE BAR
// ======================================

export const featureBar = {
  position: "absolute",
  zIndex: 2,
  left: "clamp(34px, 4vw, 78px)",
  right: "clamp(34px, 4vw, 78px)",
  bottom: "clamp(30px, 4vh, 54px)",
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  background: gradients.panel,
  border: `1px solid ${colors.border}`,
  borderRadius: "22px",
  padding: "clamp(18px, 2.5vh, 28px)",
  boxShadow: shadows.soft,
  backdropFilter: "blur(10px)",
};

export const featureItem = {
  textAlign: "center",
  padding: "0 clamp(10px, 1.4vw, 24px)",
  borderRight: `1px solid ${colors.border}`,
};

export const featureItemLast = {
  ...featureItem,
  borderRight: "none",
};

export const featureIcon = {
  color: colors.amber400,
  fontSize: "clamp(24px, 2vw, 38px)",
  marginBottom: "10px",
};

export const featureTitle = {
  color: colors.amber400,
  display: "block",
  fontSize: "clamp(13px, 1vw, 18px)",
  textTransform: "uppercase",
  marginBottom: "6px",
};

export const featureText = {
  color: colors.text,
  fontSize: "clamp(11px, 0.9vw, 15px)",
  lineHeight: "1.4",
};