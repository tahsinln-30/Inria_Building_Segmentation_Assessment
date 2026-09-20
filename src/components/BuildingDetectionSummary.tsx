import React from 'react';
import { Building2, Trees, Compass, Layers, CheckCircle2, AlertCircle, ArrowUpRight, Zap } from 'lucide-react';
import { SegmentationResult } from '../types';

interface BuildingDetectionSummaryProps {
  result: SegmentationResult | null;
  regionName: string;
  isCustomUpload: boolean;
  onFocusDetectionView?: () => void;
}

export const BuildingDetectionSummary: React.FC<BuildingDetectionSummaryProps> = ({
  result,
  regionName,
  isCustomUpload,
  onFocusDetectionView
}) => {
  if (!result) return null;

  const {
    detectedBuildingCount,
    buildingPercentage,
    notBuildingPercentage,
    notBuildingBreakdown,
    inferenceTimeMs,
    patchCount
  } = result;

  // Approximate physical area based on 0.3m Ground Sampling Distance (GSD)
  // 1 pixel = 0.3m x 0.3m = 0.09 m²
  const totalPixels = 512 * 512;
  const buildingPx = result.metrics?.buildingPixelCount ?? Math.round((buildingPercentage / 100) * totalPixels);
  const notBuildingPx = totalPixels - buildingPx;
  const buildingAreaM2 = Math.round(buildingPx * 0.09);
  const notBuildingAreaM2 = Math.round(notBuildingPx * 0.09);

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-wide">
                Building & Not Building Detection Results
              </h2>
              {isCustomUpload && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30">
                  User Image Analyzed
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {isCustomUpload ? (
                <span>
                  Found <strong className="text-emerald-300">{detectedBuildingCount} buildings</strong> across your uploaded aerial photo
                </span>
              ) : (
                <span>
                  Building and terrain detection for <strong className="text-slate-200">{regionName}</strong>
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-mono border border-emerald-500/30 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>{inferenceTimeMs}ms Latency</span>
          </span>
          <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-mono border border-slate-700">
            {patchCount} Patches (256×256)
          </span>
          {onFocusDetectionView && (
            <button
              type="button"
              onClick={onFocusDetectionView}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer shadow-sm"
            >
              <span>View Detection Overlay</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Primary Detection Split Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Class 1: Building Detection */}
        <div className="bg-slate-950/70 border-2 border-emerald-500/40 rounded-xl p-4 relative overflow-hidden shadow-lg shadow-emerald-950/20">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full pointer-events-none" />
          
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
              <span className="font-bold text-sm text-emerald-300 tracking-wide">
                Building Footprints (Structures)
              </span>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[11px] font-bold border border-emerald-500/30">
              {detectedBuildingCount} Detected
            </span>
          </div>

          <div className="flex items-baseline gap-3 my-2">
            <div className="text-3xl font-extrabold font-mono text-white tracking-tight">
              {buildingPercentage.toFixed(1)}%
            </div>
            <div className="text-xs text-emerald-400/90 font-medium">
              of total scene area
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800/80">
            <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Identified Structures</span>
              <strong className="text-emerald-300 font-mono text-sm">
                {detectedBuildingCount} {detectedBuildingCount === 1 ? 'Building' : 'Buildings'}
              </strong>
            </div>
            <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Estimated Footprint</span>
              <strong className="text-white font-mono text-sm">
                ~{buildingAreaM2.toLocaleString()} m²
              </strong>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-2.5">
            Includes rooftops, industrial sheds, residential structures, and annexes segmented with boundary-loss precision.
          </p>
        </div>

        {/* Class 0: Not Building Detection */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-400" />
              <span className="font-bold text-sm text-slate-300 tracking-wide">
                Non-Building Land (Ground & Trees)
              </span>
            </div>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px] font-medium border border-slate-700">
              Open Terrain
            </span>
          </div>

          <div className="flex items-baseline gap-3 my-2">
            <div className="text-3xl font-extrabold font-mono text-white tracking-tight">
              {notBuildingPercentage.toFixed(1)}%
            </div>
            <div className="text-xs text-slate-400 font-medium">
              of total scene area
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1.5 text-xs pt-2 border-t border-slate-800/80 text-center">
            <div className="bg-slate-900/60 p-1.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-emerald-400 block font-medium">🌿 Trees/Canopy</span>
              <strong className="text-slate-200 font-mono text-xs">
                {notBuildingBreakdown.vegetationPct.toFixed(1)}%
              </strong>
            </div>
            <div className="bg-slate-900/60 p-1.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-sky-400 block font-medium">🛣️ Roads/Streets</span>
              <strong className="text-slate-200 font-mono text-xs">
                {notBuildingBreakdown.roadPavementPct.toFixed(1)}%
              </strong>
            </div>
            <div className="bg-slate-900/60 p-1.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-amber-400 block font-medium">🟫 Ground/Water</span>
              <strong className="text-slate-200 font-mono text-xs">
                {notBuildingBreakdown.otherGroundPct.toFixed(1)}%
              </strong>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-2.5">
            Non-building terrain classified via spectral vegetation index, pavement reflectance, and edge contrast suppression.
          </p>
        </div>
      </div>

      {/* Visual Proportional Bar */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Building ({buildingPercentage.toFixed(1)}%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-600" />
            <span>Not Building ({notBuildingPercentage.toFixed(1)}%)</span>
          </div>
        </div>

        <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex border border-slate-700/80 shadow-inner">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-500"
            style={{ width: `${buildingPercentage}%` }}
            title={`Building: ${buildingPercentage.toFixed(1)}%`}
          />
          <div
            className="bg-slate-700 h-full transition-all duration-500"
            style={{ width: `${notBuildingPercentage}%` }}
            title={`Not Building: ${notBuildingPercentage.toFixed(1)}%`}
          />
        </div>
      </div>
    </div>
  );
};
