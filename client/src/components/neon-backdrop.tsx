
import { motion } from "framer-motion";

export function NeonBackdrop() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden neon-bg">
      {/* Gradient blur orbs for depth */}
      <div 
        className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{
          background: 'radial-gradient(circle, hsl(150 100% 60%) 0%, hsl(150 100% 40%) 50%, transparent 70%)',
        }}
      />
      <div 
        className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-15 blur-3xl"
        style={{
          background: 'radial-gradient(circle, hsl(150 100% 50%) 0%, hsl(150 100% 35%) 50%, transparent 70%)',
        }}
      />
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl animate-pulse-slow"
        style={{
          background: 'radial-gradient(circle, hsl(150 100% 55%) 0%, transparent 70%)',
        }}
      />
    </div>
  );
}
