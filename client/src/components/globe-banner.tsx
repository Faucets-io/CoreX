
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface GlobeBannerProps {
  title?: string;
  subtitle?: string;
}

export default function GlobeBanner({ 
  title = "FluxTrade", 
  subtitle = "Global Trading Platform" 
}: GlobeBannerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Globe parameters
    const centerX = canvas.offsetWidth / 2;
    const centerY = canvas.offsetHeight / 2;
    const radius = Math.min(canvas.offsetWidth, canvas.offsetHeight) * 0.35;
    let rotation = 0;

    // Create dots for globe
    const dots: { x: number; y: number; z: number; originalZ: number }[] = [];
    const numDots = 800;
    
    for (let i = 0; i < numDots; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      dots.push({
        x: Math.sin(phi) * Math.cos(theta),
        y: Math.sin(phi) * Math.sin(theta),
        z: Math.cos(phi),
        originalZ: Math.cos(phi)
      });
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      
      rotation += 0.003;

      // Draw dots
      dots.forEach(dot => {
        // Rotate around Y axis
        const rotatedX = dot.x * Math.cos(rotation) - dot.z * Math.sin(rotation);
        const rotatedZ = dot.x * Math.sin(rotation) + dot.z * Math.cos(rotation);
        
        // Only draw dots on the visible hemisphere
        if (rotatedZ > -0.3) {
          const scale = (rotatedZ + 1) / 2;
          const projectedX = centerX + rotatedX * radius;
          const projectedY = centerY + dot.y * radius;
          
          // Color gradient based on depth
          const depth = (rotatedZ + 1) / 2;
          const greenIntensity = Math.floor(128 + depth * 127);
          const blueIntensity = Math.floor(204 * depth);
          
          ctx.fillStyle = `rgba(0, ${greenIntensity}, ${blueIntensity}, ${0.4 + depth * 0.6})`;
          ctx.beginPath();
          ctx.arc(projectedX, projectedY, 1.5 * scale, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Draw connection lines between nearby dots
      for (let i = 0; i < dots.length; i++) {
        const dot1 = dots[i];
        const rotatedX1 = dot1.x * Math.cos(rotation) - dot1.z * Math.sin(rotation);
        const rotatedZ1 = dot1.x * Math.sin(rotation) + dot1.z * Math.cos(rotation);
        
        if (rotatedZ1 > -0.3) {
          for (let j = i + 1; j < dots.length; j++) {
            const dot2 = dots[j];
            const distance = Math.sqrt(
              Math.pow(dot1.x - dot2.x, 2) +
              Math.pow(dot1.y - dot2.y, 2) +
              Math.pow(dot1.z - dot2.z, 2)
            );
            
            if (distance < 0.4) {
              const rotatedX2 = dot2.x * Math.cos(rotation) - dot2.z * Math.sin(rotation);
              const rotatedZ2 = dot2.x * Math.sin(rotation) + dot2.z * Math.cos(rotation);
              
              if (rotatedZ2 > -0.3) {
                const avgDepth = ((rotatedZ1 + rotatedZ2) / 2 + 1) / 2;
                
                ctx.strokeStyle = `rgba(0, 255, 128, ${0.1 * avgDepth})`;
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(centerX + rotatedX1 * radius, centerY + dot1.y * radius);
                ctx.lineTo(centerX + rotatedX2 * radius, centerY + dot2.y * radius);
                ctx.stroke();
              }
            }
          }
        }
      }

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <div className="relative w-full h-64 overflow-hidden rounded-xl bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A]">
      {/* Globe Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-[#00FF80] to-[#00CCFF] bg-clip-text text-transparent"
          style={{
            textShadow: '0 0 40px rgba(0, 255, 128, 0.5)',
          }}
        >
          {title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-gray-300 font-light"
        >
          {subtitle}
        </motion.p>
      </div>

      {/* Animated Border */}
      <div className="absolute inset-0 rounded-xl">
        <div className="absolute inset-0 rounded-xl border-2 border-transparent bg-gradient-to-r from-[#00FF80] via-[#00CCFF] to-[#00FF80] bg-clip-border opacity-30 animate-pulse" />
      </div>
    </div>
  );
}
