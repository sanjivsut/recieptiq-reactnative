import Svg, { Line, Text as SvgText, TSpan } from "react-native-svg";
import { colors } from "../theme";

/**
 * Horizontal "Receipt.IQ" wordmark, ported from the web app's
 * public/logo/receiptiq-wordmark.svg. One text run so "IQ" can never overlap
 * "Receipt" regardless of font metrics; the raised dot is the stamp accent.
 */
export function Wordmark({ width = 200 }: { width?: number }) {
  const height = (width * 96) / 340;
  return (
    <Svg width={width} height={height} viewBox="0 0 340 96">
      <SvgText x={6} y={62} fontSize={46} fontWeight="700" fontFamily="IBMPlexMono_600SemiBold">
        <TSpan fill={colors.inkNavy}>Receipt</TSpan>
        <TSpan fill={colors.stampRed} fontSize={30} dy={-16}>
          .
        </TSpan>
        <TSpan fill={colors.stampRed} dy={16} dx={1} fontFamily="Oswald_700Bold">
          IQ
        </TSpan>
      </SvgText>
      <Line x1={6} y1={80} x2={334} y2={80} stroke={colors.greyBrown} strokeWidth={2} strokeDasharray="3 4" />
    </Svg>
  );
}
