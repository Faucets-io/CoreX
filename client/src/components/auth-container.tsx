
import { motion } from "framer-motion";
import { ReactNode } from "react";
import CyberBotScene from "./cyber-bot-scene";
import { NeonBackdrop } from "./neon-backdrop";

interface AuthContainerProps {
  children: ReactNode;
}

export default function AuthContainer({ children }: AuthContainerProps) {
  return (
    <div className="min-h-screen w-full bg-[#0A0A0A] relative overflow-hidden">
      {/* Animated background */}
      <NeonBackdrop />
      
      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">
        {/* Left side - 3D Animation */}
        <motion.div
          className="w-full lg:w-1/2 h-[40vh] lg:h-screen flex items-center justify-center p-8"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <CyberBotScene />
        </motion.div>

        {/* Right side - Form */}
        <motion.div
          className="w-full lg:w-1/2 min-h-[60vh] lg:h-screen flex items-center justify-center p-4 lg:p-8"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="w-full max-w-md">
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
