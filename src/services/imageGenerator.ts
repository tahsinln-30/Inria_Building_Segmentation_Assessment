import { PresetImage } from '../types';

export interface GeneratedImagePayload {
  rgbDataUrl: string;
  gtDataUrl: string | null;
  width: number;
  height: number;
  gtCanvas?: HTMLCanvasElement;
  rgbCanvas?: HTMLCanvasElement;
}

// Deterministic pseudo-random number generator for reproducible procedural aerial maps
function createPRNG(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

interface BuildingRect {
  x: number;
  y: number;
  w: number;
  h: number;
  angle: number;
  type: 'residential' | 'commercial' | 'terracotta' | 'industrial' | 'chalet';
  color: string;
  ridgeColor?: string;
  hasRidge?: boolean;
}

export function generateAerialPreset(preset: PresetImage): GeneratedImagePayload {
  const width = preset.width || 512;
  const height = preset.height || 512;
  const rand = createPRNG(preset.seed);

  // RGB canvas
  const rgbCanvas = document.createElement('canvas');
  rgbCanvas.width = width;
  rgbCanvas.height = height;
  const ctx = rgbCanvas.getContext('2d')!;

  // Ground Truth canvas
  const gtCanvas = document.createElement('canvas');
  gtCanvas.width = width;
  gtCanvas.height = height;
  const gtCtx = gtCanvas.getContext('2d')!;

  // 1. Base terrain background
  let baseColor1 = '#4a5d3f';
  let baseColor2 = '#3a4a32';
  let roadColor = '#474b4e';
  let markingColor = '#b8b8b8';

  if (preset.region === 'Vienna') {
    baseColor1 = '#525b44';
    baseColor2 = '#6a6858';
    roadColor = '#505052';
  } else if (preset.region === 'West Tyrol') {
    baseColor1 = '#385e38';
    baseColor2 = '#2e4a2e';
    roadColor = '#555555';
  } else if (preset.region === 'Chicago') {
    baseColor1 = '#3a4235';
    baseColor2 = '#424242';
    roadColor = '#383b40';
  } else if (preset.region === 'Kitsap County') {
    baseColor1 = '#283e28';
    baseColor2 = '#1f301f';
    roadColor = '#5c544d';
  }

  // Draw terrain
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, baseColor1);
  gradient.addColorStop(1, baseColor2);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Add terrain noise/texture
  for (let i = 0; i < 400; i++) {
    const x = rand() * width;
    const y = rand() * height;
    const r = rand() * 8 + 2;
    ctx.fillStyle = rand() > 0.5 ? 'rgba(70, 95, 55, 0.25)' : 'rgba(30, 45, 25, 0.25)';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // GT background is 0 (Non-building)
  gtCtx.fillStyle = '#000000';
  gtCtx.fillRect(0, 0, width, height);

  // 2. Draw Roads (Asphalt / Concrete)
  ctx.fillStyle = roadColor;
  ctx.lineWidth = preset.region === 'Chicago' ? 36 : 28;
  ctx.lineCap = 'round';

  // Grid or winding roads
  const roadLines: { x1: number; y1: number; x2: number; y2: number }[] = [];
  if (preset.region === 'Chicago' || preset.region === 'Austin') {
    // Grid roads
    roadLines.push({ x1: 0, y1: height * 0.48, x2: width, y2: height * 0.48 });
    roadLines.push({ x1: width * 0.52, y1: 0, x2: width * 0.52, y2: height });
  } else if (preset.region === 'Vienna') {
    roadLines.push({ x1: 0, y1: height * 0.35, x2: width * 0.6, y2: height * 0.42 });
    roadLines.push({ x1: width * 0.6, y1: height * 0.42, x2: width, y2: height * 0.75 });
    roadLines.push({ x1: width * 0.3, y1: 0, x2: width * 0.4, y2: height });
  } else {
    // West Tyrol / Kitsap curving road
    roadLines.push({ x1: 0, y1: height * 0.2, x2: width * 0.45, y2: height * 0.55 });
    roadLines.push({ x1: width * 0.45, y1: height * 0.55, x2: width, y2: height * 0.85 });
  }

  for (const road of roadLines) {
    // Sidewalk/shoulder
    ctx.strokeStyle = '#6e706e';
    ctx.lineWidth = 32;
    ctx.beginPath();
    ctx.moveTo(road.x1, road.y1);
    ctx.lineTo(road.x2, road.y2);
    ctx.stroke();

    // Asphalt
    ctx.strokeStyle = roadColor;
    ctx.lineWidth = 26;
    ctx.beginPath();
    ctx.moveTo(road.x1, road.y1);
    ctx.lineTo(road.x2, road.y2);
    ctx.stroke();

    // Center dash line
    ctx.strokeStyle = markingColor;
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(road.x1, road.y1);
    ctx.lineTo(road.x2, road.y2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // 3. Define Buildings based on region
  const buildings: BuildingRect[] = [];
  const numBuildings = preset.buildingDensity === 'High' ? 18 : preset.buildingDensity === 'Medium' ? 12 : 7;

  // Generate building candidates ensuring they don't block main road center completely
  for (let b = 0; b < numBuildings; b++) {
    let bw = 0;
    let bh = 0;
    let type: BuildingRect['type'] = 'residential';
    let color = '#a65b32'; // terracotta

    if (preset.region === 'Vienna') {
      bw = 45 + rand() * 45;
      bh = 35 + rand() * 40;
      type = 'terracotta';
      const rVal = Math.floor(180 + rand() * 40);
      const gVal = Math.floor(80 + rand() * 30);
      const bVal = Math.floor(60 + rand() * 25);
      color = `rgb(${rVal}, ${gVal}, ${bVal})`;
    } else if (preset.region === 'Chicago') {
      bw = 55 + rand() * 65;
      bh = 45 + rand() * 55;
      type = 'commercial';
      const grey = Math.floor(140 + rand() * 60);
      color = `rgb(${grey}, ${grey + 5}, ${grey - 5})`;
    } else if (preset.region === 'West Tyrol') {
      bw = 35 + rand() * 35;
      bh = 30 + rand() * 35;
      type = 'chalet';
      color = rand() > 0.4 ? '#8b4513' : '#a0522d';
    } else if (preset.region === 'Kitsap County') {
      bw = 30 + rand() * 30;
      bh = 25 + rand() * 30;
      type = 'residential';
      color = rand() > 0.5 ? '#5c677d' : '#8d99ae';
    } else {
      // Austin / San Francisco
      bw = 40 + rand() * 35;
      bh = 35 + rand() * 30;
      type = 'residential';
      const hue = Math.floor(rand() * 40 + 15);
      color = `hsl(${hue}, 45%, ${Math.floor(55 + rand() * 20)}%)`;
    }

    // Grid placement or cluster
    const col = b % 4;
    const row = Math.floor(b / 4);
    const baseX = (col + 0.5) * (width / 4) - bw / 2 + (rand() * 24 - 12);
    const baseY = (row + 0.5) * (height / Math.ceil(numBuildings / 4)) - bh / 2 + (rand() * 24 - 12);

    const x = Math.max(16, Math.min(width - bw - 16, baseX));
    const y = Math.max(16, Math.min(height - bh - 16, baseY));
    const angle = (rand() - 0.5) * 0.15; // slight orientation

    buildings.push({
      x,
      y,
      w: bw,
      h: bh,
      angle,
      type,
      color,
      hasRidge: type !== 'commercial',
      ridgeColor: '#f1f1f1'
    });
  }

  // 4. Draw Shadows first (sun from top-left, casting shadow bottom-right)
  const shadowOffsetX = 8;
  const shadowOffsetY = 10;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
  for (const b of buildings) {
    ctx.save();
    ctx.translate(b.x + b.w / 2 + shadowOffsetX, b.y + b.h / 2 + shadowOffsetY);
    ctx.rotate(b.angle);
    ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
    ctx.restore();
  }

  // 5. Draw Buildings onto RGB and Ground Truth
  for (const b of buildings) {
    // A) Ground Truth Mask (Strict white #FFFFFF = 255 for Building)
    gtCtx.save();
    gtCtx.fillStyle = '#FFFFFF';
    gtCtx.translate(b.x + b.w / 2, b.y + b.h / 2);
    gtCtx.rotate(b.angle);
    gtCtx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
    gtCtx.restore();

    // B) RGB Canvas
    ctx.save();
    ctx.translate(b.x + b.w / 2, b.y + b.h / 2);
    ctx.rotate(b.angle);

    // Roof base
    ctx.fillStyle = b.color;
    ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);

    // Roof texture / features
    if (b.type === 'commercial') {
      // Gravel flat roof with HVAC units
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.fillRect(-b.w / 2 + 3, -b.h / 2 + 3, b.w - 6, b.h - 6);

      // HVAC units
      ctx.fillStyle = '#dddddd';
      ctx.fillRect(-8, -6, 12, 10);
      ctx.fillStyle = '#444444';
      ctx.fillRect(-6, -4, 8, 6);
      ctx.fillStyle = '#999999';
      ctx.fillRect(8, 4, 10, 8);
    } else if (b.hasRidge) {
      // Sloped pitched roof with light side and shade side
      // Split roof down the middle
      ctx.fillStyle = 'rgba(255, 255, 255, 0.18)'; // Light side
      ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h / 2);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'; // Shadow side
      ctx.fillRect(-b.w / 2, 0, b.w, b.h / 2);

      // Ridge line
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-b.w / 2, 0);
      ctx.lineTo(b.w / 2, 0);
      ctx.stroke();
    }

    // Roof edge border
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.lineWidth = 1;
    ctx.strokeRect(-b.w / 2, -b.h / 2, b.w, b.h);

    ctx.restore();
  }

  // 6. Draw Trees, foliage, and vegetation (often occluding buildings or false positives)
  const treeCount = preset.region === 'Kitsap County' ? 65 : preset.region === 'Austin' ? 35 : 20;
  for (let t = 0; t < treeCount; t++) {
    const tx = rand() * width;
    const ty = rand() * height;
    const tr = rand() * 12 + 8;

    // Tree shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.arc(tx + 6, ty + 7, tr * 0.9, 0, Math.PI * 2);
    ctx.fill();

    // Tree foliage layers
    const foliageGradient = ctx.createRadialGradient(tx - tr * 0.3, ty - tr * 0.3, tr * 0.1, tx, ty, tr);
    if (preset.region === 'Kitsap County') {
      foliageGradient.addColorStop(0, '#3e6b3e');
      foliageGradient.addColorStop(0.7, '#1b3b1b');
      foliageGradient.addColorStop(1, '#0f240f');
    } else {
      foliageGradient.addColorStop(0, '#588b3b');
      foliageGradient.addColorStop(0.7, '#356320');
      foliageGradient.addColorStop(1, '#1e3d11');
    }

    ctx.fillStyle = foliageGradient;
    ctx.beginPath();
    ctx.arc(tx, ty, tr, 0, Math.PI * 2);
    ctx.fill();
  }

  // 7. Small parked cars on streets/driveways
  for (let c = 0; c < 8; c++) {
    const cx = rand() * width;
    const cy = rand() * height;
    // Check if on road roughly
    ctx.fillStyle = rand() > 0.5 ? '#ffffff' : '#c0392b';
    ctx.fillRect(cx, cy, 7, 4);
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(cx + 1, cy + 4, 7, 2);
  }

  const rgbDataUrl = rgbCanvas.toDataURL('image/png');
  const gtDataUrl = gtCanvas.toDataURL('image/png');

  return {
    rgbDataUrl,
    gtDataUrl,
    width,
    height,
    rgbCanvas,
    gtCanvas
  };
}
