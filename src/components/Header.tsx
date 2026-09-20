import React from 'react';
import { Layers, MapPin } from 'lucide-react';

interface HeaderProps {
  onToggleGeneralization: () => void;
  showGeneralization: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleGeneralization,
  showGeneralization
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        
        {/* Project Branding */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-sky-600 to-emerald-500 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Layers className="w-5 h-5 text-sky-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold text-white tracking-tight">
                Aerial Building Segmentation Studio
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                Inria Benchmark
              </span>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                U-Net Live Test
              </span>
            </div>
            <p className="text-xs text-slate-400">
              High-Resolution 0.3m GSD • 256×256 Tiled Inference • BCE + Dice + Boundary Loss
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="btn-toggle-generalization"
            onClick={onToggleGeneralization}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg border transition-colors shadow-sm cursor-pointer ${
              showGeneralization
                ? 'bg-sky-500/20 text-sky-200 border-sky-500/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700/60'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-sky-400" />
            <span>Region Benchmark & Spatial Leakage Protocol</span>
          </button>
        </div>

      </div>
    </header>
  );
};
