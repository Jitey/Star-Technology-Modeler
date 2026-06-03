import type { CustomNode, CustomEdge, CustomNodeData, CalculationResult, MachineNodeConfig, VoltageTier } from '../types';
import { getTierIndex, VOLTAGE_TIERS } from '../types';
import { getRecipeById, getRecipesForType, findMatchingRecipes } from '../templates/recipes';
import { MACHINE_TYPES } from '../templates/machineTypes';

// ─── Overclock ────────────────────────────────────────────────────────────────
function ocLevels(machineTier: VoltageTier, recipeTier: VoltageTier): number {
  return Math.max(0, getTierIndex(machineTier) - getTierIndex(recipeTier));
}

function effectiveDuration(duration: number, config: MachineNodeConfig, recipeTier: VoltageTier): number {
  const machineType = MACHINE_TYPES.find(t => t.id === config.machineTypeId);
  const perfect = machineType?.perfectOC ?? false;
  const levels = ocLevels(config.voltageTier, recipeTier);
  const divisor = Math.pow(perfect ? 4 : 2, levels);
  return duration / Math.max(divisor, 0.001);
}

// ─── Incoming flow helper ─────────────────────────────────────────────────────
function getIncomingFlows(nodeId: string, nodes: CustomNode[], edges: CustomEdge[]) {
  const flows: { itemName: string; rate: number }[] = [];
  for (const edge of edges.filter(e => e.target === nodeId)) {
    const src = nodes.find(n => n.id === edge.source);
    if (!src) continue;
    if (src.data.type === 'source') {
      for (const o of src.data.config.outputs) {
        flows.push({ itemName: o.itemName, rate: o.amount * (o.probability / 100) / o.interval });
      }
    } else if (src.data.type === 'machine' && src.data.calculation) {
      for (const r of src.data.calculation.outputRates) flows.push(r);
    }
  }
  return flows;
}

// ─── Main calculation ─────────────────────────────────────────────────────────
export function calculateMachine(
  data: Extract<CustomNodeData, { type: 'machine' }>,
  nodeId: string,
  nodes: CustomNode[],
  edges: CustomEdge[]
): CalculationResult | undefined {
  const config = data.config;
  const recipe = config.selectedRecipeId ? getRecipeById(config.selectedRecipeId) : null;
  if (!recipe) return undefined;

  const incoming = getIncomingFlows(nodeId, nodes, edges);
  const effDuration = effectiveDuration(recipe.duration, config, recipe.baseTier);
  if (effDuration <= 0) return undefined;

  // How many recipes/s can ONE machine do
  const recipesPerSecPerMachine = config.parallelCount / effDuration;

  // How many machines to satisfy each input demand
  const machinesPerInput = recipe.inputs.map(inp => {
    const available = incoming.filter(f => f.itemName === inp.itemName).reduce((s, f) => s + f.rate, 0);
    const demandPerMachine = recipesPerSecPerMachine * inp.amount;
    return demandPerMachine > 0 ? available / demandPerMachine : 0;
  });

  const machinesNeeded = Math.max(1, Math.ceil(Math.max(...machinesPerInput, 0)));
  const bottleneckMachines = Math.max(...machinesPerInput, 0);
  const utilization = machinesNeeded > 0 ? bottleneckMachines / machinesNeeded : 0;

  const totalRecipesPerSec = recipesPerSecPerMachine * machinesNeeded;

  const outputRates = recipe.outputs.map(o => ({
    itemName: o.itemName,
    rate: totalRecipesPerSec * o.amount * (o.probability / 100),
  }));

  const inputRates = recipe.inputs.map(inp => ({
    itemName: inp.itemName,
    rate: incoming.filter(f => f.itemName === inp.itemName).reduce((s, f) => s + f.rate, 0),
  }));

  return { inputRates, outputRates, effectiveDuration: effDuration, machinesNeeded, utilization, isBottleneck: utilization >= 0.99 };
}

// ─── Auto-assign recipe when connecting ──────────────────────────────────────
export function autoAssignRecipe(
  targetNode: CustomNode,
  sourceNode: CustomNode
): string | null {
  if (targetNode.data.type !== 'machine') return null;
  if (targetNode.data.config.selectedRecipeId) return null; // already has one

  let incomingItems: string[] = [];
  if (sourceNode.data.type === 'source') {
    incomingItems = sourceNode.data.config.outputs.map(o => o.itemName);
  } else if (sourceNode.data.type === 'machine' && sourceNode.data.calculation) {
    incomingItems = sourceNode.data.calculation.outputRates.map(r => r.itemName);
  }

  if (incomingItems.length === 0) return null;
  const matches = findMatchingRecipes(targetNode.data.config.machineTypeId, incomingItems);
  return matches[0]?.id ?? null;
}

// ─── Recalculate all (topological order by edges) ────────────────────────────
export function recalculateAll(nodes: CustomNode[], edges: CustomEdge[]): CustomNode[] {
  // Simple multi-pass to handle ordering
  let result = [...nodes];
  for (let pass = 0; pass < 5; pass++) {
    result = result.map(node => {
      if (node.data.type === 'source') return node;
      if (node.data.type === 'output') {
        const incoming = getIncomingFlows(node.id, result, edges);
        return { ...node, data: { ...node.data, calculation: { inputRates: incoming, outputRates: [], effectiveDuration: 0, machinesNeeded: 0, utilization: 0, isBottleneck: false } } };
      }
      if (node.data.type === 'machine') {
        const calc = calculateMachine(node.data, node.id, result, edges);
        return { ...node, data: { ...node.data, calculation: calc } };
      }
      return node;
    });
  }
  return result;
}
