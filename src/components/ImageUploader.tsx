import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, CheckCircle, AlertTriangle, ShieldCheck, MapPin } from 'lucide-react';
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
  const [customGtNeeded, setCustomGtNeeded] = useState(false);
  const [pendingCustomImage, setPendingCustomImage] = useState<File | null>(null);
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
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onCustomImageUpload(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (customGtNeeded) {
        setPendingCustomImage(file);
      } else {
        onCustomImageUpload(file);
      }
    }
  };

  const handleGtFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && pendingCustomImage) {
      const gtFile = e.target.files[0];
      onCustomImageUpload(pendingCustomImage, gtFile);
      setPendingCustomImage(null);
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
            Choose from the Inria Aerial Image Labeling benchmark or supply Karim's drone image.
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
          const isSelected = selectedPresetId === preset.id;
          const isValidation = preset.split === 'Validation';
          const isTest = preset.split.includes('Test');

          return (
            <button
              key={preset.id}
              id={`preset-${preset.id}`}
              onClick={() => onSelectPreset(preset)}
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
                  {preset.hasGroundTruth ? 'GT Mask Included' : 'No Official Mask'}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom Upload Box */}
      <div className="pt-1">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors cursor-pointer ${
            isDragging
              ? 'border-indigo-400 bg-indigo-500/10'
              : 'border-slate-800 hover:border-slate-700 bg-slate-950/30'
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
            <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
              <Upload className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-200">
                Drop your aerial / drone image here, or <span className="text-indigo-400 underline">browse</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Supports PNG, JPG, WebP. Automatically partitioned into 256×256 patch tiles for inference.
              </p>
            </div>
          </div>
        </div>

        {/* Custom Ground Truth Upload Option */}
        <div className="mt-2.5 flex items-center justify-between text-xs px-1 text-slate-400">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={customGtNeeded}
              onChange={(e) => setCustomGtNeeded(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-indigo-500 focus:ring-0 w-3.5 h-3.5"
            />
            <span>I have a Ground Truth mask file (Binary 0 / 255 PNG) for my custom image</span>
          </label>

          {pendingCustomImage && (
            <button
              onClick={() => gtInputRef.current?.click()}
              className="text-xs text-amber-400 underline hover:text-amber-300 font-medium"
            >
              Select Ground Truth mask for "{pendingCustomImage.name}"
            </button>
          )}

          <input
            type="file"
            ref={gtInputRef}
            onChange={handleGtFileChange}
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
};
