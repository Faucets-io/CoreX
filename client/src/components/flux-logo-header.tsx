
import { motion } from "framer-motion";
import FluxTradeLogo from "./fluxtrade-logo";

export default function FluxLogoHeader() {
  return (
    <motion.div
      className="flex items-center justify-center gap-2 mb-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-8 h-8">
        <svg
          width="32"
          height="32"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 100 40 L 140 80 L 135 100 L 140 120 L 100 160 L 60 120 L 65 100 L 60 80 Z"
            fill="#00FF80"
            stroke="#00CC66"
            strokeWidth="2"
          />
          <path
            d="M 60 80 L 30 90 L 40 100 L 60 95 Z"
            fill="#00CC66"
            stroke="#00CC66"
            strokeWidth="1.5"
          />
          <path
            d="M 140 80 L 170 90 L 160 100 L 140 95 Z"
            fill="#00CC66"
            stroke="#00CC66"
            strokeWidth="1.5"
          />
          <ellipse
            cx="100"
            cy="70"
            rx="15"
            ry="12"
            fill="#00CCFF"
            opacity="0.6"
          />
          <circle cx="85" cy="150" r="6" fill="#00FF80" />
          <circle cx="115" cy="150" r="6" fill="#00FF80" />
          <text
            x="100"
            y="105"
            fontFamily="Orbitron, sans-serif"
            fontSize="14"
            fontWeight="700"
            fill="#FFFFFF"
            textAnchor="middle"
          >
            FT
          </text>
        </svg>
      </div>
      <FluxTradeLogo className="h-10" />
    </motion.div>
  );
}
