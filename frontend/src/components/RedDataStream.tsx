
import React, { useEffect, useRef } from 'react';

const RedDataStream = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    const squareSize = 12;
    const columns = Math.ceil(canvas.width / squareSize);
    const drops: number[] = Array(columns).fill(0);
    const speeds: number[] = Array(columns).fill(0).map(() => 0.5 + Math.random() * 1.5);
    const opacities: number[] = Array(columns).fill(0).map(() => 0.1 + Math.random() * 0.5);

    // Color palette: deep red to white
    const colors = [
      '#450a0a', // Deepest Red
      '#7f1d1d',
      '#991b1b',
      '#b91c1c',
      '#dc2626', // Bright Red
      '#ef4444',
      '#fecaca', // Very Light Red
       '#ffffff'  // White
    ];

    const draw = () => {
      // Semi-transparent black to create a trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < drops.length; i++) {
        // Pick a color based on "depth" or just random
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        ctx.fillStyle = color;
        ctx.globalAlpha = opacities[i];
        
        const x = i * squareSize;
        const y = Math.floor(drops[i]) * squareSize;
        
        // Draw a square with a small gap
        ctx.fillRect(x + 1, y + 1, squareSize - 2, squareSize - 2);
        
        // Sometimes draw a "head" square that is brighter/white
        if (Math.random() > 0.98) {
          ctx.fillStyle = '#ffffff';
          ctx.globalAlpha = 0.8;
          ctx.fillRect(x + 1, y + 1, squareSize - 2, squareSize - 2);
        }

        drops[i] += speeds[i];

        if (y > canvas.height + 100 && Math.random() > 0.975) {
          drops[i] = -5;
          speeds[i] = 0.5 + Math.random() * 1.5;
        }
      }
      
      ctx.globalAlpha = 1.0; // Reset alpha
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none -z-20"
      style={{ 
        opacity: 0.25,
        filter: 'blur(0.4px) drop-shadow(0 0 2px rgba(220, 38, 38, 0.8))'
      }}
    />
  );
};

export default RedDataStream;
