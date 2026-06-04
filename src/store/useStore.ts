import { create } from 'zustand';
import { applyNodeChanges, applyEdgeChanges, MarkerType, type NodeChange, type EdgeChange, type Connection } from '@xyflow/react';
import type { AppState, CustomNodeData, MachineNodeConfig, CustomNode } from '../types';
import { MACHINE_TYPES } from '../templates/machineTypes';
import { getRecipes, addRecipe, updateRecipe, removeRecipe, setRecipes, getRecipesForType, findMatchingRecipes, getRecipeById } from '../templates/recipes';
import type { RecipeTemplate } from '../types';
import { recalculateAll, autoAssignRecipe } from '../engine/calculator';

let _nextId = 1;
const genId = () => `n${_nextId++}`;

export interface StoreState {
  nodes: CustomNode[];
  edges: any[];
  selectedNodeId: string | null;
  // Recipe management
  recipes: RecipeTemplate[];
  refreshRecipes: () => void;
  addRecipe: (r: RecipeTemplate) => void;
  updateRecipe: (id: string, patch: Partial<RecipeTemplate>) => void;
  removeRecipe: (id: string) => void;
  // Node ops
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addSourceNode: (pos: { x: number; y: number }) => void;
  addMachineNode: (machineTypeId: string, pos: { x: number; y: number }) => void;
  addOutputNode: (pos: { x: number; y: number }) => void;
  updateNodeData: (nodeId: string, data: Partial<CustomNodeData>) => void;
  setSelectedNode: (id: string | null) => void;
  removeSelectedNode: () => void;
  recalculate: () => void;
}

export const useStore = create<StoreState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  recipes: getRecipes(),

  refreshRecipes: () => set({ recipes: getRecipes() }),

  addRecipe: (r) => { addRecipe(r); set({ recipes: getRecipes() }); },
  updateRecipe: (id, patch) => { updateRecipe(id, patch); set({ recipes: getRecipes() }); get().recalculate(); },
  removeRecipe: (id) => { removeRecipe(id); set({ recipes: getRecipes() }); get().recalculate(); },

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) as CustomNode[] });
    get().recalculate();
  },

  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
    get().recalculate();
  },

  onConnect: (connection) => {
    if (!connection.source || !connection.target) return;
    // Dedup: one edge per target handle (each input handle gets at most one connection)
    if (get().edges.some(e => e.target === connection.target && e.targetHandle === connection.targetHandle)) return;

    const edge = { ...connection, id: `e_${genId()}`, type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#f0a500' }, style: { stroke: '#f0a500', strokeWidth: 1.5 } };
    const newEdges = [...get().edges, edge];
    set({ edges: newEdges });

    // Auto-assign recipe using the specific item from sourceHandle
    const targetNode = get().nodes.find(n => n.id === connection.target);
    const sourceNode = get().nodes.find(n => n.id === connection.source);
    if (targetNode && sourceNode) {
      const recipeId = autoAssignRecipe(targetNode, sourceNode, connection.sourceHandle);
      if (recipeId && targetNode.data.type === 'machine') {
        set({
          nodes: get().nodes.map(n => n.id === targetNode.id
            ? { ...n, data: { ...n.data, config: { ...(n.data as any).config, selectedRecipeId: recipeId } } }
            : n
          )
        });
      }
    }

    get().recalculate();
  },

  addSourceNode: (pos) => {
    const node: CustomNode = { id: genId(), type: 'sourceNode', position: pos, data: { type: 'source', config: { outputs: [] } } };
    set({ nodes: [...get().nodes, node] });
  },

  addMachineNode: (machineTypeId, pos) => {
    const mt = MACHINE_TYPES.find(t => t.id === machineTypeId);
    if (!mt) return;
    const config: MachineNodeConfig = { machineTypeId, voltageTier: mt.defaultTier, parallelCount: mt.supportsParallel ? 4 : 1, selectedRecipeId: null, count: 1 };
    const node: CustomNode = { id: genId(), type: 'machineNode', position: pos, data: { type: 'machine', config } };
    set({ nodes: [...get().nodes, node] });
  },

  addOutputNode: (pos) => {
    const node: CustomNode = { id: genId(), type: 'outputNode', position: pos, data: { type: 'output' } };
    set({ nodes: [...get().nodes, node] });
  },

  updateNodeData: (nodeId, data) => {
    set({ nodes: get().nodes.map(n => n.id !== nodeId ? n : { ...n, data: { ...n.data, ...data } as CustomNodeData }) });
    get().recalculate();
  },

  setSelectedNode: (id) => set({ selectedNodeId: id }),

  removeSelectedNode: () => {
    const id = get().selectedNodeId;
    if (!id) return;
    set({ nodes: get().nodes.filter(n => n.id !== id), edges: get().edges.filter(e => e.source !== id && e.target !== id), selectedNodeId: null });
    get().recalculate();
  },

  recalculate: () => {
    const updated = recalculateAll(get().nodes, get().edges);
    set({ nodes: updated });
  },
}));
