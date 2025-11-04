
import { motion } from "framer-motion";

interface FluxTradeProfilePicProps {
  size?: number;
  animated?: boolean;
}

export default function FluxTradeProfilePic({ 
  size = 400, 
  animated = false 
}: FluxTradeProfilePicProps) {
  const Content = () => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0A0A0A" />
          <stop offset="50%" stopColor="#1A1A1A" />
          <stop offset="100%" stopColor="#0A0A0A" />
        </linearGradient>
        <linearGradient id="fluxGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00FF80" />
          <stop offset="100%" stopColor="#00CCFF" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="circleGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00FF80" stopOpacity="0.3" />
          <stop offset="50%" stopColor="#00CCFF" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#00FF80" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Background Circle */}
      <circle cx="200" cy="200" r="200" fill="url(#bgGradient)" />
      
      {/* Glow Effect */}
      <circle cx="200" cy="200" r="180" fill="url(#circleGlow)" />
      
      {/* Border Ring */}
      <circle 
        cx="200" 
        cy="200" 
        r="190" 
        fill="none" 
        stroke="url(#fluxGradient)" 
        strokeWidth="3"
        opacity="0.6"
      />

      {/* Jet Icon - Centered and Larger */}
      <g transform="translate(100, 80)">
        {/* Jet body */}
        <path
          d="M 100 40 L 140 80 L 135 100 L 140 120 L 100 160 L 60 120 L 65 100 L 60 80 Z"
          fill="url(#fluxGradient)"
          stroke="#00FF80"
          strokeWidth="2"
          filter="url(#glow)"
        />

        {/* Wings */}
        <path
          d="M 60 80 L 30 90 L 40 100 L 60 95 Z"
          fill="#00CCFF"
          stroke="#00CCFF"
          strokeWidth="1.5"
          filter="url(#glow)"
        />
        <path
          d="M 140 80 L 170 90 L 160 100 L 140 95 Z"
          fill="#00CCFF"
          stroke="#00CCFF"
          strokeWidth="1.5"
          filter="url(#glow)"
        />

        {/* Cockpit */}
        <ellipse
          cx="100"
          cy="70"
          rx="15"
          ry="12"
          fill="#00CCFF"
          opacity="0.7"
        />

        {/* Engine thrusters */}
        <circle cx="85" cy="150" r="8" fill="#00FF80" filter="url(#glow)" />
        <circle cx="115" cy="150" r="8" fill="#00FF80" filter="url(#glow)" />

        {/* FT logo on jet */}
        <text
          x="100"
          y="105"
          fontFamily="Orbitron, sans-serif"
          fontSize="16"
          fontWeight="700"
          fill="#FFFFFF"
          textAnchor="middle"
        >
          FT
        </text>
      </g>

      {/* FluxTrade Text Below Jet */}
      <g transform="translate(200, 280)">
        {/* FLUX */}
        <text
          x="0"
          y="0"
          fontFamily="Orbitron, sans-serif"
          fontSize="42"
          fontWeight="700"
          fill="url(#fluxGradient)"
          filter="url(#glow)"
          textAnchor="middle"
        >
          Flux
        </text>
        
        {/* TRADE */}
        <text
          x="0"
          y="45"
          fontFamily="Orbitron, sans-serif"
          fontSize="42"
          fontWeight="700"
          fill="#FFFFFF"
          textAnchor="middle"
        >
          Trade
        </text>
      </g>

      {/* Decorative corner accents */}
      <path
        d="M 50 50 L 70 50 L 70 55 M 50 50 L 50 70 L 55 70"
        stroke="url(#fluxGradient)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M 350 50 L 330 50 L 330 55 M 350 50 L 350 70 L 345 70"
        stroke="url(#fluxGradient)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M 50 350 L 70 350 L 70 345 M 50 350 L 50 330 L 55 330"
        stroke="url(#fluxGradient)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M 350 350 L 330 350 L 330 345 M 350 350 L 350 330 L 345 330"
        stroke="url(#fluxGradient)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );

  if (!animated) {
    return <Content />;
  }

  return (
    <motion.div
      animate={{
        filter: [
          "drop-shadow(0 0 10px rgba(0, 255, 128, 0.5))",
          "drop-shadow(0 0 20px rgba(0, 255, 128, 0.8))",
          "drop-shadow(0 0 10px rgba(0, 255, 128, 0.5))",
        ],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <Content />
    </motion.div>
  );
}
