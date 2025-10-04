import { useEffect, useRef } from 'react';

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    const drawGrid = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const gridSize = 60;
      
      ctx.clearRect(0, 0, width, height);
      
      // Very subtle grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;

      // Draw vertical lines
      for (let x = 0; x <= width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Draw horizontal lines
      for (let y = 0; y <= height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Add subtle pulse dots at intersections
      const pulseIntensity = (Math.sin(time * 0.001) + 1) * 0.5;
      ctx.fillStyle = `rgba(0, 102, 255, ${0.1 * pulseIntensity})`;
      
      for (let x = 0; x <= width; x += gridSize * 3) {
        for (let y = 0; y <= height; y += gridSize * 3) {
          const offset = Math.sin(time * 0.002 + x * 0.01 + y * 0.01) * 2;
          ctx.beginPath();
          ctx.arc(x + offset, y + offset, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Add moving pulse lines
      const lineOpacity = (Math.sin(time * 0.0015) + 1) * 0.5 * 0.08;
      ctx.strokeStyle = `rgba(0, 102, 255, ${lineOpacity})`;
      ctx.lineWidth = 0.5;
      
      // Horizontal moving pulse
      const horizontalY = (time * 0.05) % (height + gridSize * 2) - gridSize;
      ctx.beginPath();
      ctx.moveTo(0, horizontalY);
      ctx.lineTo(width, horizontalY);
      ctx.stroke();

      // Vertical moving pulse
      const verticalX = (time * 0.03) % (width + gridSize * 2) - gridSize;
      ctx.beginPath();
      ctx.moveTo(verticalX, 0);
      ctx.lineTo(verticalX, height);
      ctx.stroke();
    };

    const animate = () => {
      time += 16; // Roughly 60fps
      drawGrid();
      animationId = requestAnimationFrame(animate);
    };

    resize();
    animate();

    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}