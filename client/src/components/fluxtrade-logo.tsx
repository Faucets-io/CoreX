import { motion } from "framer-motion";

interface FluxTradeLogoProps {
  className?: string;
  animated?: boolean;
}

export default function FluxTradeLogo({ className = "", animated = true }: FluxTradeLogoProps) {
  const LogoContent = () => (
    <svg
      viewBox="0 0 200 50"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="fluxGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00FF80" />
          <stop offset="100%" stopColor="#00CCFF" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* FLUX */}
      <text
        x="10"
        y="35"
        fontFamily="Orbitron, sans-serif"
        fontSize="32"
        fontWeight="700"
        fill="url(#fluxGradient)"
        filter="url(#glow)"
      >
        Flux
      </text>

      {/* TRADE */}
      <text
        x="85"
        y="35"
        fontFamily="Orbitron, sans-serif"
        fontSize="32"
        fontWeight="700"
        fill="#FFFFFF"
      >
        Trade
      </text>

      {/* Circuit accent on X */}
      <path
        d="M 75 15 L 80 20 M 75 25 L 80 20"
        stroke="url(#fluxGradient)"
        strokeWidth="2"
        strokeLinecap="round"
        filter="url(#glow)"
      />
    </svg>
  );

  if (!animated) {
    return <LogoContent />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        animate={{
          filter: [
            "drop-shadow(0 0 8px rgba(0, 255, 128, 0.5))",
            "drop-shadow(0 0 16px rgba(0, 255, 128, 0.8))",
            "drop-shadow(0 0 8px rgba(0, 255, 128, 0.5))",
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <LogoContent />
      </motion.div>
    </motion.div>
  );
}