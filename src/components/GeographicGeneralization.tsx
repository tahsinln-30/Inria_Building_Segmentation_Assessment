import React from 'react';
import { MapPin, ShieldAlert, CheckCircle2, Globe, ArrowRight, AlertTriangle } from 'lucide-react';
import { REGION_BENCHMARK_DATA } from '../data/sampleImages';

export const GeographicGeneralization: React.FC = () => {
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
            Strict adherence to Report Sections 4, 5, and 18: City-level train/validation isolation.
          </p>
        </div>

        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-semibold border border-emerald-500/30 flex items-center gap-1.5 self-start">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Spatial Leakage Protected
        </span>
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
        <div className="flex items-center justify-between text-xs">
          <h3 className="font-bold text-slate-200 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-sky-400" />
            <span>Region-Wise Benchmark Performance Breakdown (Section 18 & 23)</span>
          </h3>
          <span className="text-[11px] text-slate-500">Inria Aerial Dataset</span>
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
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
              {REGION_BENCHMARK_DATA.map((item) => (
                <tr key={item.region} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2 px-3 font-semibold text-white flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      item.split === 'Val' ? 'bg-amber-400' :
                      item.split === 'Test' ? 'bg-purple-400' : 'bg-slate-400'
                    }`} />
                    {item.region}
                  </td>
                  <td className="py-2 px-3">
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      item.split === 'Val'
                        ? 'bg-amber-500/20 text-amber-300'
                        : item.split === 'Test'
                        ? 'bg-purple-500/20 text-purple-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {item.split}
                    </span>
                  </td>
                  <td className="py-2 px-3 font-mono font-bold">
                    {item.iou > 0 ? (
                      <span className={item.iou > 0.75 ? 'text-emerald-400' : 'text-amber-400'}>
                        {item.iou.toFixed(3)}
                      </span>
                    ) : (
                      <span className="text-slate-500 italic">Withheld (Sec 22)</span>
                    )}
                  </td>
                  <td className="py-2 px-3 font-mono">
                    {item.dice > 0 ? item.dice.toFixed(3) : '—'}
                  </td>
                  <td className="py-2 px-3 font-mono text-slate-400">
                    {item.precision > 0 ? item.precision.toFixed(3) : '—'}
                  </td>
                  <td className="py-2 px-3 font-mono text-slate-400">
                    {item.recall > 0 ? item.recall.toFixed(3) : '—'}
                  </td>
                  <td className="py-2 px-3 font-mono text-slate-400">
                    {item.buildingAreaPct}%
                  </td>
                  <td className="py-2 px-3 text-[11px] text-slate-400 max-w-xs truncate">
                    {item.dominantArchitecture}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
          <strong>Key Finding (Section 18):</strong> Vienna achieves <strong>0.792 IoU</strong> due to distinct terracotta roof contrast, whereas West Tyrol drops to <strong>0.684 IoU</strong> because of steep alpine mountain terrain shadows and scattered chalet orientations. This confirms why region-wise reporting is scientifically necessary.
        </p>
      </div>
    </div>
  );
};
