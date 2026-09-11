import Svg, { Circle, Path, Rect } from "react-native-svg";
import { colors } from "../theme";

/**
 * Inline stroke icons, ported from the web app's Icon.tsx. RN SVG has no CSS
 * `currentColor`, so `color` is passed explicitly and applied to `stroke` on
 * every path — same design-system tokens, just an explicit prop instead of
 * inheritance.
 */
export type IconName =
  | "camera"
  | "upload"
  | "refresh"
  | "sparkles"
  | "cpu"
  | "check"
  | "alert"
  | "ticket"
  | "info"
  | "arrow-right"
  | "scan"
  | "search";

function paths(name: IconName) {
  switch (name) {
    case "camera":
      return (
        <>
          <Path d="M3 8a2 2 0 0 1 2-2h1.5l1-2h7l1 2H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
          <Circle cx="12" cy="12.5" r="3.5" />
        </>
      );
    case "upload":
      return (
        <>
          <Path d="M12 15V4" />
          <Path d="m7 9 5-5 5 5" />
          <Path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
        </>
      );
    case "refresh":
      return (
        <>
          <Path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
          <Path d="M21 3v5h-5" />
          <Path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
          <Path d="M3 21v-5h5" />
        </>
      );
    case "sparkles":
      return (
        <>
          <Path d="M12 3l1.8 4.7L18.5 9l-4.7 1.8L12 15l-1.8-4.2L5.5 9l4.7-1.3Z" />
          <Path d="M19 14l.9 2.3L22 17l-2.1.8L19 20l-.8-2.2L16 17l2.2-.7Z" />
        </>
      );
    case "cpu":
      return (
        <>
          <Rect x="7" y="7" width="10" height="10" rx="1.5" />
          <Path d="M10 3v3M14 3v3M10 18v3M14 18v3M3 10h3M3 14h3M18 10h3M18 14h3" />
        </>
      );
    case "check":
      return (
        <>
          <Circle cx="12" cy="12" r="9" />
          <Path d="m8.5 12.5 2.5 2.5 4.5-5" />
        </>
      );
    case "alert":
      return (
        <>
          <Path d="M10.3 4.3 2.6 17.5A2 2 0 0 0 4.3 20.5h15.4a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0Z" />
          <Path d="M12 9v4M12 16.5h.01" />
        </>
      );
    case "ticket":
      return (
        <>
          <Path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H6a2 2 0 0 1-2-2 2 2 0 0 0 0-4Z" />
          <Path d="M14 6v12" strokeDasharray="2 2" />
        </>
      );
    case "info":
      return (
        <>
          <Circle cx="12" cy="12" r="9" />
          <Path d="M12 11v5M12 8h.01" />
        </>
      );
    case "arrow-right":
      return (
        <>
          <Path d="M5 12h14" />
          <Path d="m13 6 6 6-6 6" />
        </>
      );
    case "scan":
      return (
        <>
          <Path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2" />
          <Path d="M7 12h10" />
        </>
      );
    case "search":
      return (
        <>
          <Circle cx="11" cy="11" r="6" />
          <Path d="m20 20-4.3-4.3" />
        </>
      );
  }
}

export function Icon({
  name,
  size = 17,
  color = colors.inkNavy,
}: {
  name: IconName;
  size?: number;
  color?: string;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths(name)}
    </Svg>
  );
}
