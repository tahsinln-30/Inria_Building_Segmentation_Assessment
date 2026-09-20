import React from 'react';
import { Sliders, Cpu, Zap, ShieldAlert, Sparkles, Filter } from 'lucide-react';
import { AblationModelId } from '../types';
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
  isLoading
}) => {
  const currentModel = ABLATION_MODELS.find((m) => m.id === selectedModelId) || ABLATION_MODELS[2];

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
            Compare loss formulation experiments (Report Sections 20 & 21: BCE vs Dice vs Boundary Loss).
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
            <span>← High Recall (τ = 0.10, more buildings detected)</span>
            <span>Balanced (0.50)</span>
            <span>High Precision (τ = 0.90, fewer false alarms) →</span>
          </div>
        </div>

        {/* Patch details & Run Action */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
          <div className="text-[11px] text-slate-400 text-right">
            <span className="text-slate-500">GPU Patch Window:</span>{' '}
            <span className="font-mono text-sky-400 font-semibold">{patchSize}×{patchSize} px</span>
          </div>

          <button
            id="btn-recompute-inference"
            onClick={onRunInference}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-950 transition-all cursor-pointer disabled:opacity-50"
          >
            <Zap className="w-4 h-4 text-emerald-200 fill-emerald-200" />
            <span>{isLoading ? 'Running U-Net...' : 'Re-run Inference'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
