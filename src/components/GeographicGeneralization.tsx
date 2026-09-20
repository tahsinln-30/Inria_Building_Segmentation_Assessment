import React from 'react';
import { ShieldAlert, CheckCircle2, Globe, Zap, Play, BarChart3, TrendingUp, Compass, Award } from 'lucide-react';
import { getModelBenchmarkData } from '../data/sampleImages';
import { SegmentationMetrics, AblationModelId } from '../types';

interface GeographicGeneralizationProps {
  currentMetrics?: SegmentationMetrics | null;
  activeRegionName?: string;
  selectedPresetId?: string | null;
  selectedModelId?: AblationModelId;
  threshold?: number;
  onSelectPreset?: (presetId: string) => void;
  isLoading?: boolean;
  inferenceTimeMs?: number;
}

export const GeographicGeneralization: React.FC<GeographicGeneralizationProps> = ({
  currentMetrics,
  activeRegionName,
  selectedPresetId,
  selectedModelId = 'exp_c_bce_dice_boundary',
  threshold = 0.50,
  onSelectPreset,
  isLoading = false,
  inferenceTimeMs
}) => {
  const isCustomActive = !selectedPresetId && !!currentMetrics;
  const benchmarkData = getModelBenchmarkData(selectedModelId);

  // Compute Overall Benchmark Summaries for Section 18 (Validation) and Section 23 (Test)
  const valRegions = benchmarkData.filter((r) => r.split === 'Val');
  const valMeanIoU = valRegions.length > 0 
    ? valRegions.reduce((acc, curr) => acc + curr.iou, 0) / valRegions.length 
    : 0;
  const valMeanDice = valRegions.length > 0 
    ? valRegions.reduce((acc, curr) => acc + curr.dice, 0) / valRegions.length 
    : 0;

  const testRegion = benchmarkData.find((r) => r.split === 'Test');
  const testIoU = testRegion ? testRegion.iou : 0;
  const testDice = testRegion ? testRegion.dice : 0;

  const modelLabel = 
    selectedModelId === 'exp_a_bce' ? 'Exp A: Binary Cross-Entropy (BCE)' :
    selectedModelId === 'exp_b_bce_dice' ? 'Exp B: BCE + Soft Dice Loss' :
    'Exp C: BCE + Dice + Active Boundary Loss';

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Globe className="w-4 h-4 text-sky-400" />
            5. Region-Wise Benchmark Performance Breakdown
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Strict geographic isolation protocol: Whole-city training, validation, and test separation preventing spatial autocorrelation leakage.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {inferenceTimeMs && (
            <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-xs font-mono border border-indigo-500/30 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              {inferenceTimeMs}ms Real-Time
            </span>
          )}
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-semibold border border-emerald-500/30 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Zero Spatial Leakage
          </span>
        </div>
      </div>

      {/* Benchmark Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Active Model Config */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-1">
          <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-indigo-400" />
            <span>Active Model Pipeline</span>
          </div>
          <div className="text-xs font-bold text-indigo-300 truncate">
            {modelLabel}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            Threshold τ = {threshold.toFixed(2)}
          </div>
        </div>

        {/* Validation Set Mean IoU */}
        <div className="bg-slate-950/60 border border-amber-500/30 rounded-xl p-3 space-y-1">
          <div className="text-[11px] font-medium text-amber-400 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <BarChart3 className="w-3.5 h-3.5" />
              Validation Mean IoU
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
              Vienna + W. Tyrol
            </span>
          </div>
          <div className="text-xl font-extrabold font-mono text-white">
            {(valMeanIoU * 100).toFixed(1)}% <span className="text-xs text-amber-300 font-normal font-mono">({valMeanIoU.toFixed(3)})</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            Mean Dice: {(valMeanDice * 100).toFixed(1)}%
          </div>
        </div>

        {/* Test Set IoU (San Francisco) */}
        <div className="bg-slate-950/60 border border-purple-500/30 rounded-xl p-3 space-y-1">
          <div className="text-[11px] font-medium text-purple-400 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              Test Set IoU
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300">
              San Francisco
            </span>
          </div>
          <div className="text-xl font-extrabold font-mono text-white">
            {(testIoU * 100).toFixed(1)}% <span className="text-xs text-purple-300 font-normal font-mono">({testIoU.toFixed(3)})</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            Blind Test Dice: {(testDice * 100).toFixed(1)}%
          </div>
        </div>

        {/* Live Active Inference Performance */}
        <div className="bg-slate-950/60 border border-emerald-500/30 rounded-xl p-3 space-y-1">
          <div className="text-[11px] font-medium text-emerald-400 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Compass className="w-3.5 h-3.5" />
              Live Active Region
            </span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <div className="text-xl font-extrabold font-mono text-white">
            {currentMetrics ? `${(currentMetrics.iou * 100).toFixed(1)}%` : '---'}
            {currentMetrics && (
              <span className="text-xs text-emerald-300 font-normal font-mono ml-1">
                ({currentMetrics.iou.toFixed(3)})
              </span>
            )}
          </div>
          <div className="text-[10px] text-slate-400 truncate">
            {activeRegionName || 'Ready for test'}
          </div>
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

        {/* Rigorous Protocol (City-Level Isolation) */}
        <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4 space-y-2 relative overflow-hidden">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
            <CheckCircle2 className="w-4 h-4" />
            <span>✓ Benchmark Standard: City-Level Geographic Isolation</span>
          </div>

          <div className="text-[11px] text-slate-300 leading-relaxed space-y-2">
            <p>
              Under the Inria Aerial Image Labeling Benchmark protocol, geographic entities are separated completely by municipal boundary:
            </p>
            <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
              <div className="bg-slate-950/80 p-2 rounded border border-slate-800">
                <span className="text-slate-400 block">Training (60%)</span>
                <strong className="text-slate-200">Austin, Chicago, Kitsap</strong>
              </div>
              <div className="bg-amber-950/30 p-2 rounded border border-amber-500/30">
                <span className="text-amber-400 block font-semibold">Validation (20%)</span>
                <strong className="text-amber-200">Vienna & West Tyrol</strong>
              </div>
              <div className="bg-purple-950/30 p-2 rounded border border-purple-500/30">
                <span className="text-purple-400 block font-semibold">Test (20%)</span>
                <strong className="text-purple-200">San Francisco</strong>
              </div>
            </div>
            <p className="text-slate-400">
              <strong className="text-slate-200">True Generalization:</strong> The model evaluates exclusively on unseen architectural typologies (European terracotta roofs in Vienna and Alpine mountain chalets in West Tyrol).
            </p>
          </div>
        </div>
      </div>

      {/* Region-Wise Benchmark Table */}
      <div className="space-y-2 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <span>Inria Region-Wise Performance Table ({modelLabel})</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
              Click Any Row to Test
            </span>
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">
            Ground Sampling Distance: 0.3 m/px
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800 shadow-sm">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">City / Region</th>
                <th className="py-2.5 px-3">Split</th>
                <th className="py-2.5 px-3">Val / Test IoU</th>
                <th className="py-2.5 px-3">Dice / F1</th>
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
              {benchmarkData.map((item) => {
                const isSelected = selectedPresetId === item.presetId;
                const liveIoU = isSelected && currentMetrics ? currentMetrics.iou : item.iou;
                const liveDice = isSelected && currentMetrics ? currentMetrics.dice : item.dice;
                const livePrecision = isSelected && currentMetrics ? currentMetrics.precision : item.precision;
                const liveRecall = isSelected && currentMetrics ? currentMetrics.recall : item.recall;
                const liveBuildingArea = isSelected && currentMetrics ? currentMetrics.buildingPercentagePred : item.buildingAreaPct;

                const iouDelta = isSelected && currentMetrics ? currentMetrics.iou - item.iou : 0;

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
                      <span className={liveIoU >= 0.75 ? 'text-emerald-400' : 'text-amber-400'}>
                        {liveIoU.toFixed(3)}
                      </span>
                      {isSelected && currentMetrics && (
                        <span className={`ml-1.5 text-[9px] font-mono ${iouDelta >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          ({iouDelta >= 0 ? '+' : ''}{iouDelta.toFixed(3)} vs ref)
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

        {/* Section 18 & Section 23 Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-[11px] text-slate-300 leading-relaxed">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <strong className="text-amber-300 block mb-1">Section 18 Insight (Validation City Isolation):</strong>
            <span>
              Vienna achieves superior IoU ({benchmarkData.find(r => r.region.includes('Vienna'))?.iou.toFixed(3)}) due to uniform terracotta roof tiles and stark spectral contrast against asphalt streets. In contrast, West Tyrol experiences performance degradation ({benchmarkData.find(r => r.region.includes('West Tyrol'))?.iou.toFixed(3)} IoU) because steep alpine terrain casts deep mountain shadows across dispersed wooden chalets.
            </span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <strong className="text-purple-300 block mb-1">Section 23 Insight (Blind Test Generalization):</strong>
            <span>
              San Francisco evaluates the network on dense Victorian rowhouses, narrow alleyways, and extreme topographical slopes ({testIoU.toFixed(3)} IoU). Boundary loss (Exp C) dramatically improves building separation between adjacent structures compared to standard BCE loss (Exp A).
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
