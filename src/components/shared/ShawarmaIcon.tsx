interface ShawarmaIconProps {
  size?: string;
  className?: string;
}

export function ShawarmaIcon({ size = "100%", className }: ShawarmaIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      {/* Shawarma bread outer layer */}
      <ellipse
        cx="50"
        cy="50"
        rx="35"
        ry="45"
        fill="url(#breadGradient)"
        stroke="url(#breadStroke)"
        strokeWidth="1.5"
      />

      {/* Meat filling visible on sides */}
      <ellipse
        cx="48"
        cy="45"
        rx="30"
        ry="35"
        fill="url(#meatGradient)"
        opacity="0.8"
      />

      {/* Vegetables and sauce */}
      <ellipse
        cx="52"
        cy="48"
        rx="25"
        ry="30"
        fill="url(#veggieGradient)"
        opacity="0.7"
      />

      {/* Top garnish */}
      <ellipse cx="50" cy="20" rx="8" ry="4" fill="url(#garnishGradient)" />

      {/* Highlighting lines for texture */}
      <path
        d="M25 35 Q50 32 75 35"
        stroke="rgba(255, 220, 150, 0.6)"
        strokeWidth="1"
        fill="none"
      />
      <path
        d="M28 50 Q50 48 72 50"
        stroke="rgba(255, 220, 150, 0.4)"
        strokeWidth="0.8"
        fill="none"
      />
      <path
        d="M30 65 Q50 63 70 65"
        stroke="rgba(255, 220, 150, 0.5)"
        strokeWidth="0.6"
        fill="none"
      />

      <defs>
        {/* Bread gradient */}
        <linearGradient id="breadGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F7E6A8" />
          <stop offset="30%" stopColor="#E6D077" />
          <stop offset="70%" stopColor="#D4B942" />
          <stop offset="100%" stopColor="#C4A635" />
        </linearGradient>

        {/* Bread stroke */}
        <linearGradient id="breadStroke" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#B8942A" />
          <stop offset="100%" stopColor="#9A7B22" />
        </linearGradient>

        {/* Meat gradient */}
        <linearGradient id="meatGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#CD853F" />
          <stop offset="50%" stopColor="#A0522D" />
          <stop offset="100%" stopColor="#8B4513" />
        </linearGradient>

        {/* Vegetable gradient */}
        <linearGradient id="veggieGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#90EE90" />
          <stop offset="30%" stopColor="#FFB347" />
          <stop offset="60%" stopColor="#FF6B6B" />
          <stop offset="100%" stopColor="#98FB98" />
        </linearGradient>

        {/* Garnish gradient */}
        <radialGradient id="garnishGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#32CD32" />
          <stop offset="100%" stopColor="#228B22" />
        </radialGradient>
      </defs>
    </svg>
  );
}
