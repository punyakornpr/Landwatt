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

    ctx.fillStyle = '#f5f5f7';
    ctx.fillRect(0, 0, width, height);

    // Subtle Architectural Drafting Grid
    ctx.strokeStyle = '#e8e8ed';
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
    ctx.strokeStyle = '#1d1d1f';
    ctx.lineWidth = 2;
    ctx.strokeRect(padX, padY, plotW, plotH);

    // 4 corner survey boundary marks
    const corners = [
      [padX, padY],
      [padX + plotW, padY],
      [padX + plotW, padY + plotH],
      [padX, padY + plotH]
    ];
    corners.forEach(([cx, cy]) => {
      ctx.fillStyle = '#1d1d1f';
      ctx.beginPath();
      ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // 1. Setback buffer (3–5 m per regulation)
    const setbackPx = 22;
    if (showSetback) {
      ctx.strokeStyle = '#ea580c';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(padX + setbackPx, padY + setbackPx, plotW - (setbackPx * 2), plotH - (setbackPx * 2));
      ctx.setLineDash([]);

      ctx.fillStyle = '#c2410c';
      ctx.font = '10px Prompt, sans-serif';
      ctx.fillText('Setback buffer 3.0 m', padX + setbackPx + 6, padY + setbackPx - 5);
    }

    // 2. Frontage Access Road
    ctx.fillStyle = '#aeaeb2';
    ctx.fillRect(padX - 10, padY + plotH + 8, plotW + 20, 20);
    ctx.fillStyle = '#48484a';
    ctx.font = '10px Prompt, sans-serif';
    ctx.fillText('Public access road', padX + 20, padY + plotH + 22);

    // Internal plot usable area
    const innerX = padX + setbackPx + 10;
    const innerY = padY + setbackPx + 10;
    const innerW = plotW - (setbackPx * 2) - 20;
    const innerH = plotH - (setbackPx * 2) - 20;

    // 3. Draw Equipment Layout based on Project
    if (project.id === 'solar-farm' || project.id === 'agrivoltaics' || project.id === 'floating-solar' || project.id === 'small-solar' || project.id === 'solar-utility-kit' || project.id === 'solar-dryer' || project.id === 'solar-lease') {
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

      ctx.fillStyle = '#3a3a3c';
      ctx.strokeStyle = '#2c2c2e';
      ctx.lineWidth = 1.5;
      ctx.fillRect(padPosX, padPosY, padWidth, padHeight);
      ctx.strokeRect(padPosX, padPosY, padWidth, padHeight);

      ctx.fillStyle = '#f5f5f7';
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.fillText('SUBSTATION', padPosX + 5, padPosY + 25);
      ctx.font = '8px Prompt, sans-serif';
      ctx.fillText('Transformer & RMU', padPosX + 5, padPosY + 45);

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
        ctx.fillText('22kV underground cable to PEA interconnection', padPosX - 150, padY + plotH + 5);
      }

    } else if (project.id === 'solar-coldroom') {
      // Insulated rooms + compressor yard
      for (let r = 0; r < (specs.coldRooms || 1); r++) {
        const rx = innerX + 30;
        const ry = innerY + 25 + r * 85;
        ctx.fillStyle = '#0369a1';
        ctx.strokeStyle = '#0c4a6e';
        ctx.lineWidth = 1.5;
        ctx.fillRect(rx, ry, 160, 70);
        ctx.strokeRect(rx, ry, 160, 70);
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px monospace';
        ctx.fillText(`COLD ROOM #${r + 1} (20 m3)`, rx + 10, ry + 38);
      }
      ctx.fillStyle = '#3a3a3c';
      ctx.fillRect(innerX + 220, innerY + 25, 120, 60);
      ctx.fillStyle = '#ffffff';
      ctx.font = '9px Prompt, sans-serif';
      ctx.fillText('Compressors +', innerX + 230, innerY + 48);
      ctx.fillText(`${specs.dcCapacityKWp || 10} kWp PV`, innerX + 230, innerY + 62);

    } else if (project.id === 'ev-charging-hub' || project.id === 'ev-moto-swap') {
      const canopyW = innerW * 0.75;
      const canopyH = innerH * 0.6;

      ctx.fillStyle = '#15803d';
      ctx.strokeStyle = '#16a34a';
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
      ctx.fillStyle = '#48484a';
      ctx.fillRect(innerX + canopyW + 30, innerY + 20, innerW - canopyW - 40, canopyH);
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px Prompt, sans-serif';
      ctx.fillText('Cafe / Rest', innerX + canopyW + 35, innerY + 55);
      ctx.fillText('area', innerX + canopyW + 35, innerY + 70);

      // BESS & Transformer
      ctx.fillStyle = '#3a3a3c';
      ctx.fillRect(innerX + 20, innerY + canopyH + 30, 100, 45);
      ctx.fillStyle = '#ffffff';
      ctx.font = '9px Prompt, sans-serif';
      ctx.fillText('BESS Container 500kWh', innerX + 25, innerY + canopyH + 50);
      ctx.fillText('& 1000kVA transformer', innerX + 25, innerY + canopyH + 65);

    } else if (project.id === 'grid-bess') {
      const containerW = 120;
      const containerH = 40;
      for (let c = 0; c < (specs.containerCount || 2); c++) {
        const cy = innerY + 30 + (c * (containerH + 25));
        ctx.fillStyle = '#3a3a3c';
        ctx.fillRect(innerX + 40, cy, containerW, containerH);
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px monospace';
        ctx.fillText(`BESS CONTAINER #${c + 1} (3.72 MWh)`, innerX + 50, cy + 24);
      }

      ctx.fillStyle = '#2c2c2e';
      ctx.fillRect(innerX + containerW + 70, innerY + 30, 120, 110);
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px Prompt, sans-serif';
      ctx.fillText('PCS INVERTER 2.0 MW', innerX + containerW + 75, innerY + 60);
      ctx.fillText('& MV SWITCHGEAR', innerX + containerW + 75, innerY + 80);
    } else if (project.id === 'solar-warehouse') {
      // Warehouse building with PV roof + truck apron
      const whW = innerW * 0.6;
      const whH = innerH * 0.55;
      ctx.fillStyle = '#0369a1';
      ctx.strokeStyle = '#0c4a6e';
      ctx.lineWidth = 1.5;
      ctx.fillRect(innerX + 20, innerY + 20, whW, whH);
      ctx.strokeRect(innerX + 20, innerY + 20, whW, whH);
      // PV rows on the roof
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1;
      for (let ry = innerY + 30; ry < innerY + 20 + whH - 8; ry += 14) {
        ctx.beginPath();
        ctx.moveTo(innerX + 28, ry);
        ctx.lineTo(innerX + 20 + whW - 8, ry);
        ctx.stroke();
      }
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px Prompt, sans-serif';
      ctx.fillText(`WAREHOUSE ${specs.warehouseM2 || '?'} m2`, innerX + 30, innerY + 38);
      ctx.fillText(`Roof PV ~${specs.roofSolarKWp || '?'} kWp`, innerX + 30, innerY + 52);
      // Dock doors
      ctx.fillStyle = '#f5f5f7';
      for (let d = 0; d < 4; d++) {
        ctx.fillRect(innerX + 24 + d * 34, innerY + 20 + whH - 10, 24, 10);
      }
      // Truck apron
      ctx.fillStyle = '#d6d6db';
      ctx.fillRect(innerX + 20, innerY + 30 + whH, whW, innerH - whH - 50);
      ctx.fillStyle = '#48484a';
      ctx.font = '9px Prompt, sans-serif';
      ctx.fillText('Truck apron / loading', innerX + 26, innerY + whH + 55);

    } else if (project.id === 'data-center-lease') {
      // Operator-built facility pad + substation + fiber route
      const dcW = innerW * 0.55;
      const dcH = innerH * 0.55;
      ctx.fillStyle = '#3a3a3c';
      ctx.strokeStyle = '#2c2c2e';
      ctx.lineWidth = 1.5;
      ctx.fillRect(innerX + 40, innerY + 25, dcW, dcH);
      ctx.strokeRect(innerX + 40, innerY + 25, dcW, dcH);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px Prompt, sans-serif';
      ctx.fillText('DATA CENTER', innerX + 50, innerY + 45);
      ctx.font = '9px Prompt, sans-serif';
      ctx.fillText('Operator-built facility', innerX + 50, innerY + 60);
      // Server hall bays
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      for (let bx = innerX + 50; bx < innerX + 40 + dcW - 15; bx += 22) {
        ctx.strokeRect(bx, innerY + 70, 18, dcH - 55);
      }
      // Substation pad
      ctx.fillStyle = '#7c2d12';
      ctx.fillRect(innerX + 50 + dcW, innerY + 25, 90, 70);
      ctx.fillStyle = '#ffffff';
      ctx.font = '9px Prompt, sans-serif';
      ctx.fillText('Substation pad', innerX + 55 + dcW, innerY + 55);
      // Fiber route (dashed line to road)
      ctx.strokeStyle = '#0ea5e9';
      ctx.lineWidth = 1.8;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(innerX + 40 + dcW / 2, innerY + 25 + dcH);
      ctx.lineTo(innerX + 40 + dcW / 2, padY + plotH + 8);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#0369a1';
      ctx.font = '9px Prompt, sans-serif';
      ctx.fillText('Fiber route to corridor', innerX + 40 + dcW / 2 - 55, padY + plotH + 5);

    } else if (project.id === 'carbon-forest') {
      // Tree rows + small solar pump corner
      ctx.fillStyle = '#15803d';
      for (let ty = innerY + 30; ty < innerY + innerH - 40; ty += 34) {
        for (let tx = innerX + 30; tx < innerX + innerW - 40; tx += 34) {
          ctx.beginPath();
          ctx.arc(tx, ty, 11, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.fillStyle = '#166534';
      ctx.font = '10px Prompt, sans-serif';
      ctx.fillText(`~${specs.treeCount || '?'} trees, 200/rai`, innerX + 30, innerY + innerH - 12);
      // Solar pump corner
      ctx.fillStyle = '#0369a1';
      ctx.fillRect(innerX + innerW - 95, innerY + 20, 70, 45);
      ctx.fillStyle = '#ffffff';
      ctx.font = '8px Prompt, sans-serif';
      ctx.fillText('Solar pump', innerX + innerW - 88, innerY + 38);
      ctx.fillText('~1.9 kWp', innerX + innerW - 88, innerY + 52);

    } else {
      ctx.fillStyle = '#7c2d12';
      ctx.beginPath();
      ctx.arc(innerX + 120, innerY + 100, 60, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px Prompt, sans-serif';
      ctx.fillText('CSTR digester', innerX + 85, innerY + 95);
      ctx.fillText('Digester Tank', innerX + 90, innerY + 110);

      ctx.fillStyle = '#3a3a3c';
      ctx.fillRect(innerX + 220, innerY + 40, 110, 80);
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px Prompt, sans-serif';
      ctx.fillText('Powerhouse', innerX + 230, innerY + 70);
      ctx.fillText('Gas Engine Gen', innerX + 230, innerY + 85);
    }

    // 4. Dimensions Annotation
    if (showDimensions) {
      ctx.fillStyle = '#48484a';
      ctx.font = '10px Inter, monospace';

      ctx.fillText(`Width ≈ ${widthMeters} m`, padX + (plotW / 2) - 40, padY - 12);
      ctx.save();
      ctx.translate(padX + plotW + 18, padY + (plotH / 2) + 20);
      ctx.rotate(Math.PI / 2);
      ctx.fillText(`Length ≈ ${lengthMeters} m`, 0, 0);
      ctx.restore();
    }

    // 5. Compass Rose (North Arrow)
    const compassX = padX + plotW - 35;
    const compassY = padY + 35;
    ctx.strokeStyle = '#dc2626';
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(compassX, compassY - 18);
    ctx.lineTo(compassX - 6, compassY + 6);
    ctx.lineTo(compassX, compassY);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#86868b';
    ctx.beginPath();
    ctx.moveTo(compassX, compassY - 18);
    ctx.lineTo(compassX + 6, compassY + 6);
    ctx.lineTo(compassX, compassY);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.fillText('N', compassX - 4, compassY - 22);

  }, [project, specs, landData, showSetback, showCables, showDimensions]);

  return (
    <div className="bg-white border border-mute-200 rounded-xl p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-mute-100 gap-2">
        <div>
          <h3 className="text-base font-bold text-mute-900">
            Simulated 2D site layout & setback
          </h3>
          <p className="text-xs text-mute-500 mt-0.5">
            Panel orientation (15° tilt facing south), transformer station and legal setbacks
          </p>
        </div>

        {/* Display Controls */}
        <div className="flex items-center space-x-1.5 text-xs">
          <button
            onClick={() => setShowSetback(!showSetback)}
            className={`px-2.5 py-1 rounded-md border text-xs transition ${
              showSetback ? 'bg-mute-900 text-white border-mute-900' : 'bg-mute-100 text-mute-600 border-mute-200'
            }`}
          >
            Setback 3m
          </button>
          <button
            onClick={() => setShowCables(!showCables)}
            className={`px-2.5 py-1 rounded-md border text-xs transition ${
              showCables ? 'bg-mute-900 text-white border-mute-900' : 'bg-mute-100 text-mute-600 border-mute-200'
            }`}
          >
            22kV cable
          </button>
          <button
            onClick={() => setShowDimensions(!showDimensions)}
            className={`px-2.5 py-1 rounded-md border text-xs transition ${
              showDimensions ? 'bg-mute-900 text-white border-mute-900' : 'bg-mute-100 text-mute-600 border-mute-200'
            }`}
          >
            Dimensions (m)
          </button>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="w-full flex justify-center bg-mute-50 rounded-lg p-2 border border-mute-200 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={720}
          height={380}
          className="max-w-full h-auto rounded border border-mute-200 shadow-sm"
        />
      </div>

      {/* Legend & Layout Notes */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-mute-500 px-1 pt-1">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1.5">
            <span className="w-3 h-3 bg-electric-700 rounded-sm" />
            <span>PV rows (15° tilt, south-facing)</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-3 h-3 bg-mute-700 rounded-sm" />
            <span>Transformer & switchgear</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-3 h-0.5 border-t border-dashed border-volt-600" />
            <span>3.0 m legal setback line</span>
          </span>
        </div>
        <div className="text-[11px] font-mono text-mute-400">
          Approx. scale 1:{(lengthMeters / 12).toFixed(0)} (north oriented)
        </div>
      </div>

    </div>
  );
}
