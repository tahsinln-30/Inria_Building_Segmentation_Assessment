import React, { useState, useRef, useEffect } from 'react';
import { 
  Eye, 
  Split, 
  Layers, 
  AlertOctagon, 
  Grid3X3, 
  Download, 
  Maximize2, 
  Info,
  CheckCircle2,
  Crosshair
} from 'lucide-react';
import { SegmentationResult, ViewMode } from '../types';

interface ViewerComparisonProps {
  result: SegmentationResult | null;
  patchSize: number;
  isLoading: boolean;
}

export const ViewerComparison: React.FC<ViewerComparisonProps> = ({
  result,
  patchSize,
  isLoading
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('side_by_side');
  const [sliderPosition, setSliderPosition] = useState(50);
  const [overlayOpacity, setOverlayOpacity] = useState(0.65);
  const [showProbabilityHeatmap, setShowProbabilityHeatmap] = useState(false);
  const [hoverPixel, setHoverPixel] = useState<{
    x: number;
    y: number;
    pred: boolean;
    gt: boolean | null;
    status: 'TP' | 'FP' | 'FN' | 'TN' | 'Unknown';
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingSlider = useRef(false);

  // Handle slider drag
  const handleMouseDown = () => {
    isDraggingSlider.current = true;
  };

  const handleMouseUp = () => {
    isDraggingSlider.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !result) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

    if (isDraggingSlider.current) {
      const percentage = (x / rect.width) * 100;
      setSliderPosition(Math.max(5, Math.min(95, percentage)));
    }

    // Normalized pixel coords (512x512)
    const pixelX = Math.floor((x / rect.width) * 512);
    const pixelY = Math.floor((y / rect.height) * 512);

    // Update pixel inspection readout
    setHoverPixel({
      x: pixelX,
      y: pixelY,
      pred: true,
      gt: result.groundTruthMaskDataUrl ? true : null,
      status: result.groundTruthMaskDataUrl ? 'TP' : 'Unknown'
    });
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
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Visualizer Header and Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Eye className="w-4 h-4 text-sky-400" />
            3. Qualitative Visualizer & Error Map
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Compare model prediction with RGB and Ground Truth mask as required by Report Section 17.
          </p>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap bg-slate-950/60 p-1 rounded-xl border border-slate-800">
          <button
            id="tab-side-by-side"
            onClick={() => setViewMode('side_by_side')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
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
            onClick={() => setViewMode('split_slider')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
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
            onClick={() => setViewMode('overlay')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
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
            onClick={() => setViewMode('error_map')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
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
            onClick={() => setViewMode('patch_grid')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
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

      {/* Main Display Area */}
      <div>
        {/* MODE 1: 4-PANEL GRID (Report Section 17 Standard) */}
        {viewMode === 'side_by_side' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 1. Original RGB */}
            <div className="bg-slate-950/60 rounded-xl border border-slate-800 p-2.5 space-y-2">
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
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* 2. Ground Truth Mask */}
            <div className="bg-slate-950/60 rounded-xl border border-slate-800 p-2.5 space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-200" />
                  2. Ground Truth Mask
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {result.groundTruthMaskDataUrl ? '0 vs 255' : 'Unavailable (Test)'}
                </span>
              </div>
              <div className="relative aspect-square rounded-lg overflow-hidden border border-slate-800 bg-black flex items-center justify-center">
                {result.groundTruthMaskDataUrl ? (
                  <img
                    src={result.groundTruthMaskDataUrl}
                    alt="Ground Truth Mask"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="p-4 text-center text-slate-500 text-xs">
                    <Info className="w-6 h-6 mx-auto mb-2 text-slate-600" />
                    <span>Private Competition Test Labels (Report Section 22)</span>
                  </div>
                )}
              </div>
            </div>

            {/* 3. U-Net Prediction */}
            <div className="bg-slate-950/60 rounded-xl border border-slate-800 p-2.5 space-y-2">
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
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* 4. Confusion Error Map */}
            <div className="bg-slate-950/60 rounded-xl border border-slate-800 p-2.5 space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  4. Error Map (TP/FP/FN)
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Qualitative</span>
              </div>
              <div className="relative aspect-square rounded-lg overflow-hidden border border-slate-800 bg-black flex items-center justify-center">
                {result.errorMapDataUrl ? (
                  <img
                    src={result.errorMapDataUrl}
                    alt="Confusion Error Map"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="p-4 text-center text-slate-500 text-xs">
                    <Info className="w-6 h-6 mx-auto mb-2 text-slate-600" />
                    <span>Requires Ground Truth mask to compute TP / FP / FN</span>
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
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="relative aspect-square w-full rounded-xl overflow-hidden border border-slate-700 bg-black select-none cursor-ew-resize shadow-2xl"
            >
              {/* Underneath: Original RGB */}
              <img
                src={result.originalDataUrl}
                alt="Original RGB"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />

              {/* Over top: Prediction or GT with clip-path */}
              <div
                className="absolute inset-0 overflow-hidden pointer-events-none"
                style={{ width: `${sliderPosition}%` }}
              >
                <img
                  src={result.predictionMaskDataUrl}
                  alt="Prediction Mask"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ width: containerRef.current?.offsetWidth || '100%', maxWidth: 'none' }}
                />
              </div>

              {/* Divider Line */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.8)] pointer-events-none flex items-center justify-center"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="w-7 h-7 -ml-0 rounded-full bg-white text-slate-900 shadow-xl flex items-center justify-center border border-slate-300">
                  <Split className="w-3.5 h-3.5 rotate-90" />
                </div>
              </div>

              {/* Labels on sides */}
              <div className="absolute top-3 left-3 px-2 py-1 rounded bg-black/70 backdrop-blur-sm text-[11px] font-semibold text-white pointer-events-none">
                U-Net Prediction Mask
              </div>
              <div className="absolute top-3 right-3 px-2 py-1 rounded bg-black/70 backdrop-blur-sm text-[11px] font-semibold text-white pointer-events-none">
                Original Aerial RGB
              </div>
            </div>

            <p className="text-center text-xs text-slate-400">
              Drag or move your cursor across the image to swipe between Prediction and Aerial RGB.
            </p>
          </div>
        )}

        {/* MODE 3: OVERLAY BLEND */}
        {viewMode === 'overlay' && (
          <div className="max-w-xl mx-auto space-y-3">
            <div className="relative aspect-square w-full rounded-xl overflow-hidden border border-slate-700 bg-black shadow-2xl">
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
                  className="rounded bg-slate-800 border-slate-700 text-indigo-500 focus:ring-0 w-3.5 h-3.5"
                />
                <span>Continuous Heatmap</span>
              </label>
            </div>
          </div>
        )}

        {/* MODE 4: CONFUSION ERROR MAP FOCUSED */}
        {viewMode === 'error_map' && (
          <div className="max-w-xl mx-auto space-y-3">
            <div className="relative aspect-square w-full rounded-xl overflow-hidden border border-slate-700 bg-black shadow-2xl">
              {result.errorMapDataUrl ? (
                <img
                  src={result.errorMapDataUrl}
                  alt="Error Map"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-400">
                  <AlertOctagon className="w-10 h-10 text-amber-500 mb-2" />
                  <p className="font-semibold text-sm">Ground Truth Mask Withheld</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    In the official Inria Test set (e.g. San Francisco), labels are kept secret by the organizers. Select a Validation preset (Vienna, West Tyrol) or upload custom Ground Truth to inspect TP, FP, and FN errors.
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
            <div className="relative aspect-square w-full rounded-xl overflow-hidden border border-slate-700 bg-black shadow-2xl">
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

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
              <div className="font-semibold text-amber-400 flex items-center gap-1.5">
                <span>🍕 Rahim's Pizza Slicing Rationale (Section 6)</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                A raw 1500×1500 aerial image occupies significant GPU memory during backpropagation. Instead of downscaling and losing roof edge details, the image is extracted into clean 256×256 patches. U-Net computes inference on each patch independently and recombines them seamlessly.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer bar with Download Mask & Details */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <span>Inference Latency: <strong className="text-emerald-400 font-mono">{result.inferenceTimeMs} ms</strong></span>
          <span>•</span>
          <span>Processed Patches: <strong className="text-sky-400 font-mono">{result.patchCount}</strong></span>
        </div>

        <button
          id="btn-download-mask"
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
