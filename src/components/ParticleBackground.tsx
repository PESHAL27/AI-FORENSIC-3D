import React, { useEffect, useRef } from 'react';

export const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Floating background particles
    const particleCount = 80;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.8,
      speedX: (Math.random() - 0.5) * 0.35,
      speedY: (Math.random() - 0.5) * 0.35,
      alpha: Math.random() * 0.5 + 0.2,
      pulseSpeed: Math.random() * 0.02 + 0.01,
    }));

    // Lower wave particles
    const cols = 55;
    const rows = 25;
    let time = 0;

    const render = () => {
      time += 0.018;
      ctx.clearRect(0, 0, width, height);

      // 1. Draw subtle background particles
      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const currentAlpha = p.alpha + Math.sin(time * p.pulseSpeed * 60) * 0.15;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 240, 255, ${Math.max(0.1, currentAlpha)})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#00f0ff';
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // 2. Draw undulating cyber-terrain particle wave across lower half
      const startY = height * 0.62;
      const xSpacing = width / (cols - 1);
      const zSpacing = (height * 0.4) / rows;

      for (let r = 0; r < rows; r++) {
        ctx.beginPath();
        const rowFactor = r / rows;
        const rowAlpha = (1 - rowFactor) * 0.28 + 0.05;

        for (let c = 0; c < cols; c++) {
          const x = c * xSpacing;
          // Compound sine waves for realistic holographic wave
          const wave1 = Math.sin(c * 0.18 + time * 1.2 + r * 0.25) * 22;
          const wave2 = Math.cos(c * 0.1 + time * 0.8 - r * 0.3) * 16;
          const y = startY + r * zSpacing + wave1 + wave2;

          if (c === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }

          // Draw small particle dots on wave vertices
          if (c % 2 === 0 && r % 2 === 0) {
            ctx.fillStyle = `rgba(0, 240, 255, ${rowAlpha * 1.5})`;
            ctx.fillRect(x - 1, y - 1, 2, 2);
          }
        }

        ctx.strokeStyle = `rgba(0, 210, 255, ${rowAlpha * 0.35})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.9,
      }}
    />
  );
};
