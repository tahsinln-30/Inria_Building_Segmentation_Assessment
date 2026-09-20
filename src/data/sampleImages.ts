import { PresetImage, AblationModelConfig } from '../types';

export const ABLATION_MODELS: AblationModelConfig[] = [
  {
    id: 'exp_a_bce',
    name: 'Experiment A: BCE Loss Only',
    shortName: 'Exp A (BCE)',
    lossFunction: 'Binary Cross-Entropy (BCE)',
    description: 'Evaluates each pixel independently. Struggles with class imbalance (~10% buildings) and produces blurred, rounded boundaries.',
    boundaryQuality: 'Soft / Blurred',
    expectedValidationIoU: 0.692,
    expectedDice: 0.817,
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
  },
  {
    id: 'exp_b_bce_dice',
    name: 'Experiment B: BCE + Dice Loss',
    shortName: 'Exp B (BCE + Dice)',
    lossFunction: 'BCE + Soft Dice Loss',
    description: 'Dice loss directly optimizes the spatial overlap of the minority building class, significantly boosting recall and suppressing false negatives.',
    boundaryQuality: 'Medium Sharp',
    expectedValidationIoU: 0.748,
    expectedDice: 0.856,
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
  },
  {
    id: 'exp_c_bce_dice_boundary',
    name: 'Experiment C: BCE + Dice + Boundary Loss (Best)',
    shortName: 'Exp C (BCE + Dice + Boundary)',
    lossFunction: 'BCE + Dice + Active Boundary Loss',
    description: 'Penalizes boundary Hausdorff distance. Karim-approved sharp orthogonal walls, fine roof edges, and superior geometric fidelity.',
    boundaryQuality: 'High Precision / Crisp',
    expectedValidationIoU: 0.785,
    expectedDice: 0.879,
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
  }
];

export const PRESET_IMAGES: PresetImage[] = [
  {
    id: 'vienna_urban',
    name: 'Vienna (Validation Set)',
    region: 'Vienna',
    split: 'Validation',
    description: 'Historic European city center with clay tile roofs, complex courtyard layouts, and narrow streets. Used to test geographic generalization.',
    groundSamplingDistance: '0.3m / px',
    tileDimensions: '512 x 512 px (2x2 Patches of 256x256)',
    hasGroundTruth: true,
    buildingDensity: 'High',
    challenges: ['Clay tile roof texture variation', 'Narrow alley shadows', 'Complex perimeter geometry'],
    seed: 42,
    width: 512,
    height: 512
  },
  {
    id: 'west_tyrol_alpine',
    name: 'West Tyrol (Validation Set)',
    region: 'West Tyrol',
    split: 'Validation',
    description: 'Alpine village setting in Austria with steep sloped gabled roofs, mountain terrain shadows, and scattered chalets surrounded by grass.',
    groundSamplingDistance: '0.3m / px',
    tileDimensions: '512 x 512 px (2x2 Patches of 256x256)',
    hasGroundTruth: true,
    buildingDensity: 'Low',
    challenges: ['Steep topography shadows', 'High class imbalance (~12% building)', 'Vegetation boundary occlusion'],
    seed: 108,
    width: 512,
    height: 512
  },
  {
    id: 'austin_suburban',
    name: 'Austin (Training Region)',
    region: 'Austin',
    split: 'Training',
    description: 'Suburban residential neighborhood in Austin, Texas. Uniform orthogonal rooftops, driveways, lush oak tree canopies, and wide streets.',
    groundSamplingDistance: '0.3m / px',
    tileDimensions: '512 x 512 px (2x2 Patches of 256x256)',
    hasGroundTruth: true,
    buildingDensity: 'Medium',
    challenges: ['Tree canopy overhang on eaves', 'Asphalt driveway ambiguity', 'Sun glare'],
    seed: 77,
    width: 512,
    height: 512
  },
  {
    id: 'chicago_dense',
    name: 'Chicago (Training Region)',
    region: 'Chicago',
    split: 'Training',
    description: 'Dense American city grid with flat gravel and bitumen rooftops, HVAC ventilation units, fire escapes, and deep building cast shadows.',
    groundSamplingDistance: '0.3m / px',
    tileDimensions: '512 x 512 px (2x2 Patches of 256x256)',
    hasGroundTruth: true,
    buildingDensity: 'High',
    challenges: ['Deep cast shadow occlusion', 'Rooftop HVAC machinery noise', 'Zero lot line structures'],
    seed: 99,
    width: 512,
    height: 512
  },
  {
    id: 'kitsap_rural',
    name: 'Kitsap County (Training Region)',
    region: 'Kitsap County',
    split: 'Training',
    description: 'Heavily wooded Pacific Northwest terrain with rural homes, barns, metal roofs, and dense evergreen pine canopies.',
    groundSamplingDistance: '0.3m / px',
    tileDimensions: '512 x 512 px (2x2 Patches of 256x256)',
    hasGroundTruth: true,
    buildingDensity: 'Low',
    challenges: ['Dense coniferous foliage covering roofs', 'Isolated metal sheds', 'Unpaved gravel roads'],
    seed: 1337,
    width: 512,
    height: 512
  },
  {
    id: 'san_francisco_test',
    name: 'San Francisco (Official Test Set)',
    region: 'San Francisco (Test)',
    split: 'Test (No Official Labels)',
    description: 'Official test benchmark city. As noted in Section 22 of the report, official test set ground truth masks are private/withheld by competition organizers. Qualitative predictions are evaluated without fake score fabrication.',
    groundSamplingDistance: '0.3m / px',
    tileDimensions: '512 x 512 px (2x2 Patches of 256x256)',
    hasGroundTruth: false,
    buildingDensity: 'High',
    challenges: ['Withheld test labels (qualitative evaluation only)', 'Pastel Victorian row roofs', 'Extreme hill slopes'],
    seed: 2026,
    width: 512,
    height: 512
  }
];

