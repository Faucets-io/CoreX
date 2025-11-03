
export function FluxTradeLogo({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 70"
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
      <g transform="translate(35, 35)">
        {/* Outer Ring */}
        <circle cx="0" cy="0" r="26" stroke="url(#fluxGradient)" strokeWidth="3" fill="none" />
        
        {/* Dynamic Flux Lines */}
        <path
          d="M -16 -8 Q -8 -12, 0 -10 Q 8 -8, 16 -12"
          stroke="url(#fluxGradient)"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M -16 0 Q -8 4, 0 2 Q 8 0, 16 4"
          stroke="url(#fluxGradient)"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M -16 8 Q -8 12, 0 10 Q 8 8, 16 12"
          stroke="url(#fluxGradient)"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Central F Letter */}
        <path
          d="M -6 -14 L -6 14 M -6 -14 L 6 -14 M -6 0 L 4 0"
          stroke="#00BFFF"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Accent Dots */}
        <circle cx="11" cy="-11" r="2.5" fill="#9D7EFF" />
        <circle cx="11" cy="11" r="2.5" fill="#9D7EFF" />
      </g>
      
      {/* FluxTrade Text - Professional Typography */}
      <g transform="translate(75, 47)">
        {/* Flux - Bold Modern Sans */}
        <text
          x="0"
          y="0"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="38"
          fontWeight="700"
          letterSpacing="-1"
          fill="url(#textGradient)"
        >
          Flux
        </text>
        
        {/* Trade - Slightly Lighter Weight */}
        <text
          x="72"
          y="0"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="38"
          fontWeight="500"
          letterSpacing="-1"
          fill="currentColor"
          className="fill-foreground"
        >
          Trade
        </text>
      </g>
      
      {/* Subtle Underline Accent */}
      <line
        x1="75"
        y1="54"
        x2="145"
        y2="54"
        stroke="url(#fluxGradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
