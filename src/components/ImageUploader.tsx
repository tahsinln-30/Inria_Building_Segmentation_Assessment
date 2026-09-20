import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, CheckCircle, CheckCircle2, ShieldCheck, HelpCircle, X, RefreshCw } from 'lucide-react';
import { PresetImage } from '../types';
import { PRESET_IMAGES } from '../data/sampleImages';

interface ImageUploaderProps {
  selectedPresetId: string | null;
  onSelectPreset: (preset: PresetImage) => void;
  onCustomImageUpload: (imageFile: File, gtFile?: File | null) => void;
  isLoading: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  selectedPresetId,
  onSelectPreset,
  onCustomImageUpload,
  isLoading
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showAdvancedGt, setShowAdvancedGt] = useState(false);
  const [activeCustomImage, setActiveCustomImage] = useState<File | null>(null);
  const [activeGtName, setActiveGtName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const gtInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      if (files.length >= 2) {
        const imageFile = files.find(f => !f.name.toLowerCase().includes('mask') && !f.name.toLowerCase().includes('gt')) || files[0];
        const gtFile = files.find(f => f !== imageFile) || null;
        setActiveCustomImage(imageFile);
        if (gtFile) setActiveGtName(gtFile.name);
        onCustomImageUpload(imageFile, gtFile);
      } else {
        const file = files[0];
        if (file.type.startsWith('image/')) {
          setActiveCustomImage(file);
          setActiveGtName(null);
          onCustomImageUpload(file);
        }
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setActiveCustomImage(file);
      setActiveGtName(null);
      // Immediately process the uploaded aerial image!
      onCustomImageUpload(file);
    }
  };

  const handleGtFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const gtFile = e.target.files[0];
      setActiveGtName(gtFile.name);
      if (activeCustomImage) {
        onCustomImageUpload(activeCustomImage, gtFile);
      }
    }
  };

  const handlePresetClick = (preset: PresetImage) => {
    setActiveCustomImage(null);
    setActiveGtName(null);
    setShowAdvancedGt(false);
    onSelectPreset(preset);
  };

  const handleRemoveCustomImage = () => {
    setActiveCustomImage(null);
    setActiveGtName(null);
    setShowAdvancedGt(false);
    onSelectPreset(PRESET_IMAGES[0]);
  };

  const handleRemoveGtMask = () => {
    setActiveGtName(null);
    if (activeCustomImage) {
      onCustomImageUpload(activeCustomImage, null);
    }
  };

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-sky-400" />
            1. Select Aerial Imagery or Upload
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Choose from the Inria Aerial Image Labeling benchmark or supply custom aerial imagery.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Benchmark GSD:</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-sky-300 font-mono font-medium border border-slate-700">
            0.3 meter / pixel
          </span>
        </div>
      </div>

      {/* Preset Selector Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {PRESET_IMAGES.map((preset) => {
          const isSelected = selectedPresetId === preset.id && !activeCustomImage;
          const isValidation = preset.split === 'Validation';
          const isTest = preset.split.includes('Test');

          return (
            <button
              key={preset.id}
              id={`preset-${preset.id}`}
              onClick={() => handlePresetClick(preset)}
              disabled={isLoading}
              className={`text-left p-2.5 rounded-xl border transition-all relative flex flex-col justify-between h-28 group cursor-pointer ${
                isSelected
                  ? 'bg-indigo-950/60 border-indigo-500 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500'
                  : 'bg-slate-800/40 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${
                      isValidation
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        : isTest
                        ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                        : 'bg-slate-700/60 text-slate-300'
                    }`}
                  >
                    {isValidation ? 'Val' : isTest ? 'Test' : 'Train'}
                  </span>
                  {isSelected && <CheckCircle className="w-3.5 h-3.5 text-indigo-400" />}
                </div>

                <div className="font-semibold text-xs text-slate-100 group-hover:text-sky-300 transition-colors truncate">
                  {preset.region}
                </div>
              </div>

              <div className="text-[10px] text-slate-400 space-y-0.5">
                <div className="flex items-center gap-1 text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                  <span>{preset.buildingDensity} Density</span>
                </div>
                <div className="text-[9px] text-slate-500 truncate">
                  GT Mask Available
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom Upload Box */}
      <div className="pt-1 space-y-3">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors cursor-pointer relative overflow-hidden ${
            isDragging
              ? 'border-emerald-400 bg-emerald-500/10'
              : 'border-slate-800 hover:border-emerald-500/50 bg-slate-950/30'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-medium text-[11px] flex items-center gap-1">
                  <span>⚡</span>
                  <span>Automatic Detection: Buildings and terrain are identified immediately upon upload</span>
                </span>
              </div>
              <p className="text-xs font-medium text-slate-200">
                Drop your aerial, satellite, or drone photo here, or <span className="text-emerald-400 underline font-semibold">browse files</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Supports PNG, JPG, or WebP. Automatically splits into tiles, detects roofs, and classifies terrain.
              </p>
            </div>
          </div>
        </div>

        {/* User-Friendly Active Uploaded File Card */}
        {activeCustomImage && (
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-emerald-500/40 shadow-md space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-white">Your Image is Active</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Building Detection Finished
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 truncate font-mono mt-0.5 flex items-center gap-2">
                    <span className="truncate max-w-[280px] sm:max-w-md">{activeCustomImage.name}</span>
                    <span className="text-slate-400 font-sans font-normal shrink-0">
                      ({(activeCustomImage.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                  title="Choose a different image file"
                >
                  <Upload className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Change Image</span>
                </button>
                <button
                  type="button"
                  onClick={handleRemoveCustomImage}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium border border-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Reset back to standard preset benchmark images"
                >
                  <RefreshCw className="w-3 h-3 text-slate-400" />
                  <span>Use Sample Images</span>
                </button>
              </div>
            </div>

            {/* Clear, Simple Explanation of Reference Mask (Optional) */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                <span className="text-slate-300 font-medium">Standard Mode:</span>
                <span className="text-slate-400 text-[11px]">
                  AI detects buildings automatically directly from your photo.
                </span>
              </div>

              <div className="flex items-center gap-2">
                {activeGtName ? (
                  <div className="flex items-center gap-1.5 bg-indigo-950/50 border border-indigo-500/30 px-2 py-1 rounded-lg text-indigo-300 text-[11px]">
                    <span className="font-mono truncate max-w-[160px]">Answer Key: {activeGtName}</span>
                    <button
                      type="button"
                      onClick={handleRemoveGtMask}
                      className="text-slate-400 hover:text-red-400 transition-colors ml-1"
                      title="Remove answer key mask"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setShowAdvancedGt(true);
                      gtInputRef.current?.click();
                    }}
                    className="text-[11px] text-sky-400 hover:text-sky-300 hover:underline flex items-center gap-1 cursor-pointer"
                    title="If you have an expert ground-truth mask to calculate accuracy/IoU"
                  >
                    <span>Have an accuracy answer key (mask)? Attach here (optional)</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Hidden file input for optional GT mask */}
        <input
          type="file"
          ref={gtInputRef}
          onChange={handleGtFileChange}
          accept="image/png, image/jpeg, image/webp"
          className="hidden"
        />
      </div>
    </div>
  );
};
