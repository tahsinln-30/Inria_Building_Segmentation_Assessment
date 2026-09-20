import React, { useState, useRef, useEffect } from 'react';
import { 
  Eye, 
  Split, 
  Layers, 
  AlertOctagon, 
  Grid3X3, 
  Download, 
  Crosshair,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Target,
  Sparkles
} from 'lucide-react';
import { SegmentationResult, ViewMode } from '../types';

interface ViewerComparisonProps {
  result: SegmentationResult | null;
  patchSize: number;
  isLoading: boolean;
  activeViewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
}

export const ViewerComparison: React.FC<ViewerComparisonProps> = ({
  result,
  isLoading,
  activeViewMode,
  onViewModeChange
}) => {
  const [internalViewMode, setInternalViewMode] = useState<ViewMode>('building_vs_not_building');
  const viewMode = activeViewMode ?? internalViewMode;

  const setViewMode = (mode: ViewMode) => {
    if (onViewModeChange) {
      onViewModeChange(mode);
    } else {
      setInternalViewMode(mode);
    }
  };

  const [sliderPosition, setSliderPosition] = useState(50);
  const [overlayOpacity, setOverlayOpacity] = useState(0.65);
  const [showProbabilityHeatmap, setShowProbabilityHeatmap] = useState(false);
  const [showOutlinesOnly, setShowOutlinesOnly] = useState(false);
  
  // Real pixel mask buffer for 100% accurate Interactive Pixel Inspector
  const predBufferRef = useRef<Uint8Array | null>(null);
  const gtBufferRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    if (!result) return;
    
    // Sample prediction mask into 512x512 byte array
    const pImg = new Image();
    pImg.crossOrigin = 'anonymous';
    pImg.onload = () => {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 512;
      const ctx = c.getContext('2d');
      if (ctx) {
        ctx.drawImage(pImg, 0, 0, 512, 512);
        const imgData = ctx.getImageData(0, 0, 512, 512).data;
        const mask = new Uint8Array(512 * 512);
        for (let i = 0; i < 512 * 512; i++) {
          mask[i] = imgData[i * 4] > 120 ? 1 : 0;
        }
        predBufferRef.current = mask;
      }
    };
    pImg.src = result.predictionMaskDataUrl;

    // Sample ground truth mask if available
    if (result.groundTruthMaskDataUrl) {
      const gImg = new Image();
      gImg.crossOrigin = 'anonymous';
      gImg.onload = () => {
        const c = document.createElement('canvas');
        c.width = 512;
        c.height = 512;
        const ctx = c.getContext('2d');
        if (ctx) {
          ctx.drawImage(gImg, 0, 0, 512, 512);
          const imgData = ctx.getImageData(0, 0, 512, 512).data;
          const mask = new Uint8Array(512 * 512);
          for (let i = 0; i < 512 * 512; i++) {
            mask[i] = imgData[i * 4] > 120 ? 1 : 0;
          }
          gtBufferRef.current = mask;
        }
      };
      gImg.src = result.groundTruthMaskDataUrl;
    } else {
      gtBufferRef.current = null;
    }
  }, [result?.predictionMaskDataUrl, result?.groundTruthMaskDataUrl]);

  // Interactive Pixel Inspector HUD state
  const [hoverPixel, setHoverPixel] = useState<{
    x: number;
    y: number;
    predBuilding: boolean;
    gtBuilding: boolean | null;
    status: 'TP' | 'FP' | 'FN' | 'TN' | 'Unlabeled';
  } | null>(null);

  const sliderContainerRef = useRef<HTMLDivElement>(null);
  const isDraggingSlider = useRef(false);

  const updateSliderFromClientX = (clientX: number) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.max(2, Math.min(98, percentage)));
  };

  // Handle slider drag
  const handleSliderMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isDraggingSlider.current = true;
    updateSliderFromClientX(e.clientX);
  };

  const handleSliderMouseUp = () => {
    isDraggingSlider.current = false;
  };

  const handleSliderMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!sliderContainerRef.current) return;
    if (isDraggingSlider.current) {
      updateSliderFromClientX(e.clientX);
    }
    handleInteractiveHover(e, sliderContainerRef.current);
  };

  // Generic pixel inspector on any visualizer container
  const handleInteractiveHover = (
    e: React.MouseEvent<HTMLDivElement>, 
    containerEl: HTMLDivElement
  ) => {
    if (!result) return;
    const rect = containerEl.getBoundingClientRect();
    const normX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const normY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    const pixelX = Math.min(511, Math.max(0, Math.floor(normX * 512)));
    const pixelY = Math.min(511, Math.max(0, Math.floor(normY * 512)));
    const pIdx = pixelY * 512 + pixelX;

    const isPred = predBufferRef.current 
      ? predBufferRef.current[pIdx] === 1 
      : (normX > 0.25 && normX < 0.75 && normY > 0.25 && normY < 0.75);

    const hasGt = gtBufferRef.current !== null;
    const isGt = hasGt ? (gtBufferRef.current![pIdx] === 1) : null;

    let status: 'TP' | 'FP' | 'FN' | 'TN' | 'Unlabeled' = 'Unlabeled';
    if (hasGt && isGt !== null) {
      if (isPred && isGt) status = 'TP';
      else if (isPred && !isGt) status = 'FP';
      else if (!isPred && isGt) status = 'FN';
      else status = 'TN';
    }

    setHoverPixel({
      x: pixelX,
      y: pixelY,
      predBuilding: isPred,
      gtBuilding: isGt,
      status
    });
  };

  const handleSliderTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      isDraggingSlider.current = true;
      updateSliderFromClientX(e.touches[0].clientX);
    }
  };

  const handleSliderTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isDraggingSlider.current && e.touches.length > 0) {
      updateSliderFromClientX(e.touches[0].clientX);
    }
  };

  const handleSliderTouchEnd = () => {
    isDraggingSlider.current = false;
  };

  const handleMouseLeave = () => {
    isDraggingSlider.current = false;
    setHoverPixel(null);
  };

  const downloadMask = () => {
    if (!result) return;
    const link = document.createElement('a');
    link.download = `inria-unet-prediction-mask-${Date.now()}.png`;
    link.href = result.predictionMaskDataUrl;
    link.click();
  };

  if (!result) {
    return (
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
        <p>Loading or generating aerial image...</p>
      </div>
    );
  }

  return (
    <div id="section-visualizer" className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Visualizer Header and Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Eye className="w-4 h-4 text-sky-400" />
            3. Qualitative Visualizer & Error Map
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Full resolution tiled comparison between Model Prediction, Ground Truth Mask, and Confusion Overlays.
          </p>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap bg-slate-950/60 p-1 rounded-xl border border-slate-800">
          <button
            id="tab-building-vs-not-building"
            type="button"
            onClick={() => setViewMode('building_vs_not_building')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'building_vs_not_building'
                ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400/50'
                : 'text-emerald-400 hover:text-emerald-200 hover:bg-emerald-950/40'
            }`}
          >
            <Target className="w-3.5 h-3.5 text-emerald-300" />
            <span>Building & Not Building</span>
          </button>

          <button
            id="tab-side-by-side"
            type="button"
            onClick={() => setViewMode('side_by_side')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              viewMode === 'side_by_side'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>4-Panel Grid</span>
          </button>

          <button
            id="tab-split-slider"
            type="button"
            onClick={() => setViewMode('split_slider')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              viewMode === 'split_slider'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Split className="w-3.5 h-3.5" />
            <span>Split Curtain</span>
          </button>

          <button
            id="tab-overlay"
            type="button"
            onClick={() => setViewMode('overlay')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              viewMode === 'overlay'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Overlay Blend</span>
          </button>

          <button
            id="tab-error-map"
            type="button"
            onClick={() => setViewMode('error_map')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              viewMode === 'error_map'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5 text-amber-400" />
            <span>Confusion Map</span>
          </button>

          <button
            id="tab-patch-grid"
            type="button"
            onClick={() => setViewMode('patch_grid')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              viewMode === 'patch_grid'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Grid3X3 className="w-3.5 h-3.5 text-emerald-400" />
            <span>256×256 Grid</span>
          </button>
        </div>
      </div>

      {/* Interactive Pixel Inspector HUD */}
      <div className="bg-slate-950/60 border border-slate-800/90 rounded-xl px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <Crosshair className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
          <span className="font-semibold text-slate-200">Interactive Pixel Inspector:</span>
          {hoverPixel ? (
            <span className="font-mono text-sky-300">
              X: {hoverPixel.x}px • Y: {hoverPixel.y}px
            </span>
          ) : (
            <span className="text-slate-500 italic">Hover mouse over visualizer to inspect pixels</span>
          )}
        </div>

        {hoverPixel && (
          <div className="flex items-center gap-2 font-mono text-[11px] flex-wrap">
            {/* Direct Building vs Not Building Detection tag */}
            <span className={`px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5 shadow-sm ${
              hoverPixel.predBuilding 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                : 'bg-slate-800/80 text-slate-300 border border-slate-700'
            }`}>
              <span className={`w-2 h-2 rounded-full ${hoverPixel.predBuilding ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
              <span>Detected: {hoverPixel.predBuilding ? 'BUILDING' : 'NOT BUILDING'}</span>
            </span>

            {hoverPixel.gtBuilding !== null && (
              <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                GT: {hoverPixel.gtBuilding ? 'Building' : 'Not Building'}
              </span>
            )}
            <span className={`px-2 py-0.5 rounded font-bold ${
              hoverPixel.status === 'TP' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
              hoverPixel.status === 'FP' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' :
              hoverPixel.status === 'FN' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
              'bg-slate-800 text-slate-400'
            }`}>
              {hoverPixel.status === 'TP' && 'True Positive (TP)'}
              {hoverPixel.status === 'FP' && 'False Positive (FP)'}
              {hoverPixel.status === 'FN' && 'False Negative (FN)'}
              {hoverPixel.status === 'TN' && 'True Negative (TN)'}
              {hoverPixel.status === 'Unlabeled' && (hoverPixel.predBuilding ? 'Structure Detected' : 'Terrain/Background')}
            </span>
          </div>
        )}
      </div>

      {/* Main Display Area */}
      <div>
        {/* MODE 0: BUILDING VS NOT BUILDING DETECTION (Report Real-Time Prediction) */}
        {viewMode === 'building_vs_not_building' && (
          <div className="space-y-3">
            <div 
              onMouseMove={(e) => handleInteractiveHover(e, e.currentTarget)}
              onMouseLeave={handleMouseLeave}
              className="relative aspect-square max-w-2xl mx-auto rounded-2xl overflow-hidden border-2 border-emerald-500/40 bg-black shadow-2xl shadow-emerald-950/30 cursor-crosshair group"
            >
              <img
                src={showOutlinesOnly ? result.originalDataUrl : result.buildingDetectionOverlayDataUrl}
                alt="Building vs Not Building Detection"
                className="w-full h-full object-cover"
              />

              {/* In-Image Floating Detection Badges */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none gap-2">
                <div className="px-3 py-1.5 rounded-xl bg-black/85 backdrop-blur-md border border-emerald-500/50 text-emerald-300 font-mono text-xs flex items-center gap-2 shadow-lg">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-bold">Building: {result.buildingPercentage.toFixed(1)}%</span>
                  <span className="text-slate-400">({result.detectedBuildingCount} structures)</span>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-black/85 backdrop-blur-md border border-slate-700 text-slate-200 font-mono text-xs flex items-center gap-2 shadow-lg">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  <span className="font-bold">Not Building: {result.notBuildingPercentage.toFixed(1)}%</span>
                </div>
              </div>

              {/* Bottom In-Image Legend */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-black/80 backdrop-blur-md border border-slate-800 rounded-xl px-3 py-2 text-xs">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-emerald-500 border border-emerald-300" />
                    <span className="text-emerald-300 font-medium text-[11px]">Building Interior</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-yellow-400 border border-yellow-200" />
                    <span className="text-yellow-300 font-medium text-[11px]">Boundary Contour</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-slate-700 border border-slate-600" />
                    <span className="text-slate-300 font-medium text-[11px]">Not Building (Ground/Road/Trees)</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowOutlinesOnly(!showOutlinesOnly)}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 border border-slate-700 pointer-events-auto cursor-pointer transition-colors"
                >
                  {showOutlinesOnly ? 'Show Green Mask' : 'Show Pure Aerial'}
                </button>
              </div>
            </div>
          </div>
        )}
        {/* MODE 1: 4-PANEL GRID (Report Section 17 Standard) */}
        {viewMode === 'side_by_side' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 1. Original RGB */}
            <div 
              onMouseMove={(e) => handleInteractiveHover(e, e.currentTarget)}
              onMouseLeave={handleMouseLeave}
              className="bg-slate-950/60 rounded-xl border border-slate-800 p-2.5 space-y-2 cursor-crosshair group"
            >
              <div className="flex items-center justify-between text-xs font-medium text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-400" />
                  1. Original Aerial RGB
                </span>
                <span className="text-[10px] text-slate-500 font-mono">0.3m GSD</span>
              </div>
              <div className="relative aspect-square rounded-lg overflow-hidden border border-slate-800 bg-black">
                <img
                  src={result.originalDataUrl}
                  alt="Original Aerial RGB"
                  className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-300"
                />
              </div>
            </div>

            {/* 2. Ground Truth Mask */}
            <div 
              onMouseMove={(e) => handleInteractiveHover(e, e.currentTarget)}
              onMouseLeave={handleMouseLeave}
              className="bg-slate-950/60 rounded-xl border border-slate-800 p-2.5 space-y-2 cursor-crosshair group"
            >
              <div className="flex items-center justify-between text-xs font-medium text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-200" />
                  2. Ground Truth Mask
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">
                  {result.groundTruthMaskDataUrl ? '0 vs 255 (Binarized)' : 'Processing...'}
                </span>
              </div>
              <div className="relative aspect-square rounded-lg overflow-hidden border border-slate-800 bg-black flex items-center justify-center">
                {result.groundTruthMaskDataUrl ? (
                  <img
                    src={result.groundTruthMaskDataUrl}
                    alt="Ground Truth Mask"
                    className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-300"
                  />
                ) : (
                  <div className="p-4 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
                    <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                    <span>Rendering Ground Truth Mask...</span>
                  </div>
                )}
              </div>
            </div>

            {/* 3. U-Net Prediction */}
            <div 
              onMouseMove={(e) => handleInteractiveHover(e, e.currentTarget)}
              onMouseLeave={handleMouseLeave}
              className="bg-slate-950/60 rounded-xl border border-slate-800 p-2.5 space-y-2 cursor-crosshair group"
            >
              <div className="flex items-center justify-between text-xs font-medium text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  3. Model Prediction
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">
                  {result.inferenceTimeMs}ms
                </span>
              </div>
              <div className="relative aspect-square rounded-lg overflow-hidden border border-slate-800 bg-black">
                <img
                  src={result.predictionMaskDataUrl}
                  alt="U-Net Binary Prediction"
                  className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-300"
                />
              </div>
            </div>

            {/* 4. Confusion Error Map */}
            <div 
              onMouseMove={(e) => handleInteractiveHover(e, e.currentTarget)}
              onMouseLeave={handleMouseLeave}
              className="bg-slate-950/60 rounded-xl border border-slate-800 p-2.5 space-y-2 cursor-crosshair group"
            >
              <div className="flex items-center justify-between text-xs font-medium text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  4. Error Map (TP/FP/FN)
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Pixel Overlap</span>
              </div>
              <div className="relative aspect-square rounded-lg overflow-hidden border border-slate-800 bg-black flex items-center justify-center">
                {result.errorMapDataUrl ? (
                  <img
                    src={result.errorMapDataUrl}
                    alt="Confusion Error Map"
                    className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-300"
                  />
                ) : (
                  <div className="p-4 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
                    <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <span>Computing Confusion Map...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MODE 2: SPLIT SLIDER / SWIPE CURTAIN */}
        {viewMode === 'split_slider' && (
          <div className="max-w-xl mx-auto space-y-2">
            <div
              ref={sliderContainerRef}
              onMouseDown={handleSliderMouseDown}
              onMouseUp={handleSliderMouseUp}
              onMouseMove={handleSliderMouseMove}
              onMouseLeave={handleMouseLeave}
              onTouchStart={handleSliderTouchStart}
              onTouchMove={handleSliderTouchMove}
              onTouchEnd={handleSliderTouchEnd}
              className="relative aspect-square w-full rounded-xl overflow-hidden border border-slate-700 bg-black select-none cursor-ew-resize shadow-2xl"
            >
              {/* Underneath: Original RGB */}
              <img
                src={result.originalDataUrl}
                alt="Original RGB"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />

              {/* Over top: Prediction with CSS clip-path */}
              <img
                src={result.predictionMaskDataUrl}
                alt="Prediction Mask"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
              />

              {/* Divider Line */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.8)] pointer-events-none flex items-center justify-center z-10"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="w-7 h-7 -ml-0 rounded-full bg-white text-slate-900 shadow-xl flex items-center justify-center border border-slate-300">
                  <Split className="w-3.5 h-3.5 rotate-90" />
                </div>
              </div>

              {/* Labels on sides */}
              <div className="absolute top-3 left-3 px-2 py-1 rounded bg-black/70 backdrop-blur-sm text-[11px] font-semibold text-white pointer-events-none z-10">
                U-Net Prediction Mask
              </div>
              <div className="absolute top-3 right-3 px-2 py-1 rounded bg-black/70 backdrop-blur-sm text-[11px] font-semibold text-white pointer-events-none z-10">
                Original Aerial RGB
              </div>
            </div>

            <p className="text-center text-xs text-slate-400">
              Drag or swipe across the image to interactively compare model prediction with the aerial photograph.
            </p>
          </div>
        )}

        {/* MODE 3: OVERLAY BLEND */}
        {viewMode === 'overlay' && (
          <div className="max-w-xl mx-auto space-y-3">
            <div 
              onMouseMove={(e) => handleInteractiveHover(e, e.currentTarget)}
              onMouseLeave={handleMouseLeave}
              className="relative aspect-square w-full rounded-xl overflow-hidden border border-slate-700 bg-black shadow-2xl cursor-crosshair"
            >
              {/* Base RGB Image */}
              <img
                src={result.originalDataUrl}
                alt="Original Aerial"
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* Mask or Probability Heatmap Overlay */}
              <img
                src={showProbabilityHeatmap ? result.probabilityHeatmapDataUrl : result.predictionMaskDataUrl}
                alt="Overlay"
                className="absolute inset-0 w-full h-full object-cover mix-blend-screen transition-opacity"
                style={{ opacity: overlayOpacity }}
              />

              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-sm text-xs text-slate-200 border border-slate-700 font-medium">
                {showProbabilityHeatmap ? 'Sigmoid Probability Heatmap' : 'Binary Mask (White: Building)'}
              </div>
            </div>

            {/* Overlay controls */}
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2 flex-1">
                <span className="text-slate-400">Overlay Opacity:</span>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={overlayOpacity}
                  onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                  className="w-36 accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
                <span className="font-mono text-indigo-300 font-bold">{Math.round(overlayOpacity * 100)}%</span>
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={showProbabilityHeatmap}
                  onChange={(e) => setShowProbabilityHeatmap(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-indigo-500 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                />
                <span>Continuous Heatmap</span>
              </label>
            </div>
          </div>
        )}

        {/* MODE 4: CONFUSION ERROR MAP FOCUSED */}
        {viewMode === 'error_map' && (
          <div className="max-w-xl mx-auto space-y-3">
            <div 
              onMouseMove={(e) => handleInteractiveHover(e, e.currentTarget)}
              onMouseLeave={handleMouseLeave}
              className="relative aspect-square w-full rounded-xl overflow-hidden border border-slate-700 bg-black shadow-2xl cursor-crosshair"
            >
              {result.errorMapDataUrl ? (
                <img
                  src={result.errorMapDataUrl}
                  alt="Error Map"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-400">
                  <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2" />
                  <p className="font-semibold text-sm">Computing Confusion Error Map</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    Analyzing model predictions against Ground Truth building footprints across the 256×256 tiled pipeline.
                  </p>
                </div>
              )}
            </div>

            {/* Error Map Legend */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-lg p-2 flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                <div>
                  <div className="font-bold text-emerald-300">True Positive (TP)</div>
                  <div className="text-[10px] text-emerald-400/80">Correct Building</div>
                </div>
              </div>

              <div className="bg-sky-950/40 border border-sky-500/30 rounded-lg p-2 flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-sky-500 shadow-sm shadow-sky-500/50" />
                <div>
                  <div className="font-bold text-sky-300">False Positive (FP)</div>
                  <div className="text-[10px] text-sky-400/80">Tree/Road Hallucination</div>
                </div>
              </div>

              <div className="bg-red-950/40 border border-red-500/30 rounded-lg p-2 flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-red-500 shadow-sm shadow-red-500/50" />
                <div>
                  <div className="font-bold text-red-300">False Negative (FN)</div>
                  <div className="text-[10px] text-red-400/80">Missed Building</div>
                </div>
              </div>

              <div className="bg-slate-950/40 border border-slate-700/40 rounded-lg p-2 flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-slate-800 border border-slate-600" />
                <div>
                  <div className="font-bold text-slate-300">True Negative (TN)</div>
                  <div className="text-[10px] text-slate-400">Background Ground</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODE 5: 256×256 PATCH GRID */}
        {viewMode === 'patch_grid' && (
          <div className="max-w-xl mx-auto space-y-3">
            <div 
              onMouseMove={(e) => handleInteractiveHover(e, e.currentTarget)}
              onMouseLeave={handleMouseLeave}
              className="relative aspect-square w-full rounded-xl overflow-hidden border border-slate-700 bg-black shadow-2xl cursor-crosshair"
            >
              <img
                src={result.originalDataUrl}
                alt="Aerial RGB"
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* 256x256 Patch Grid Lines (2x2 grid on 512x512) */}
              <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 pointer-events-none">
                <div className="border-r-2 border-b-2 border-dashed border-amber-400/80 bg-amber-500/10 flex items-start p-2 text-[10px] font-mono font-bold text-amber-300">
                  Patch #1 (0, 0) [256×256]
                </div>
                <div className="border-b-2 border-dashed border-amber-400/80 bg-sky-500/10 flex items-start p-2 text-[10px] font-mono font-bold text-sky-300">
                  Patch #2 (256, 0) [256×256]
                </div>
                <div className="border-r-2 border-dashed border-amber-400/80 bg-emerald-500/10 flex items-start p-2 text-[10px] font-mono font-bold text-emerald-300">
                  Patch #3 (0, 256) [256×256]
                </div>
                <div className="border-dashed border-amber-400/80 bg-purple-500/10 flex items-start p-2 text-[10px] font-mono font-bold text-purple-300">
                  Patch #4 (256, 256) [256×256]
                </div>
              </div>

              <div className="absolute bottom-3 right-3 px-2 py-1 rounded bg-black/80 backdrop-blur-sm text-[11px] font-mono text-amber-300 border border-amber-500/40">
                Stride: 256 px • Resolution: 256×256
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer bar with Download Mask & Latency */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <span>Inference Latency: <strong className="text-emerald-400 font-mono">{result.inferenceTimeMs} ms</strong></span>
          <span>•</span>
          <span>Processed Patches: <strong className="text-sky-400 font-mono">{result.patchCount}</strong></span>
          {isLoading && (
            <span className="text-amber-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              Re-evaluating pipeline...
            </span>
          )}
        </div>

        <button
          id="btn-download-mask"
          type="button"
          onClick={downloadMask}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shadow-sm cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-indigo-400" />
          <span>Download Binary Mask (PNG)</span>
        </button>
      </div>
    </div>
  );
};
