import React from 'react';
import { MapPin, ShieldAlert, CheckCircle2, Globe, ArrowRight, Activity, Zap, Play } from 'lucide-react';
import { REGION_BENCHMARK_DATA } from '../data/sampleImages';
import { SegmentationMetrics } from '../types';

interface GeographicGeneralizationProps {
  currentMetrics?: SegmentationMetrics | null;
  activeRegionName?: string;
  selectedPresetId?: string | null;
  onSelectPreset?: (presetId: string) => void;
  isLoading?: boolean;
  inferenceTimeMs?: number;
}

export const GeographicGeneralization: React.FC<GeographicGeneralizationProps> = ({
  currentMetrics,
  activeRegionName,
  selectedPresetId,
  onSelectPreset,
  isLoading = false,
  inferenceTimeMs
}) => {
  const isCustomActive = !selectedPresetId && !!currentMetrics;

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Globe className="w-4 h-4 text-sky-400" />
            Geographic Generalization & Spatial Leakage Protocol
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Strict adherence to Report Sections 4, 5, and 18: City-level train/validation isolation with real-time evaluation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {inferenceTimeMs && (
            <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-xs font-mono border border-indigo-500/30 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              {inferenceTimeMs}ms Real-Time
            </span>
          )}
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-semibold border border-emerald-500/30 flex items-center gap-1.5 self-start">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Spatial Leakage Protected
          </span>
        </div>
      </div>

      {/* Spatial Leakage Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Flawed Approach (Leakage) */}
        <div className="bg-red-950/20 border border-red-500/30 rounded-xl p-4 space-y-2 relative overflow-hidden">
          <div className="flex items-center gap-2 text-red-400 font-semibold text-xs">
            <ShieldAlert className="w-4 h-4" />
            <span>❌ Forbidden: Random Patch Splitting (Spatial Leakage)</span>
          </div>

          <div className="text-[11px] text-slate-300 leading-relaxed space-y-2">
            <p>
              If a single 1500×1500 aerial tile is cut into patches, and <strong className="text-red-300">Patch 1 goes to Training</strong> while adjacent <strong className="text-red-300">Patch 2 goes to Validation</strong>:
            </p>
            <div className="bg-slate-950/70 p-2.5 rounded-lg border border-red-900/40 text-[11px] font-mono text-slate-300">
              Big Image ➔ Random Slices ➔ Train & Val adjacent!
            </div>
            <p className="text-slate-400">
              <strong className="text-slate-200">Adjacency Leakage Defect:</strong> If the left portion of a rooftop is partitioned into Training while the right portion falls into Validation, the network trivially memorizes high-frequency local textures and illumination. Validation scores become artificially inflated.
            </p>
          </div>
        </div>

        {/* Correct Methodology */}
        <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4 space-y-2 relative overflow-hidden">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
            <CheckCircle2 className="w-4 h-4" />
            <span>✅ Implemented: City / Region Split First</span>
          </div>

          <div className="text-[11px] text-slate-300 leading-relaxed space-y-2">
            <p>
              As formulated in Report Section 5, split whole cities first, then extract patches within isolated geographic boundaries:
            </p>
            <div className="bg-slate-950/70 p-2.5 rounded-lg border border-emerald-900/40 text-[11px] font-mono text-emerald-300 flex items-center gap-1.5 flex-wrap">
              <span>Whole City</span>
              <ArrowRight className="w-3 h-3 text-slate-500" />
              <span>Train / Val Region</span>
              <ArrowRight className="w-3 h-3 text-slate-500" />
              <span>256×256 Patches</span>
            </div>
            <p className="text-slate-400">
              <strong className="text-slate-200">Generalization Tested:</strong> Patches from Vienna or West Tyrol are never seen during training on Austin or Chicago. The model must learn actual geometric building principles!
            </p>
          </div>
        </div>
      </div>

      {/* Region-Wise Performance Table (Section 18) */}
      <div className="space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
          <h3 className="font-bold text-slate-200 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-sky-400" />
            <span>Region-Wise Benchmark Performance Breakdown (Section 18 & 23)</span>
          </h3>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <Activity className="w-3 h-3 animate-pulse" />
              Real-Time Dynamic Evaluation
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">Inria Aerial Dataset</span>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">City / Region</th>
                <th className="py-2.5 px-3">Split</th>
                <th className="py-2.5 px-3">Val IoU</th>
                <th className="py-2.5 px-3">Dice/F1</th>
                <th className="py-2.5 px-3">Precision</th>
                <th className="py-2.5 px-3">Recall</th>
                <th className="py-2.5 px-3">Building Area %</th>
                <th className="py-2.5 px-3">Topographic & Architectural Traits</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
              {/* Custom Image Real-Time Row (if active) */}
              {isCustomActive && currentMetrics && (
                <tr className="bg-indigo-950/40 border-b border-indigo-500/30">
                  <td className="py-2.5 px-3 font-semibold text-white flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-emerald-300 font-bold truncate max-w-[150px]">
                      {activeRegionName || 'Custom Upload'}
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono border border-emerald-500/30">
                      LIVE FEED
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
                      Live Test
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">
                    {currentMetrics.iou.toFixed(3)}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-100">
                    {currentMetrics.dice.toFixed(3)}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-200">
                    {currentMetrics.precision.toFixed(3)}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-200">
                    {currentMetrics.recall.toFixed(3)}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-200">
                    {currentMetrics.buildingPercentagePred.toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3 text-[11px] text-emerald-300/80">
                    Real-time inference on user-supplied aerial imagery (256×256 tiled pipeline)
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-[10px] text-emerald-400">
                    ● Active
                  </td>
                </tr>
              )}

              {/* Standard Benchmark Regions with Live Overlay */}
              {REGION_BENCHMARK_DATA.map((item) => {
                const isSelected = selectedPresetId === item.presetId;
                const liveIoU = isSelected && currentMetrics ? currentMetrics.iou : item.iou;
                const liveDice = isSelected && currentMetrics ? currentMetrics.dice : item.dice;
                const livePrecision = isSelected && currentMetrics ? currentMetrics.precision : item.precision;
                const liveRecall = isSelected && currentMetrics ? currentMetrics.recall : item.recall;
                const liveBuildingArea = isSelected && currentMetrics ? currentMetrics.buildingPercentagePred : item.buildingAreaPct;

                return (
                  <tr
                    key={item.region}
                    onClick={() => item.presetId && onSelectPreset && onSelectPreset(item.presetId)}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-sky-950/40 border-l-2 border-sky-400'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-2 px-3 font-semibold text-white flex items-center gap-2">
                      {isSelected ? (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                        </span>
                      ) : (
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.split === 'Val'
                              ? 'bg-amber-400'
                              : item.split === 'Test'
                              ? 'bg-purple-400'
                              : 'bg-slate-400'
                          }`}
                        />
                      )}
                      <span>{item.region}</span>
                      {isSelected && (
                        <span className="px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 text-[9px] font-mono border border-sky-500/30">
                          LIVE
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          item.split === 'Val'
                            ? 'bg-amber-500/20 text-amber-300'
                            : item.split === 'Test'
                            ? 'bg-purple-500/20 text-purple-300'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {item.split}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-mono font-bold">
                      <span className={liveIoU > 0.75 ? 'text-emerald-400' : 'text-amber-400'}>
                        {liveIoU.toFixed(3)}
                      </span>
                      {isSelected && currentMetrics && (
                        <span className="ml-1 text-[9px] text-slate-500 font-normal">
                          (ref {item.iou.toFixed(3)})
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3 font-mono">
                      {liveDice.toFixed(3)}
                    </td>
                    <td className="py-2 px-3 font-mono text-slate-300">
                      {livePrecision.toFixed(3)}
                    </td>
                    <td className="py-2 px-3 font-mono text-slate-300">
                      {liveRecall.toFixed(3)}
                    </td>
                    <td className="py-2 px-3 font-mono text-slate-300">
                      {typeof liveBuildingArea === 'number' ? liveBuildingArea.toFixed(1) : liveBuildingArea}%
                    </td>
                    <td className="py-2 px-3 text-[11px] text-slate-400 max-w-xs truncate">
                      {item.dominantArchitecture}
                    </td>
                    <td className="py-2 px-3 text-right">
                      {isSelected ? (
                        <span className="text-[10px] font-mono text-sky-400 font-semibold">
                          Testing Now
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (item.presetId && onSelectPreset) {
                              onSelectPreset(item.presetId);
                            }
                          }}
                          disabled={isLoading}
                          className="px-2 py-0.5 text-[10px] font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Play className="w-2.5 h-2.5" />
                          <span>Test</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-[11px] text-slate-400 leading-relaxed pt-1">
          <p>
            <strong>Key Finding (Section 18):</strong> Vienna achieves <strong>0.792 IoU</strong> due to distinct terracotta roof contrast, whereas West Tyrol drops to <strong>0.684 IoU</strong> because of steep alpine mountain terrain shadows and scattered chalets.
          </p>
          <p className="text-slate-500 shrink-0">
            Click any row to run real-time inference on that region.
          </p>
        </div>
      </div>
    </div>
  );
};

