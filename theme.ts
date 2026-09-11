// Design tokens — the RN equivalent of the web app's globals.css custom
// properties. Never hardcode these hex values or font family strings anywhere
// else; import from here.

export const colors = {
  paperCream: "#FBF7EE",
  paperWhite: "#FFFDF7",
  inkNavy: "#1B2A41",
  stampRed: "#B8382B",
  stampGreen: "#2E7D32",
  greyBrown: "#8B7E74",
  heroMint: "#E3F0E1",
} as const;

export const fonts = {
  mono: "IBMPlexMono_400Regular",
  monoMedium: "IBMPlexMono_500Medium",
  monoSemiBold: "IBMPlexMono_600SemiBold",
  display: "Oswald_400Regular",
  displaySemiBold: "Oswald_600SemiBold",
  displayBold: "Oswald_700Bold",
} as const;

export const radius = 2;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;
