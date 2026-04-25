import type { CSSProperties } from 'react';
import { LOGO_TEXT_FILL, LOGO_TILE_FILL } from './logoTokens';

type LogoMarkProps = {
  size?: number;
  className?: string;
};

const textStyle: CSSProperties = {
  fill: LOGO_TEXT_FILL,
  fontFamily: 'Times New Roman, Times, Georgia, serif',
  fontSize: 24,
  fontWeight: 500,
  fontStyle: 'normal',
};

export default function LogoMark({ size = 44, className }: LogoMarkProps) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width={size}
      height={size}
      aria-hidden
      style={{ opacity: 1 }}
    >
      <rect
        x="4"
        y="4"
        width="40"
        height="40"
        rx="10"
        style={{ fill: LOGO_TILE_FILL }}
      />
      <text x="24" y="32" textAnchor="middle" style={textStyle}>
        Ki
      </text>
    </svg>
  );
}
