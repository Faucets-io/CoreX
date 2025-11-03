
export function FluxTradeLogo({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background Circle with Gradient */}
      <defs>
        <linearGradient id="fluxGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00BFFF" />
          <stop offset="100%" stopColor="#9D7EFF" />
        </linearGradient>
        <linearGradient id="innerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E90FF" />
          <stop offset="100%" stopColor="#00BFFF" />
        </linearGradient>
      </defs>
      
      {/* Main Circle Background */}
      <circle cx="100" cy="100" r="90" fill="url(#fluxGradient)" opacity="0.1" />
      
      {/* Bitcoin-inspired Symbol */}
      <g transform="translate(100, 100)">
        {/* Outer Ring */}
        <circle cx="0" cy="0" r="60" stroke="url(#fluxGradient)" strokeWidth="4" fill="none" />
        
        {/* Inner Dynamic Flux Lines */}
        <path
          d="M -40 -20 Q -20 -30, 0 -25 Q 20 -20, 40 -30"
          stroke="url(#innerGradient)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M -40 0 Q -20 10, 0 5 Q 20 0, 40 10"
          stroke="url(#innerGradient)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M -40 20 Q -20 30, 0 25 Q 20 20, 40 30"
          stroke="url(#innerGradient)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Central F Letter */}
        <path
          d="M -15 -35 L -15 35 M -15 -35 L 15 -35 M -15 0 L 10 0"
          stroke="#00BFFF"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Accent Dots */}
        <circle cx="25" cy="-25" r="3" fill="#9D7EFF" />
        <circle cx="25" cy="25" r="3" fill="#9D7EFF" />
        <circle cx="-25" cy="0" r="3" fill="#1E90FF" />
      </g>
    </svg>
  );
}
