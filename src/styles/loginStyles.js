import { colors } from "../theme/companionTheme";
import { gradients } from "../theme/gradients";
import { shadows } from "../theme/shadows";
import { typography } from "../theme/typography";

export const pageStyle = {
  width: "100%",
  minHeight: "100dvh",
  overflow: "hidden",
  background: colors.page,
  display: "flex",
  flexDirection: "column",
  margin: 0,
  padding: 0,
  boxSizing: "border-box",
  fontFamily: typography.fontFamily,
};

export const loginShell = {
  width: "100%",
  height: "100dvh",
  minHeight: "0",
  display: "grid",
  gridTemplateColumns: "minmax(0, 34%) minmax(0, 66%)",
  overflow: "hidden",
  background: colors.page,
};

export const formPanel = {
  minHeight: 0,
  minWidth: 0,
  overflowY: "auto",
  padding: "clamp(22px, 3vh, 36px) clamp(24px, 3vw, 48px)",
  background: gradients.panel,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  boxSizing: "border-box",
};

export const formContent = {
  width: "100%",
  maxWidth: "430px",
  margin: "auto",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
};
export const brandHeader = {
  display: "flex",
  alignItems: "center",
  gap: "16px",
  marginBottom: "clamp(18px, 3vh, 28px)",
};

export const brandLogoStyle = {
  width: "clamp(46px, 4vw, 62px)",
  height: "clamp(46px, 4vw, 62px)",
  minWidth: "46px",
  objectFit: "contain",
  display: "block",
  flexShrink: 0,
};
export const brandTitle = {
  margin: "0",
  textTransform: "uppercase",
  letterSpacing: "1px",
  fontSize: "clamp(21px, 2vw, 31px)",
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
  marginBottom: "clamp(14px, 2vh, 22px)",
};

export const mainHeadline = {
  color: colors.amber400,
  margin: "0",
  textTransform: "uppercase",
  letterSpacing: "1px",
  fontSize: "clamp(12px, 1vw, 14px)",
  fontWeight: "600",
  fontStyle: "italic",
  lineHeight: "1.3",
};

export const scriptureStyle = {
  color: colors.heading,
  fontSize: "clamp(12px, 0.95vw, 14px)",
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
  padding: "12px 14px",
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
  padding: "13px 16px",
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
  marginTop: "clamp(14px, 2vh, 20px)",
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
  background: "radial-gradient(ellipse at 78% 36%, #153d83 0%, #091b43 38%, #020617 82%)",
};

export const heroOverlay = {
  position: "absolute",
  inset: 0,
  background: "linear-gradient(90deg, rgba(2,6,23,.24), transparent 65%)",
  zIndex: 1,
};

export const heroTextBlock = {
  position: "absolute",
  zIndex: 2,
  top: "clamp(38px, 7vh, 76px)",
  left: "clamp(30px, 4vw, 64px)",
  width: "min(55%, 480px)",
};

export const heroKicker = {
  color: colors.heading,
  margin: "0",
  textTransform: "uppercase",
  letterSpacing: "1px",
  fontSize: "clamp(22px, 2.4vw, 36px)",
  fontWeight: "900",
  lineHeight: "1",
};

export const heroBigTitle = {
  color: colors.amber400,
  margin: "6px 0 18px",
  textTransform: "uppercase",
  fontSize: "clamp(48px, 4.7vw, 76px)",
  fontWeight: "900",
  lineHeight: "0.9",
  letterSpacing: "-2px",
};

export const heroIntro = {
  color: colors.heading,
  margin: 0,
  fontSize: "clamp(12px, 0.95vw, 15px)",
  lineHeight: "1.55",
  textAlign: "left",
  fontStyle: "normal",
};
// ======================================
// FEATURE BAR
// ======================================

export const featureBar = {
  position: "absolute",
  zIndex: 2,
  left: "clamp(24px, 3vw, 48px)",
  right: "clamp(24px, 3vw, 48px)",
  bottom: "clamp(16px, 2.5vh, 26px)",
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  background: "rgba(5, 15, 37, 0.86)",
  border: `1px solid ${colors.border}`,
  borderRadius: "16px",
  padding: "clamp(10px, 1.4vh, 14px) 8px",
  boxShadow: shadows.soft,
  backdropFilter: "blur(10px)",
};

export const featureItem = {
  textAlign: "center",
  padding: "0 clamp(5px, 0.9vw, 14px)",
  borderRight: `1px solid ${colors.border}`,
};

export const featureItemLast = {
  ...featureItem,
  borderRight: "none",
};

export const featureIcon = {
  color: colors.amber400,
  fontSize: "clamp(19px, 1.5vw, 26px)",
  marginBottom: "5px",
};

export const featureTitle = {
  color: colors.amber400,
  display: "block",
  fontSize: "clamp(11px, 0.9vw, 14px)",
  textTransform: "uppercase",
  marginBottom: "6px",
};

export const featureText = {
  color: colors.text,
  fontSize: "clamp(10px, 0.8vw, 12px)",
  lineHeight: "1.4",
};