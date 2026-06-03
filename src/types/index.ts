import type { Node, Edge } from '@xyflow/react';

// ─── Voltage tiers ────────────────────────────────────────────────────────────
export type VoltageTier = 'ULV'|'LV'|'MV'|'HV'|'EV'|'IV'|'LUV'|'ZPM'|'UV'|'UHV';
export const VOLTAGE_TIERS: VoltageTier[] = ['ULV','LV','MV','HV','EV','IV','LUV','ZPM','UV','UHV'];
export const VOLTAGE_VALUES: Record<VoltageTier,number> = {
  ULV:8,LV:32,MV:128,HV:512,EV:2048,IV:8192,LUV:32768,ZPM:131072,UV:524288,UHV:2097152
};
export function getTierIndex(tier: VoltageTier): number { return VOLTAGE_TIERS.indexOf(tier); }

// ─── Recipe / Machine templates ───────────────────────────────────────────────
export interface ItemIO {
  itemName: string;
  amount: number;
  /** 0-100 percentage */
  probability: number;
}

export interface RecipeTemplate {
  id: string;
  name: string;
  machineTypeId: string;
  duration: number;
  baseTier: VoltageTier;
  inputs: ItemIO[];
  outputs: ItemIO[];
}

export interface MachineType {
  id: string;
  name: string;
  description: string;
  defaultTier: VoltageTier;
  supportsParallel: boolean;
  perfectOC: boolean;
}

// ─── Node data ────────────────────────────────────────────────────────────────
export interface SourceOutput {
  itemName: string;
  amount: number;
  /** 0-100 */
  probability: number;
  interval: number;
}

export interface MachineNodeConfig {
  machineTypeId: string;
  voltageTier: VoltageTier;
  parallelCount: number;
  selectedRecipeId: string | null;
  count: number;
}

export interface CalculationResult {
  inputRates:  { itemName: string; rate: number }[];
  outputRates: { itemName: string; rate: number }[];
  effectiveDuration: number;
  machinesNeeded: number;
  utilization: number;
  isBottleneck: boolean;
}

export type CustomNodeData =
  | { type: 'source';  config: { outputs: SourceOutput[] }; calculation?: CalculationResult }
  | { type: 'machine'; config: MachineNodeConfig;           calculation?: CalculationResult }
  | { type: 'output';                                       calculation?: CalculationResult };

export type CustomNode = Node<CustomNodeData>;
export type CustomEdge = Edge;
