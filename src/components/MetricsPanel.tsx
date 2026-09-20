import React from 'react';
import { 
  BarChart3, 
  CheckCircle, 
  Target, 
  Percent, 
  HelpCircle, 
  AlertTriangle, 
  TrendingUp,
  Award,
  Layers
} from 'lucide-react';
import { SegmentationMetrics } from '../types';

interface MetricsPanelProps {
  metrics: SegmentationMetrics | null;
  hasGroundTruth: boolean;
  regionName: string;
}

export const MetricsPanel: React.FC<MetricsPanelProps> = ({
  metrics,
  hasGroundTruth,
  regionName
}) => {
  if (!hasGroundTruth || !metrics) {
    return (
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            4. Quantitative Metrics & Class Imbalance Analysis
          </h2>
          <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 text-xs font-mono border border-purple-500/30">
            Official Test Set
          </span>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto border border-purple-500/20">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-200">
              Official Test Labels Unavailable (Section 22 Compliance)
            </h3>
            <p className="text-xs text-slate-400 max-w-lg mx-auto mt-1 leading-relaxed">
              Inria competition benchmark rules withhold ground truth annotations for official test cities (like San Francisco, Bellingham, Innsbruck). Per Section 22 of the methodology, test metrics cannot be artificially fabricated. Qualitative visual inspection is performed instead.
            </p>
          </div>
          <div className="text-[11px] text-slate-500">
            💡 Switch to a Validation preset (e.g. Vienna or West Tyrol) or upload custom Ground Truth to compute exact IoU, Dice, Precision, and Recall.
          </div>
        </div>
      </div>
    );
  }

  const { iou, dice, precision, recall, accuracy, buildingPercentageTrue, buildingPercentagePred, confusion } = metrics;

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            4. Quantitative Evaluation Metrics
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Validation scores for <strong className="text-slate-200">{regionName}</strong> evaluated at pixel resolution.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 font-medium">
          <Award className="w-3.5 h-3.5" />
          <span>Primary Benchmark Metric: Validation IoU</span>
        </div>
      </div>

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. IoU (Main) */}
        <div className="bg-slate-950/70 border border-emerald-500/30 rounded-xl p-3.5 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold text-emerald-400 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              IoU (Jaccard)
            </span>
            <span className="text-[10px] font-mono text-slate-500">TP/(TP+FP+FN)</span>
          </div>
          <div className="text-2xl font-extrabold font-mono text-white tracking-tight">
            {(iou * 100).toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Ratio: <span className="font-mono text-emerald-300">{iou.toFixed(4)}</span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${iou * 100}%` }}
            />
          </div>
        </div>

        {/* 2. Dice / F1 */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold text-sky-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              Dice / F1 Score
            </span>
            <span className="text-[10px] font-mono text-slate-500">2TP/(2TP+FP+FN)</span>
          </div>
          <div className="text-2xl font-extrabold font-mono text-white tracking-tight">
            {(dice * 100).toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Ratio: <span className="font-mono text-sky-300">{dice.toFixed(4)}</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-sky-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${dice * 100}%` }}
            />
          </div>
        </div>

        {/* 3. Precision */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold text-indigo-400 flex items-center gap-1">
              <Target className="w-3.5 h-3.5" />
              Precision
            </span>
            <span className="text-[10px] font-mono text-slate-500">TP/(TP+FP)</span>
          </div>
          <div className="text-2xl font-extrabold font-mono text-white tracking-tight">
            {(precision * 100).toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Low false alarms (FP)
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${precision * 100}%` }}
            />
          </div>
        </div>

        {/* 4. Recall */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold text-amber-400 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              Recall
            </span>
            <span className="text-[10px] font-mono text-slate-500">TP/(TP+FN)</span>
          </div>
          <div className="text-2xl font-extrabold font-mono text-white tracking-tight">
            {(recall * 100).toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Few missed buildings (FN)
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${recall * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Class Imbalance Warning & Explanation (Section 11 & 12) */}
      <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="font-semibold text-slate-200">
              Class Imbalance Distribution (Section 11):
            </span>
          </div>
          <div className="text-slate-400 text-[11px]">
            Building Pixels: <strong className="text-emerald-400 font-mono">{buildingPercentageTrue.toFixed(1)}%</strong> vs Background:{' '}
            <strong className="text-slate-300 font-mono">{(100 - buildingPercentageTrue).toFixed(1)}%</strong>
          </div>
        </div>

        {/* Imbalance visual bar */}
        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex border border-slate-700">
          <div
            className="bg-emerald-500 h-full transition-all"
            style={{ width: `${buildingPercentageTrue}%` }}
            title={`Building: ${buildingPercentageTrue.toFixed(1)}%`}
          />
          <div
            className="bg-slate-700 h-full transition-all"
            style={{ width: `${100 - buildingPercentageTrue}%` }}
            title={`Background: ${(100 - buildingPercentageTrue).toFixed(1)}%`}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs text-slate-400">
          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
            <span className="text-amber-300 font-semibold block mb-0.5">
              Why Raw Pixel Accuracy is Deceptive ({(accuracy * 100).toFixed(1)}%):
            </span>
            <p className="text-[11px] leading-relaxed text-slate-400">
              If a naive model predicted "0 (Background)" everywhere, it would achieve{' '}
              <span className="text-slate-200 font-mono">{(100 - buildingPercentageTrue).toFixed(1)}%</span> accuracy while detecting zero buildings! This is why <strong>IoU</strong> is the decisive metric.
            </p>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
            <span className="text-sky-300 font-semibold block mb-0.5">
              Intersection over Union (IoU) Objective:
            </span>
            <p className="text-[11px] leading-relaxed text-slate-400">
              IoU strictly computes <span className="font-mono text-slate-200">TP / (TP + FP + FN)</span> across target footprint pixels. By penalizing false positives and false negatives directly on the building structure, it prevents trivial background bias from corrupting model assessment.
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Confusion Pixel Breakdown */}
      <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5">
        <h4 className="text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
          <span>Pixel-Level Confusion Matrix (Total: {confusion.totalPixels.toLocaleString()} px)</span>
          <span className="text-[10px] text-slate-500 font-normal">Section 15 & 16 Error Breakdown</span>
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="bg-slate-900 p-2.5 rounded-lg border border-emerald-500/20">
            <div className="text-[10px] text-slate-400">True Positives (TP)</div>
            <div className="text-base font-bold font-mono text-emerald-400">
              {confusion.tp.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500">Correctly detected roofs</div>
          </div>

          <div className="bg-slate-900 p-2.5 rounded-lg border border-sky-500/20">
            <div className="text-[10px] text-slate-400">False Positives (FP)</div>
            <div className="text-base font-bold font-mono text-sky-400">
              {confusion.fp.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500">Pavement/Tree confusion</div>
          </div>

          <div className="bg-slate-900 p-2.5 rounded-lg border border-red-500/20">
            <div className="text-[10px] text-slate-400">False Negatives (FN)</div>
            <div className="text-base font-bold font-mono text-red-400">
              {confusion.fn.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500">Missed roof pixels</div>
          </div>

          <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-400">True Negatives (TN)</div>
            <div className="text-base font-bold font-mono text-slate-300">
              {confusion.tn.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500">Correct background pixels</div>
          </div>
        </div>
      </div>
    </div>
  );
};