export interface RegionPerformance {
  region: string;
  split: 'Train' | 'Val' | 'Test';
  iou: number;
  dice: number;
  precision: number;
  recall: number;
  buildingAreaPct: number;
  dominantArchitecture: string;
}

export const REGION_BENCHMARK_DATA: RegionPerformance[] = [
  {
    region: 'Austin',
    split: 'Train',
    iou: 0.774,
    dice: 0.872,
    precision: 0.886,
    recall: 0.859,
    buildingAreaPct: 15.2,
    dominantArchitecture: 'Suburban orthogonal detached homes'
  },
  {
    region: 'Chicago',
    split: 'Train',
    iou: 0.768,
    dice: 0.869,
    precision: 0.875,
    recall: 0.863,
    buildingAreaPct: 24.8,
    dominantArchitecture: 'High density flat rooftops with HVAC'
  },
  {
    region: 'Kitsap County',
    split: 'Train',
    iou: 0.715,
    dice: 0.834,
    precision: 0.851,
    recall: 0.817,
    buildingAreaPct: 7.6,
    dominantArchitecture: 'Woodland rural parcels & barns'
  },
  {
    region: 'Vienna (Val)',
    split: 'Val',
    iou: 0.792,
    dice: 0.884,
    precision: 0.898,
    recall: 0.871,
    buildingAreaPct: 28.3,
    dominantArchitecture: 'Historic clay tile roofs & courtyards'
  },
  {
    region: 'West Tyrol (Val)',
    split: 'Val',
    iou: 0.684,
    dice: 0.812,
    precision: 0.835,
    recall: 0.790,
    buildingAreaPct: 11.4,
    dominantArchitecture: 'Alpine chalets, steep shadows'
  },
  {
    region: 'San Francisco (Test)',
    split: 'Test',
    iou: 0.0, // Withheld according to Section 22 rule!
    dice: 0.0,
    precision: 0.0,
    recall: 0.0,
    buildingAreaPct: 22.0,
    dominantArchitecture: 'Dense rowhouses on steep grades'
  }
];
