import { colors } from "./companionTheme";

export const gradients = {
  page:
    "radial-gradient(circle at 18% 8%, rgba(52,81,141,0.35), transparent 28%), linear-gradient(135deg, #020617 0%, #0f172a 48%, #020617 100%)",

  panel:
    "linear-gradient(180deg, rgba(15,23,42,0.98), rgba(2,6,23,0.98))",

  heroOverlay:
    "linear-gradient(90deg, rgba(2,6,23,0.78) 0%, rgba(2,6,23,0.44) 33%, rgba(2,6,23,0.16) 68%), linear-gradient(0deg, rgba(2,6,23,0.82), transparent 48%)",

  amber:
    `linear-gradient(135deg, ${colors.amber400}, ${colors.amber300})`,
};