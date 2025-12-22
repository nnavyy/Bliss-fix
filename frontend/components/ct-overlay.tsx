"use client";

import { useEffect, useRef, useState } from "react";

type Prediction = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  confidence?: number;
  class?: string;
  points?: { x: number; y: number }[];
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
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });

  // ===============================
  // GET NATURAL IMAGE SIZE
  // ===============================
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const handleLoad = () => {
      setImgSize({
        w: img.naturalWidth,
        h: img.naturalHeight,
      });
    };

    if (img.complete && img.naturalWidth) {
      handleLoad();
    } else {
      img.onload = handleLoad;
    }
  }, [imageSrc]);

  // ===============================
  // DRAW OVERLAY (SCALE + OFFSET)
  // ===============================
  useEffect(() => {
    const container = containerRef.current;
    const img = imgRef.current;
    const canvas = canvasRef.current;

    if (!container || !img || !canvas || !imgSize.w) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cw = container.clientWidth;
    const ch = container.clientHeight;

    canvas.width = cw;
    canvas.height = ch;

    ctx.clearRect(0, 0, cw, ch);
    ctx.globalAlpha = opacity;

    // === STYLE ===
    ctx.strokeStyle = "#ff0000";
    ctx.fillStyle = "#ff0000";
    ctx.lineWidth = 4; // 🔥 LEBIH TEBAL
    ctx.font = "bold 13px Arial";
    ctx.textBaseline = "top";

    const scaleX = img.clientWidth / imgSize.w;
    const scaleY = img.clientHeight / imgSize.h;

    const offsetX = (cw - img.clientWidth) / 2;
    const offsetY = (ch - img.clientHeight) / 2;

    predictions.forEach((p) => {
      // ===== SEGMENTATION (POINTS) =====
      if (Array.isArray(p.points) && p.points.length > 2) {
        ctx.beginPath();
        p.points.forEach((pt, i) => {
          const x = offsetX + pt.x * scaleX;
          const y = offsetY + pt.y * scaleY;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.stroke();
        return;
      }

      // ===== BOUNDING BOX =====
      if (
        typeof p.x === "number" &&
        typeof p.y === "number" &&
        typeof p.width === "number" &&
        typeof p.height === "number"
      ) {
        const x = offsetX + (p.x - p.width / 2) * scaleX;
        const y = offsetY + (p.y - p.height / 2) * scaleY;
        const w = p.width * scaleX;
        const h = p.height * scaleY;

        // BOX
        ctx.strokeRect(x, y, w, h);

        // ===== LABEL =====
        const label = `${p.class ?? "object"} ${
          p.confidence ? `${Math.round(p.confidence * 100)}%` : ""
        }`.trim();

        const padding = 4;
        const textWidth = ctx.measureText(label).width;
        const textHeight = 16;

        // background label
        ctx.fillStyle = "rgba(255,0,0,0.85)";
        ctx.fillRect(
          x,
          y - textHeight - padding,
          textWidth + padding * 2,
          textHeight
        );

        // text
        ctx.fillStyle = "#ffffff";
        ctx.fillText(label, x + padding, y - textHeight - padding + 2);

        // reset color
        ctx.fillStyle = "#ff0000";
      }
    });
  }, [predictions, imgSize, opacity]);

  return (
    <div
      ref={containerRef}
      className="relative w-full flex justify-center items-center"
    >
      <img
        ref={imgRef}
        src={imageSrc}
        alt="CT Scan"
        className="max-h-[60vh] w-auto object-contain block"
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
      />
    </div>
  );
}
