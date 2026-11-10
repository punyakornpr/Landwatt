import React, { useRef, useEffect, useState } from 'react';
import { Compass, Eye, Maximize2, Shield, Layers, HelpCircle } from 'lucide-react';

export default function SiteLayoutCanvas({ project, specs, landData }) {
  const canvasRef = useRef(null);
  const [showSetback, setShowSetback] = useState(true);
  const [showCables, setShowCables] = useState(true);
  const [showDimensions, setShowDimensions] = useState(true);

  const areaSqM = landData.areaSqM || 8000;
  const widthMeters = Math.round(Math.sqrt(areaSqM / 1.4));
  const lengthMeters = Math.round(widthMeters * 1.4);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear background: Clean architectural blueprint surface
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, height);

    // Subtle Architectural Drafting Grid
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    const gridSize = 25;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Land Boundary Box
    const padX = 60;
    const padY = 50;
    const plotW = width - (padX * 2);
    const plotH = height - (padY * 2);

    // Plot Surface Tone
    ctx.fillStyle = landData.landType === 'pond' 
      ? 'rgba(14, 165, 233, 0.08)' 
      : 'rgba(241, 245, 249, 0.8)';
    ctx.fillRect(padX, padY, plotW, plotH);

    // Plot Perimeter Boundary
    ctx.strokeStyle = '#18181b';
    ctx.lineWidth = 2;
    ctx.strokeRect(padX, padY, plotW, plotH);

    // 4 Corner Survey Boundary Marks (หมุดที่ดิน)
    const corners = [
      [padX, padY],
      [padX + plotW, padY],
      [padX + plotW, padY + plotH],
      [padX, padY + plotH]
    ];
    corners.forEach(([cx, cy]) => {
      ctx.fillStyle = '#18181b';
      ctx.beginPath();
      ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // 1. Draw Setback Buffer (ระยะร่น 3-5m ตามกฎหมาย)
    const setbackPx = 22;
    if (showSetback) {
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(padX + setbackPx, padY + setbackPx, plotW - (setbackPx * 2), plotH - (setbackPx * 2));
      ctx.setLineDash([]);

      ctx.fillStyle = '#b45309';
      ctx.font = '10px Prompt, sans-serif';
      ctx.fillText('ระยะร่น Setback Buffer 3.0 m', padX + setbackPx + 6, padY + setbackPx - 5);
    }

    // 2. Frontage Access Road
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(padX - 10, padY + plotH + 8, plotW + 20, 20);
    ctx.fillStyle = '#475569';
    ctx.font = '10px Prompt, sans-serif';
    ctx.fillText('แนวถนนทางหลวง / ทางสาธารณะ (Access Road)', padX + 20, padY + plotH + 22);

    // Internal plot usable area
    const innerX = padX + setbackPx + 10;
    const innerY = padY + setbackPx + 10;
    const innerW = plotW - (setbackPx * 2) - 20;
    const innerH = plotH - (setbackPx * 2) - 20;

    // 3. Draw Equipment Layout based on Project
    if (project.id === 'solar-farm' || project.id === 'agrivoltaics' || project.id === 'floating-solar') {
      const rowCount = 7;
      const rowHeight = 16;
      const rowSpacing = (innerH - 60) / rowCount;

      for (let i = 0; i < rowCount; i++) {
        const ry = innerY + (i * rowSpacing) + 15;
        ctx.fillStyle = project.id === 'floating-solar' ? '#0284c7' : '#0369a1';
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 1;

        const stringW = innerW - 80;
        ctx.fillRect(innerX, ry, stringW, rowHeight);
        ctx.strokeRect(innerX, ry, stringW, rowHeight);

        // Substring cell dividers
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        for (let cx = innerX + 15; cx < innerX + stringW; cx += 18) {
          ctx.beginPath();
          ctx.moveTo(cx, ry);
          ctx.lineTo(cx, ry + rowHeight);
          ctx.stroke();
        }
      }

      // Substation / Transformer Switchyard
      const padWidth = 60;
      const padHeight = 80;
      const padPosX = innerX + innerW - padWidth;
      const padPosY = innerY + (innerH / 2) - (padHeight / 2);

      ctx.fillStyle = '#334155';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.5;
      ctx.fillRect(padPosX, padPosY, padWidth, padHeight);
      ctx.strokeRect(padPosX, padPosY, padWidth, padHeight);

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.fillText('SUBSTATION', padPosX + 5, padPosY + 25);
      ctx.font = '8px Prompt, sans-serif';
      ctx.fillText('หม้อแปลง & RMU', padPosX + 5, padPosY + 45);

      // Underground Cable Trench
      if (showCables) {
        ctx.strokeStyle = '#16a34a';
        ctx.lineWidth = 1.8;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(padPosX + (padWidth / 2), padPosY + padHeight);
        ctx.lineTo(padPosX + (padWidth / 2), padY + plotH + 8);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#15803d';
        ctx.font = '9px Prompt, sans-serif';
        ctx.fillText('แนวสายเคเบิลใต้ดิน 22kV ไปยังจุดเชื่อมต่อ กฟภ.', padPosX - 150, padY + plotH + 5);
      }

    } else if (project.id === 'ev-charging-hub') {
      const canopyW = innerW * 0.75;
      const canopyH = innerH * 0.6;

      ctx.fillStyle = '#0f766e';
      ctx.strokeStyle = '#0d9488';
      ctx.lineWidth = 1.5;
      ctx.fillRect(innerX + 20, innerY + 20, canopyW, canopyH);
      ctx.strokeRect(innerX + 20, innerY + 20, canopyW, canopyH);

      const bayW = 35;
      const bays = Math.min(8, Math.floor(canopyW / bayW));
      for (let b = 0; b < bays; b++) {
        const bx = innerX + 25 + (b * bayW);
        ctx.strokeStyle = '#ffffff';
        ctx.strokeRect(bx, innerY + 30, bayW - 6, 45);
        ctx.fillStyle = '#ffffff';
        ctx.font = '8px monospace';
        ctx.fillText(`EV-${b + 1}`, bx + 5, innerY + 55);
      }

      // Convenience / Cafe Pad
      ctx.fillStyle = '#475569';
      ctx.fillRect(innerX + canopyW + 30, innerY + 20, innerW - canopyW - 40, canopyH);
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px Prompt, sans-serif';
      ctx.fillText('ร้านกาแฟ / Cafe', innerX + canopyW + 35, innerY + 55);
      ctx.fillText('& จุดพักผ่อน', innerX + canopyW + 35, innerY + 70);

      // BESS & Transformer
      ctx.fillStyle = '#334155';
      ctx.fillRect(innerX + 20, innerY + canopyH + 30, 100, 45);
      ctx.fillStyle = '#ffffff';
      ctx.font = '9px Prompt, sans-serif';
      ctx.fillText('BESS Container 500kWh', innerX + 25, innerY + canopyH + 50);
      ctx.fillText('& หม้อแปลง 1000kVA', innerX + 25, innerY + canopyH + 65);

    } else if (project.id === 'grid-bess') {
      const containerW = 120;
      const containerH = 40;
      for (let c = 0; c < (specs.containerCount || 2); c++) {
        const cy = innerY + 30 + (c * (containerH + 25));
        ctx.fillStyle = '#334155';
        ctx.fillRect(innerX + 40, cy, containerW, containerH);
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px monospace';
        ctx.fillText(`BESS CONTAINER #${c + 1} (3.72 MWh)`, innerX + 50, cy + 24);
      }

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(innerX + containerW + 70, innerY + 30, 120, 110);
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px Prompt, sans-serif';
      ctx.fillText('PCS INVERTER 2.0 MW', innerX + containerW + 75, innerY + 60);
      ctx.fillText('& MV SWITCHGEAR', innerX + containerW + 75, innerY + 80);
    } else {
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.arc(innerX + 120, innerY + 100, 60, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px Prompt, sans-serif';
      ctx.fillText('บ่อหมักก๊าซ CSTR', innerX + 85, innerY + 95);
      ctx.fillText('Digester Tank', innerX + 90, innerY + 110);

      ctx.fillStyle = '#334155';
      ctx.fillRect(innerX + 220, innerY + 40, 110, 80);
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px Prompt, sans-serif';
      ctx.fillText('โรงกำเนิดไฟฟ้า', innerX + 230, innerY + 70);
      ctx.fillText('Gas Engine Gen', innerX + 230, innerY + 85);
    }

    // 4. Dimensions Annotation
    if (showDimensions) {
      ctx.fillStyle = '#475569';
      ctx.font = '10px Inter, monospace';

      ctx.fillText(`ความกว้างแปลง ≈ ${widthMeters} m`, padX + (plotW / 2) - 40, padY - 12);
      ctx.save();
      ctx.translate(padX + plotW + 18, padY + (plotH / 2) + 20);
      ctx.rotate(Math.PI / 2);
      ctx.fillText(`ความยาวแปลง ≈ ${lengthMeters} m`, 0, 0);
      ctx.restore();
    }

    // 5. Compass Rose (North Arrow)
    const compassX = padX + plotW - 35;
    const compassY = padY + 35;
    ctx.strokeStyle = '#ef4444';
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(compassX, compassY - 18);
    ctx.lineTo(compassX - 6, compassY + 6);
    ctx.lineTo(compassX, compassY);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.moveTo(compassX, compassY - 18);
    ctx.lineTo(compassX + 6, compassY + 6);
    ctx.lineTo(compassX, compassY);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.fillText('N', compassX - 4, compassY - 22);

  }, [project, specs, landData, showSetback, showCables, showDimensions]);

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-zinc-100 gap-2">
        <div>
          <h3 className="text-base font-bold text-zinc-900">
            ผังจัดวางพื้นที่จำลอง (2D Site Layout & Setback)
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            การจัดวางทิศทางแผงรับแสงอาทิตย์ (Tilt 15° South) อาคารหม้อแปลง และระยะร่นตามกฎหมาย
          </p>
        </div>

        {/* Display Controls */}
        <div className="flex items-center space-x-1.5 text-xs">
          <button
            onClick={() => setShowSetback(!showSetback)}
            className={`px-2.5 py-1 rounded-md border text-xs transition ${
              showSetback ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-zinc-100 text-zinc-600 border-zinc-200'
            }`}
          >
            ระยะร่น 3m
          </button>
          <button
            onClick={() => setShowCables(!showCables)}
            className={`px-2.5 py-1 rounded-md border text-xs transition ${
              showCables ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-zinc-100 text-zinc-600 border-zinc-200'
            }`}
          >
            สายเคเบิล 22kV
          </button>
          <button
            onClick={() => setShowDimensions(!showDimensions)}
            className={`px-2.5 py-1 rounded-md border text-xs transition ${
              showDimensions ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-zinc-100 text-zinc-600 border-zinc-200'
            }`}
          >
            มิติขนาด (m)
          </button>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="w-full flex justify-center bg-zinc-50 rounded-lg p-2 border border-zinc-200 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={720}
          height={380}
          className="max-w-full h-auto rounded border border-zinc-200 shadow-sm"
        />
      </div>

      {/* Legend & Layout Notes */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500 px-1 pt-1">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1.5">
            <span className="w-3 h-3 bg-sky-700 rounded-sm" />
            <span>แถวแผง PV (Tilt 15° หันใต้)</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-3 h-3 bg-slate-700 rounded-sm" />
            <span>สถานีหม้อแปลง & สวิตช์เกียร์</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-3 h-0.5 border-t border-dashed border-amber-600" />
            <span>แนวระยะร่นกฎหมาย 3.0 m</span>
          </span>
        </div>
        <div className="text-[11px] font-mono text-zinc-400">
          มาตราส่วนจำลอง 1:{(lengthMeters / 12).toFixed(0)} (North Oriented)
        </div>
      </div>

    </div>
  );
}
