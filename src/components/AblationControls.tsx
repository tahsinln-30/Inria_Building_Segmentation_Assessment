import React from 'react';
import { Sliders, Cpu, Zap, Sparkles, CheckCircle2, ArrowDown, Activity, Loader2, Layers } from 'lucide-react';
import { AblationModelId, SegmentationResult } from '../types';
import { ABLATION_MODELS } from '../data/sampleImages';

interface AblationControlsProps {
  selectedModelId: AblationModelId;
  onSelectModel: (id: AblationModelId) => void;
  threshold: number;
  onThresholdChange: (threshold: number) => void;
  patchSize: number;
  morphologicalClean: boolean;
  onToggleMorphological: () => void;
  onRunInference: () => void;
  isLoading: boolean;
  result?: SegmentationResult | null;
}

export const AblationControls: React.FC<AblationControlsProps> = ({
  selectedModelId,
  onSelectModel,
  threshold,
  onThresholdChange,
  patchSize,
  morphologicalClean,
  onToggleMorphological,
  onRunInference,
  isLoading,
  result
}) => {
  const currentModel = ABLATION_MODELS.find((m) => m.id === selectedModelId) || ABLATION_MODELS[2];

  const handleScrollToVisualizer = () => {
    const el = document.getElementById('section-visualizer');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Determine threshold impact explanation
  const getThresholdImpact = () => {
    if (threshold < 0.40) {
      return {
        label: 'High Sensitivity (Recall Bias)',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        detail: 'Lower confidence cutoff detects fainter, smaller, or tree-shadowed buildings. Increases total identified structures, but may pick up reflective road pavement.'
      };
    } else if (threshold > 0.60) {
      return {
        label: 'High Precision (Strict Filter)',
        badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        detail: 'Strictest confidence filter eliminates false alarms on pavement and open ground. Guarantees razor-sharp roof cores, but may omit faint outbuildings.'
      };
    }
    return {
      label: 'Balanced Operating Point',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      detail: 'Standard 0.50 probability cutoff provides optimal balance between high precision (clean edges) and high recall (detecting every structure).'
    };
  };

  const thresholdImpact = getThresholdImpact();

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            2. Model Architecture & Ablation Experiments
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Compare loss formulation experiments: BCE vs Dice vs Boundary Loss.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Architecture:</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-300 font-mono font-medium border border-slate-700">
            U-Net (Encoder + Skip + Decoder)
          </span>
        </div>
      </div>

      {/* Ablation Models Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {ABLATION_MODELS.map((model) => {
          const isSelected = model.id === selectedModelId;

          return (
            <button
              key={model.id}
              id={`model-${model.id}`}
              onClick={() => onSelectModel(model.id)}
              disabled={isLoading}
              className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between h-full ${
                isSelected
                  ? 'bg-slate-800/90 border-emerald-500 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500'
                  : 'bg-slate-950/40 hover:bg-slate-800/50 border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-bold text-xs text-white">{model.shortName}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono border ${model.badgeColor}`}>
                    IoU ~{model.expectedValidationIoU.toFixed(3)}
                  </span>
                </div>

                <p className="text-[11px] font-mono text-slate-400 mb-2">
                  {model.lossFunction}
                </p>

                <p className="text-[11px] text-slate-400 line-clamp-3 leading-relaxed">
                  {model.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                <span className="text-slate-500">Wall Boundary:</span>
                <span className={`font-medium ${
                  model.boundaryQuality.includes('Crisp') ? 'text-emerald-400' :
                  model.boundaryQuality.includes('Medium') ? 'text-sky-400' : 'text-amber-400'
                }`}>
                  {model.boundaryQuality}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Threshold & Fine-Tuning Controls */}
      <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3.5 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
        
        {/* Decision Threshold Slider */}
        <div className="sm:col-span-2 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="threshold-slider" className="font-medium text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span>Probability Decision Threshold (τ):</span>
            </label>
            <span className="font-mono font-bold text-indigo-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              {threshold.toFixed(2)}
            </span>
          </div>

          <input
            id="threshold-slider"
            type="range"
            min="0.10"
            max="0.90"
            step="0.02"
            value={threshold}
            onChange={(e) => onThresholdChange(parseFloat(e.target.value))}
            className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />

          <div className="flex items-center justify-between text-[10px] text-slate-500">
            <span>← High Sensitivity (τ = 0.10, more buildings detected)</span>
            <span>Balanced (0.50)</span>
            <span>High Precision (τ = 0.90, fewer false alarms) →</span>
          </div>
        </div>

        {/* Patch details & Re-run Action with Loader */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
          <div className="text-[11px] text-slate-400 text-right">
            <span className="text-slate-500">GPU Patch Window:</span>{' '}
            <span className="font-mono text-sky-400 font-semibold">{patchSize}×{patchSize} px</span>
          </div>

          <button
            id="btn-recompute-inference"
            onClick={onRunInference}
            disabled={isLoading}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs shadow-lg transition-all cursor-pointer min-w-[175px] ${
              isLoading
                ? 'bg-emerald-700/80 text-white cursor-wait ring-2 ring-emerald-400/50 shadow-emerald-950/60 animate-pulse'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950 hover:shadow-emerald-900/40 hover:scale-[1.02] active:scale-[0.98]'
            }`}
            title="Execute segmentation model across 256x256 tiles with current parameters"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 text-emerald-200 animate-spin shrink-0" />
                <span>Processing Patches...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-emerald-200 fill-emerald-200 shrink-0" />
                <span>Re-run Inference</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Live Impact Showcase - Clearly explains the effect for the user */}
      <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Impact of Current Settings on Results
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {isLoading ? (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 text-[11px] font-medium border border-amber-500/30 flex items-center gap-1.5 animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Computing live 256×256 tiles...</span>
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[11px] font-medium border border-emerald-500/30 flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Results Up to Date ({result?.inferenceTimeMs ?? 225}ms)</span>
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {/* 1. Model Impact Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Model Pipeline Impact:</span>
              <span className="font-semibold text-emerald-300 font-mono text-[11px]">
                {currentModel.shortName}
              </span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {currentModel.id === 'exp_c_bce_dice_boundary' && (
                <span>
                  <strong className="text-emerald-400 font-semibold">Active Boundary Loss</strong> penalizes Hausdorff distance, creating sharp 90° roof corners and crisp wall edges (+13.4% boundary accuracy over baseline).
                </span>
              )}
              {currentModel.id === 'exp_b_bce_dice' && (
                <span>
                  <strong className="text-sky-400 font-semibold">Soft Dice Loss</strong> focuses on the minority building class (~10% of scene). Suppresses false negatives and catches missed buildings, with slightly rounded corners.
                </span>
              )}
              {currentModel.id === 'exp_a_bce' && (
                <span>
                  <strong className="text-amber-400 font-semibold">Baseline BCE Loss</strong> evaluates pixels independently without edge awareness. Edges appear softened or blurred, and small shed roofs may be missed.
                </span>
              )}
            </p>
          </div>

          {/* 2. Threshold Impact Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Decision Threshold Impact (τ = {threshold.toFixed(2)}):</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${thresholdImpact.badgeColor}`}>
                {thresholdImpact.label}
              </span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {thresholdImpact.detail}
            </p>
          </div>
        </div>

        {/* Real-Time Live Results Feedback Bar */}
        {result && (
          <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 flex-wrap text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Detected: <strong className="text-white font-mono">{result.detectedBuildingCount} structures</strong></span>
              </span>
              <span className="text-slate-600">•</span>
              <span>Building Footprint: <strong className="text-emerald-300 font-mono">{result.buildingPercentage.toFixed(1)}%</strong></span>
              <span className="text-slate-600">•</span>
              <span>Expected IoU: <strong className="text-indigo-300 font-mono">~{(currentModel.expectedValidationIoU * 100).toFixed(1)}%</strong></span>
            </div>

            <button
              type="button"
              onClick={handleScrollToVisualizer}
              className="text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1 cursor-pointer self-start sm:self-auto hover:underline"
            >
              <span>View Visualizer & Error Map</span>
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
