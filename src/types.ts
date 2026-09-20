export type RegionName = 
  | 'Austin'
  | 'Chicago'
  | 'Kitsap County'
  | 'Vienna'
  | 'West Tyrol'
  | 'San Francisco'
  | 'San Francisco (Test)';

export type SplitType = 'Training' | 'Validation' | 'Test' | 'Test (No Official Labels)';

export type AblationModelId = 'exp_a_bce' | 'exp_b_bce_dice' | 'exp_c_bce_dice_boundary';

export interface AblationModelConfig {
  id: AblationModelId;
  name: string;
  shortName: string;
  lossFunction: string;
  description: string;
  boundaryQuality: 'Soft / Blurred' | 'Medium Sharp' | 'High Precision / Crisp';
  expectedValidationIoU: number;
  expectedDice: number;
  badgeColor: string;
}

export interface PresetImage {
  id: string;
  name: string;
  region: RegionName;
  split: SplitType;
  description: string;
  groundSamplingDistance: string; // e.g., "0.3m / pixel"
  tileDimensions: string; // e.g., "1500 x 1500 px (Cropped to 512x512 patch for live test)"
  hasGroundTruth: boolean;
  buildingDensity: 'Low' | 'Medium' | 'High';
  challenges: string[]; // e.g. ["Tree canopy occlusion", "Cast shadows", "Clay tile roofs"]
  seed: number;
  width: number;
  height: number;
}

export interface ConfusionMatrix {
  tp: number; // True Positive pixels
  fp: number; // False Positive pixels
  fn: number; // False Negative pixels
  tn: number; // True Negative pixels
  totalPixels: number;
}

export interface NotBuildingBreakdown {
  vegetationPct: number;
  roadPavementPct: number;
  otherGroundPct: number;
}

export interface SegmentationMetrics {
  iou: number; // Intersection over Union (Jaccard)
  dice: number; // Dice / F1 Score
  precision: number; // TP / (TP + FP)
  recall: number; // TP / (TP + FN)
  accuracy: number; // (TP + TN) / Total
  buildingPercentageTrue: number; // True class distribution
  buildingPercentagePred: number; // Predicted class distribution
  notBuildingPercentagePred: number; // Non-building predicted class distribution
  buildingPixelCount: number;
  notBuildingPixelCount: number;
  detectedBuildingCount: number;
  notBuildingBreakdown: NotBuildingBreakdown;
  confusion: ConfusionMatrix;
}

export interface SegmentationResult {
  originalDataUrl: string;
  predictionMaskDataUrl: string;
  probabilityHeatmapDataUrl: string;
  buildingDetectionOverlayDataUrl: string;
  groundTruthMaskDataUrl: string | null;
  errorMapDataUrl: string | null;
  metrics: SegmentationMetrics | null;
  detectedBuildingCount: number;
  buildingPercentage: number;
  notBuildingPercentage: number;
  notBuildingBreakdown: NotBuildingBreakdown;
  inferenceTimeMs: number;
  patchCount: number;
  timestamp: number;
}

export type ViewMode = 
  | 'building_vs_not_building'
  | 'side_by_side'
  | 'split_slider'
  | 'overlay'
  | 'error_map'
  | 'patch_grid';
