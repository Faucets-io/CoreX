
import { motion } from "framer-motion";
import { Bitcoin, DollarSign } from "lucide-react";

const cryptoLogos = [
  { name: "BTC", color: "#F7931A", delay: 0 },
  { name: "ETH", color: "#627EEA", delay: 0.5 },
  { name: "USDT", color: "#26A17B", delay: 1 },
  { name: "BNB", color: "#F3BA2F", delay: 1.5 },
  { name: "XRP", color: "#23292F", delay: 2 },
  { name: "SOL", color: "#14F195", delay: 2.5 },
];

export default function CyberBotScene() {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Particle background */}
      <div className="absolute inset-0 opacity-30">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [0.5, 1.5, 0.5],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Central Cyber-bot */}
      <motion.div
        className="relative z-10"
        animate={{
          y: [-10, 10, -10],
          rotateY: [0, 10, 0, -10, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="relative w-48 h-48">
          {/* Bot head */}
          <motion.div
            className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#00FF80]/20 to-[#00CCFF]/20 border-2 border-[#00FF80] backdrop-blur-sm"
            style={{
              boxShadow: "0 0 40px rgba(0, 255, 128, 0.5), inset 0 0 20px rgba(0, 255, 128, 0.2)",
            }}
          >
            {/* Eyes */}
            <div className="absolute top-12 left-12 w-8 h-8 rounded-full bg-[#00FF80]"
              style={{ boxShadow: "0 0 20px #00FF80" }}
            />
            <div className="absolute top-12 right-12 w-8 h-8 rounded-full bg-[#00CCFF]"
              style={{ boxShadow: "0 0 20px #00CCFF" }}
            />
            
            {/* Mouth/visor */}
            <motion.div
              className="absolute bottom-12 left-1/2 -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-[#00FF80] to-[#00CCFF]"
              animate={{
                scaleX: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              style={{ boxShadow: "0 0 10px #00FF80" }}
            />
            
            {/* Circuit patterns */}
            <svg className="absolute inset-0 w-full h-full opacity-30">
              <path
                d="M 20 20 L 40 20 L 40 40 M 160 20 L 180 20 L 180 40 M 20 160 L 40 160 L 40 180 M 160 160 L 180 160 L 180 180"
                stroke="#00FF80"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          </motion.div>

          {/* Holographic data stream */}
          <motion.div
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-1 h-16 bg-gradient-to-b from-[#00FF80] to-transparent"
            animate={{
              opacity: [0.3, 1, 0.3],
              scaleY: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
            style={{ boxShadow: "0 0 10px #00FF80" }}
          />
        </div>
      </motion.div>

      {/* Orbiting crypto logos */}
      <div className="absolute inset-0">
        {cryptoLogos.map((crypto, index) => {
          const angle = (index / cryptoLogos.length) * 360;
          return (
            <motion.div
              key={crypto.name}
              className="absolute left-1/2 top-1/2"
              style={{
                marginLeft: "-24px",
                marginTop: "-24px",
              }}
              animate={{
                rotate: [angle, angle + 360],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear",
                delay: crypto.delay,
              }}
            >
              <motion.div
                className="relative"
                style={{
                  transform: `translateX(150px)`,
                }}
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: crypto.delay,
                }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-xs border-2"
                  style={{
                    backgroundColor: `${crypto.color}20`,
                    borderColor: crypto.color,
                    boxShadow: `0 0 20px ${crypto.color}50`,
                    color: crypto.color,
                  }}
                >
                  {crypto.name}
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
