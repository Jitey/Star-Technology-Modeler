import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { nanoid } from '../utils/nanoid.js'

const defaultRecipe = () => ({
  id: nanoid(),
  name: 'New Recipe',
  cycleTime: 8,
  inputs: [],
  outputs: [],
})

const defaultOutput = () => ({
  id: nanoid(),
  name: '',
  amount: 1,
  probability: 100,
})

const defaultInput = () => ({
  id: nanoid(),
  name: '',
  amount: 1,
})

const defaultMachine = () => ({
  id: nanoid(),
  name: 'New Machine',
  recipeId: null,
  parallelSlots: 1,
  speedMultiplier: 1,
  timeMultiplier: 1,
  count: 1,
})

const defaultStep = () => ({
  id: nanoid(),
  name: 'New Step',
  machineId: null,
  targetRate: null,
  targetUnit: 'per_second',
  note: '',
})

const defaultChain = () => ({
  id: nanoid(),
  name: 'New Chain',
  steps: [],
})

export const useStore = create(immer((set, get) => ({
  recipes: [],
  machines: [],
  chains: [defaultChain()],

  activeChainId: null,
  activeView: 'chains',

  // ─── Recipes ───────────────────────────────────────────────────────────
  addRecipe: () => set(s => {
    const r = defaultRecipe()
    s.recipes.push(r)
  }),

  updateRecipe: (id, patch) => set(s => {
    const r = s.recipes.find(r => r.id === id)
    if (r) Object.assign(r, patch)
  }),

  removeRecipe: (id) => set(s => {
    s.recipes = s.recipes.filter(r => r.id !== id)
    // detach from machines
    s.machines.forEach(m => { if (m.recipeId === id) m.recipeId = null })
  }),

  addOutput: (recipeId) => set(s => {
    const r = s.recipes.find(r => r.id === recipeId)
    if (r) r.outputs.push(defaultOutput())
  }),

  updateOutput: (recipeId, outputId, patch) => set(s => {
    const r = s.recipes.find(r => r.id === recipeId)
    if (!r) return
    const o = r.outputs.find(o => o.id === outputId)
    if (o) Object.assign(o, patch)
  }),

  removeOutput: (recipeId, outputId) => set(s => {
    const r = s.recipes.find(r => r.id === recipeId)
    if (r) r.outputs = r.outputs.filter(o => o.id !== outputId)
  }),

  addInput: (recipeId) => set(s => {
    const r = s.recipes.find(r => r.id === recipeId)
    if (r) r.inputs.push(defaultInput())
  }),

  updateInput: (recipeId, inputId, patch) => set(s => {
    const r = s.recipes.find(r => r.id === recipeId)
    if (!r) return
    const inp = r.inputs.find(i => i.id === inputId)
    if (inp) Object.assign(inp, patch)
  }),

  removeInput: (recipeId, inputId) => set(s => {
    const r = s.recipes.find(r => r.id === recipeId)
    if (r) r.inputs = r.inputs.filter(i => i.id !== inputId)
  }),

  // ─── Machines ──────────────────────────────────────────────────────────
  addMachine: () => set(s => {
    s.machines.push(defaultMachine())
  }),

  updateMachine: (id, patch) => set(s => {
    const m = s.machines.find(m => m.id === id)
    if (m) Object.assign(m, patch)
  }),

  removeMachine: (id) => set(s => {
    s.machines = s.machines.filter(m => m.id !== id)
    // detach from steps
    s.chains.forEach(c => c.steps.forEach(st => {
      if (st.machineId === id) st.machineId = null
    }))
  }),

  // ─── Chains ────────────────────────────────────────────────────────────
  addChain: () => set(s => {
    const c = defaultChain()
    s.chains.push(c)
    s.activeChainId = c.id
  }),

  updateChain: (id, patch) => set(s => {
    const c = s.chains.find(c => c.id === id)
    if (c) Object.assign(c, patch)
  }),

  removeChain: (id) => set(s => {
    s.chains = s.chains.filter(c => c.id !== id)
    if (s.activeChainId === id) s.activeChainId = s.chains[0]?.id ?? null
  }),

  addStep: (chainId) => set(s => {
    const c = s.chains.find(c => c.id === chainId)
    if (c) c.steps.push(defaultStep())
  }),

  updateStep: (chainId, stepId, patch) => set(s => {
    const c = s.chains.find(c => c.id === chainId)
    if (!c) return
    const st = c.steps.find(st => st.id === stepId)
    if (st) Object.assign(st, patch)
  }),

  removeStep: (chainId, stepId) => set(s => {
    const c = s.chains.find(c => c.id === chainId)
    if (c) c.steps = c.steps.filter(st => st.id !== stepId)
  }),

  moveStep: (chainId, fromIdx, toIdx) => set(s => {
    const c = s.chains.find(c => c.id === chainId)
    if (!c) return
    const [item] = c.steps.splice(fromIdx, 1)
    c.steps.splice(toIdx, 0, item)
  }),

  setActiveView: (view) => set(s => { s.activeView = view }),
  setActiveChain: (id) => set(s => { s.activeChainId = id }),
})))
