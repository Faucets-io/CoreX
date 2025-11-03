
import { motion } from "framer-motion";

export default function CryptoJetIcon() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Particle trails */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#00FF80] rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [0.5, 1.5, 0.5],
              x: [0, -50, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Main rotating crypto jet */}
      <motion.div
        className="relative"
        animate={{
          rotateY: [0, 360],
          y: [-10, 10, -10],
        }}
        transition={{
          rotateY: {
            duration: 8,
            repeat: Infinity,
            ease: "linear",
          },
          y: {
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
      >
        <svg
          width="200"
          height="200"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_0_20px_rgba(0,255,128,0.6)]"
        >
          <defs>
            <linearGradient id="jetGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00FF80" />
              <stop offset="50%" stopColor="#00CCFF" />
              <stop offset="100%" stopColor="#00FF80" />
            </linearGradient>
            <filter id="jetGlow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Jet body - sleek futuristic design */}
          <motion.path
            d="M 100 40 L 140 80 L 135 100 L 140 120 L 100 160 L 60 120 L 65 100 L 60 80 Z"
            fill="url(#jetGradient)"
            filter="url(#jetGlow)"
            stroke="#00FF80"
            strokeWidth="2"
            animate={{
              fill: ["url(#jetGradient)", "rgba(0, 255, 128, 0.8)", "url(#jetGradient)"],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Wings */}
          <motion.path
            d="M 60 80 L 30 90 L 40 100 L 60 95 Z"
            fill="#00CCFF"
            filter="url(#jetGlow)"
            stroke="#00CCFF"
            strokeWidth="1.5"
            opacity="0.8"
          />
          <motion.path
            d="M 140 80 L 170 90 L 160 100 L 140 95 Z"
            fill="#00CCFF"
            filter="url(#jetGlow)"
            stroke="#00CCFF"
            strokeWidth="1.5"
            opacity="0.8"
          />

          {/* Cockpit window */}
          <motion.ellipse
            cx="100"
            cy="70"
            rx="15"
            ry="12"
            fill="#00CCFF"
            opacity="0.6"
            animate={{
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />

          {/* Engine thrusters */}
          <motion.circle
            cx="85"
            cy="150"
            r="8"
            fill="#00FF80"
            filter="url(#jetGlow)"
            animate={{
              r: [6, 10, 6],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
            }}
          />
          <motion.circle
            cx="115"
            cy="150"
            r="8"
            fill="#00FF80"
            filter="url(#jetGlow)"
            animate={{
              r: [6, 10, 6],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: 0.5,
            }}
          />

          {/* FluxTrade logo on body */}
          <text
            x="100"
            y="105"
            fontFamily="Orbitron, sans-serif"
            fontSize="14"
            fontWeight="700"
            fill="#FFFFFF"
            textAnchor="middle"
            opacity="0.9"
          >
            FT
          </text>

          {/* Speed lines */}
          <motion.line
            x1="100"
            y1="160"
            x2="100"
            y2="180"
            stroke="#00FF80"
            strokeWidth="2"
            opacity="0.6"
            animate={{
              y2: [180, 190, 180],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
            }}
          />
          <motion.line
            x1="85"
            y1="160"
            x2="80"
            y2="185"
            stroke="#00FF80"
            strokeWidth="1.5"
            opacity="0.5"
            animate={{
              y2: [185, 195, 185],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: 0.2,
            }}
          />
          <motion.line
            x1="115"
            y1="160"
            x2="120"
            y2="185"
            stroke="#00FF80"
            strokeWidth="1.5"
            opacity="0.5"
            animate={{
              y2: [185, 195, 185],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: 0.2,
            }}
          />
        </svg>

        {/* Energy ring around jet */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border-2 border-[#00FF80]/30"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
            rotate: [0, 360],
          }}
          transition={{
            scale: {
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            },
            opacity: {
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            },
            rotate: {
              duration: 10,
              repeat: Infinity,
              ease: "linear",
            },
          }}
        />
      </motion.div>

      {/* Orbiting crypto symbols */}
      {["₿", "Ξ", "$"].map((symbol, index) => {
        const angle = (index / 3) * 360;
        return (
          <motion.div
            key={symbol}
            className="absolute left-1/2 top-1/2 -ml-4 -mt-4"
            animate={{
              rotate: [angle, angle + 360],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear",
              delay: index * 0.5,
            }}
          >
            <motion.div
              className="text-2xl font-bold"
              style={{
                transform: `translateX(120px)`,
                color: "#00FF80",
                textShadow: "0 0 10px rgba(0, 255, 128, 0.8)",
              }}
              animate={{
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: index * 0.3,
              }}
            >
              {symbol}
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}
