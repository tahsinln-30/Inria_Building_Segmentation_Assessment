import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { AblationControls } from './components/AblationControls';
import { ViewerComparison } from './components/ViewerComparison';
import { MetricsPanel } from './components/MetricsPanel';
import { GeographicGeneralization } from './components/GeographicGeneralization';
import { PRESET_IMAGES } from './data/sampleImages';
import { generateAerialPreset } from './services/imageGenerator';
import { runSegmentationInference } from './services/segmentationEngine';
import { AblationModelId, PresetImage, SegmentationResult } from './types';

export default function App() {
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>('vienna_urban');
  const [selectedModelId, setSelectedModelId] = useState<AblationModelId>('exp_c_bce_dice_boundary');
  const [threshold, setThreshold] = useState<number>(0.50);
  const [patchSize, setPatchSize] = useState<number>(256);
  const [morphologicalClean, setMorphologicalClean] = useState<boolean>(true);
  const [segmentationResult, setSegmentationResult] = useState<SegmentationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [regionName, setRegionName] = useState<string>('Vienna');
  const [hasGroundTruth, setHasGroundTruth] = useState<boolean>(true);

  // Generalization panel toggle
  const [showGeneralization, setShowGeneralization] = useState<boolean>(true);

  // Image references for fast re-inference on threshold/model change
  const currentRgbImgRef = useRef<HTMLImageElement | null>(null);
  const currentGtImgRef = useRef<HTMLImageElement | null>(null);

  // Core inference trigger
  const executeInference = useCallback(async (
    rgbImg: HTMLImageElement,
    gtImg: HTMLImageElement | null,
    modelId: AblationModelId,
    thresh: number
  ) => {
    setIsLoading(true);
    try {
      const res = await runSegmentationInference(rgbImg, gtImg, {
        threshold: thresh,
        modelId,
        patchSize: 256,
        morphologicalClean
      });
      setSegmentationResult(res);
    } catch (err) {
      console.error('Segmentation error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [morphologicalClean]);

  // Load a preset image
  const loadPreset = useCallback((preset: PresetImage) => {
    setSelectedPresetId(preset.id);
    setRegionName(preset.region);
    setHasGroundTruth(preset.hasGroundTruth);
    setIsLoading(true);

    const payload = generateAerialPreset(preset);

    const rgbImg = new Image();
    rgbImg.crossOrigin = 'anonymous';
    rgbImg.onload = () => {
      currentRgbImgRef.current = rgbImg;

      if (payload.gtDataUrl) {
        const gtImg = new Image();
        gtImg.crossOrigin = 'anonymous';
        gtImg.onload = () => {
          currentGtImgRef.current = gtImg;
          executeInference(rgbImg, gtImg, selectedModelId, threshold);
        };
        gtImg.src = payload.gtDataUrl;
      } else {
        currentGtImgRef.current = null;
        executeInference(rgbImg, null, selectedModelId, threshold);
      }
    };
    rgbImg.src = payload.rgbDataUrl;
  }, [executeInference, selectedModelId, threshold]);

  // Initial load
  useEffect(() => {
    const initialPreset = PRESET_IMAGES.find((p) => p.id === 'vienna_urban') || PRESET_IMAGES[0];
    loadPreset(initialPreset);
  }, []);

  // Handle preset selection click
  const handleSelectPreset = (preset: PresetImage) => {
    loadPreset(preset);
  };

  // Handle custom uploaded image
  const handleCustomImageUpload = (imageFile: File, gtFile?: File | null) => {
    setSelectedPresetId(null);
    setRegionName(imageFile.name.replace(/\.[^/.]+$/, ''));
    setHasGroundTruth(!!gtFile);
    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const rgbUrl = e.target?.result as string;
      const rgbImg = new Image();
      rgbImg.onload = () => {
        currentRgbImgRef.current = rgbImg;

        if (gtFile) {
          const gtReader = new FileReader();
          gtReader.onload = (gtE) => {
            const gtUrl = gtE.target?.result as string;
            const gtImg = new Image();
            gtImg.onload = () => {
              currentGtImgRef.current = gtImg;
              executeInference(rgbImg, gtImg, selectedModelId, threshold);
            };
            gtImg.src = gtUrl;
          };
          gtReader.readAsDataURL(gtFile);
        } else {
          currentGtImgRef.current = null;
          executeInference(rgbImg, null, selectedModelId, threshold);
        }
      };
      rgbImg.src = rgbUrl;
    };
    reader.readAsDataURL(imageFile);
  };

  // Model selection change
  const handleSelectModel = (modelId: AblationModelId) => {
    setSelectedModelId(modelId);
    if (currentRgbImgRef.current) {
      executeInference(currentRgbImgRef.current, currentGtImgRef.current, modelId, threshold);
    }
  };

  // Threshold change
  const handleThresholdChange = (newThreshold: number) => {
    setThreshold(newThreshold);
    if (currentRgbImgRef.current) {
      executeInference(currentRgbImgRef.current, currentGtImgRef.current, selectedModelId, newThreshold);
    }
  };

  // Manual re-run
  const handleRunInference = () => {
    if (currentRgbImgRef.current) {
      executeInference(currentRgbImgRef.current, currentGtImgRef.current, selectedModelId, threshold);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation & Status Bar */}
      <Header
        onToggleGeneralization={() => setShowGeneralization(!showGeneralization)}
        showGeneralization={showGeneralization}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        
        {/* Step 1: Image Selector / Uploader */}
        <ImageUploader
          selectedPresetId={selectedPresetId}
          onSelectPreset={handleSelectPreset}
          onCustomImageUpload={handleCustomImageUpload}
          isLoading={isLoading}
        />

        {/* Step 2: Ablation Experiments & Controls */}
        <AblationControls
          selectedModelId={selectedModelId}
          onSelectModel={handleSelectModel}
          threshold={threshold}
          onThresholdChange={handleThresholdChange}
          patchSize={patchSize}
          morphologicalClean={morphologicalClean}
          onToggleMorphological={() => setMorphologicalClean(!morphologicalClean)}
          onRunInference={handleRunInference}
          isLoading={isLoading}
        />

        {/* Step 3: Qualitative Visualizer & Error Map */}
        <ViewerComparison
          result={segmentationResult}
          patchSize={patchSize}
          isLoading={isLoading}
        />

        {/* Step 4: Quantitative Evaluation Metrics & Class Imbalance */}
        <MetricsPanel
          metrics={segmentationResult?.metrics || null}
          hasGroundTruth={hasGroundTruth}
          regionName={regionName}
        />

        {/* Step 5: Geographic Generalization & Spatial Leakage Protocol */}
        {showGeneralization && (
          <GeographicGeneralization />
        )}

      </main>

      {/* Subtle Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Inria Aerial Image Labeling Benchmark • Semantic Segmentation Testing Studio</span>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>U-Net (BCE + Dice + Boundary Loss)</span>
            <span>•</span>
            <span>0.3m GSD</span>
            <span>•</span>
            <span>Spatial Leakage Protected</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
