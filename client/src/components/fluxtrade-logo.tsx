
export function FluxTradeLogo({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Gradient Definitions */}
      <defs>
        <linearGradient id="fluxGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00BFFF" />
          <stop offset="100%" stopColor="#9D7EFF" />
        </linearGradient>
        <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00BFFF" />
          <stop offset="50%" stopColor="#1E90FF" />
          <stop offset="100%" stopColor="#9D7EFF" />
        </linearGradient>
      </defs>
      
      {/* Icon Symbol - Left Side */}
      <g transform="translate(40, 40)">
        {/* Outer Ring */}
        <circle cx="0" cy="0" r="28" stroke="url(#fluxGradient)" strokeWidth="3" fill="none" />
        
        {/* Dynamic Flux Lines */}
        <path
          d="M -18 -9 Q -9 -13, 0 -11 Q 9 -9, 18 -13"
          stroke="url(#fluxGradient)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M -18 0 Q -9 4, 0 2 Q 9 0, 18 4"
          stroke="url(#fluxGradient)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M -18 9 Q -9 13, 0 11 Q 9 9, 18 13"
          stroke="url(#fluxGradient)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Central F Letter */}
        <path
          d="M -7 -16 L -7 16 M -7 -16 L 7 -16 M -7 0 L 5 0"
          stroke="#00BFFF"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Accent Dots */}
        <circle cx="12" cy="-12" r="2" fill="#9D7EFF" />
        <circle cx="12" cy="12" r="2" fill="#9D7EFF" />
      </g>
      
      {/* FluxTrade Text - Professional Typography */}
      <g transform="translate(80, 52)">
        {/* Flux - Bold Modern Sans */}
        <text
          x="0"
          y="0"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="32"
          fontWeight="700"
          letterSpacing="-0.5"
          fill="url(#textGradient)"
        >
          Flux
        </text>
        
        {/* Trade - Slightly Lighter Weight */}
        <text
          x="62"
          y="0"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="32"
          fontWeight="500"
          letterSpacing="-0.5"
          fill="currentColor"
          className="fill-foreground"
        >
          Trade
        </text>
      </g>
      
      {/* Subtle Underline Accent */}
      <line
        x1="80"
        y1="58"
        x2="125"
        y2="58"
        stroke="url(#fluxGradient)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
