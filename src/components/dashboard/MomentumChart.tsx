"use client";

import { useEffect, useRef } from "react";

export default function MomentumChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resizeCanvas() {
      const parent = canvas!.parentElement;
      if (!parent) return;
      canvas!.width = parent.offsetWidth;
      canvas!.height = parent.offsetHeight;
      drawChart();
    }

    function drawChart() {
      const w = canvas!.width;
      const h = canvas!.height;
      ctx!.clearRect(0, 0, w, h);

      const grad = ctx!.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, "#ff4d00");
      grad.addColorStop(1, "#ffbc00");

      ctx!.beginPath();
      ctx!.strokeStyle = grad;
      ctx!.lineWidth = 3;
      ctx!.shadowBlur = 15;
      ctx!.shadowColor = "rgba(255, 77, 0, 0.5)";

      const points = 40;
      const step = w / points;
      let x = 0;
      let y = h / 2;

      ctx!.moveTo(x, y);

      for (let i = 0; i <= points; i++) {
        const noise =
          Math.sin(i * 0.3) * (h / 4) + Math.sin(i * 0.7) * 15;
        const targetY = h / 2 + noise;

        const cp1x = x + step / 2;
        const cp1y = y;
        const cp2x = x + step / 2;
        const cp2y = targetY;

        ctx!.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x + step, targetY);

        x += step;
        y = targetY;
      }
      ctx!.stroke();

      ctx!.lineTo(w, h);
      ctx!.lineTo(0, h);
      ctx!.closePath();
      const fillGrad = ctx!.createLinearGradient(0, 0, 0, h);
      fillGrad.addColorStop(0, "rgba(255, 77, 0, 0.1)");
      fillGrad.addColorStop(1, "rgba(255, 77, 0, 0)");
      ctx!.fillStyle = fillGrad;
      ctx!.fill();
    }

    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(canvas.parentElement!);
    resizeCanvas();

    return () => resizeObserver.disconnect();
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full" />;
}
