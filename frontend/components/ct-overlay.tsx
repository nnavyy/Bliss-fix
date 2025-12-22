"use client";

import { useEffect, useRef } from "react";

type Point = { x: number; y: number };

type Prediction = {
  class: string;
  confidence: number;
  points: Point[];
};

type CTOverlayProps = {
  imageSrc: string;
  predictions: Prediction[];
  opacity?: number;
};

export default function CTOverlay({
  imageSrc,
  predictions,
  opacity = 0.4,
}: CTOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = img.width;
    canvas.height = img.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    predictions.forEach((pred) => {
      let rgb = "34,197,94"; // normal

      if (pred.class.toLowerCase().includes("stone")) {
        rgb = "239,68,68"; // red
      } else if (pred.class.toLowerCase().includes("abnormal")) {
        rgb = "249,115,22"; // orange
      }

      const strokeColor = `rgb(${rgb})`;
      const fillColor = `rgba(${rgb}, ${opacity})`;

      ctx.beginPath();
      pred.points.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = fillColor;
      ctx.fill();

      const first = pred.points[0];
      ctx.fillStyle = strokeColor;
      ctx.font = "14px sans-serif";
      ctx.fillText(
        `${pred.class} (${Math.round(pred.confidence * 100)}%)`,
        first.x,
        first.y - 5
      );
    });
  }, [predictions, opacity]);

  return (
    <div className="relative inline-block">
      <img
        ref={imgRef}
        src={imageSrc}
        alt="CT Scan"
        className="rounded-lg"
      />
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 pointer-events-none"
      />
    </div>
  );
}
