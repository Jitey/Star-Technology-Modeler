import type { RecipeTemplate } from '../types';

let _recipes: RecipeTemplate[] = [
  // Macerator
  { id:'mac_coal',        name:'Crush Raw Coal',        machineTypeId:'macerator', duration:1.25, baseTier:'LV', inputs:[{itemName:'raw coal',        amount:1,probability:100}], outputs:[{itemName:'crushed coal ore',        amount:1,probability:100}] },
  { id:'mac_gold',        name:'Crush Raw Gold',        machineTypeId:'macerator', duration:1.25, baseTier:'LV', inputs:[{itemName:'raw gold',        amount:1,probability:100}], outputs:[{itemName:'crushed gold ore',        amount:1,probability:100}] },
  { id:'mac_sodalite',    name:'Crush Raw Sodalite',    machineTypeId:'macerator', duration:1.25, baseTier:'LV', inputs:[{itemName:'raw sodalite',    amount:1,probability:100}], outputs:[{itemName:'crushed sodalite ore',    amount:1,probability:100}] },
  { id:'mac_pentlandite', name:'Crush Raw Pentlandite', machineTypeId:'macerator', duration:1.25, baseTier:'LV', inputs:[{itemName:'raw pentlandite', amount:1,probability:100}], outputs:[{itemName:'crushed pentlandite ore', amount:1,probability:100}] },
  { id:'mac_reagalar',    name:'Crush Raw Reagalar',    machineTypeId:'macerator', duration:1.25, baseTier:'LV', inputs:[{itemName:'raw reagalar',    amount:1,probability:100}], outputs:[{itemName:'crushed reagalar ore',    amount:1,probability:100}] },
  { id:'mac_silver',      name:'Crush Raw Silver',      machineTypeId:'macerator', duration:1.25, baseTier:'LV', inputs:[{itemName:'raw silver',      amount:1,probability:100}], outputs:[{itemName:'crushed silver ore',      amount:1,probability:100}] },
  // Ore Washer
  { id:'wash_coal',       name:'Wash Crushed Coal',     machineTypeId:'ore_washer', duration:2.0, baseTier:'LV', inputs:[{itemName:'crushed coal ore', amount:1,probability:100}], outputs:[{itemName:'purified coal ore', amount:1,probability:100}] },
  { id:'wash_gold',       name:'Wash Crushed Gold',     machineTypeId:'ore_washer', duration:2.0, baseTier:'LV', inputs:[{itemName:'crushed gold ore', amount:1,probability:100}], outputs:[{itemName:'purified gold ore', amount:1,probability:100}] },
  // Electric Ore Factory
  { id:'eof_crushed', name:'Process Crushed Ore (EV)', machineTypeId:'electric_ore_factory', duration:1.25, baseTier:'EV', inputs:[{itemName:'crushed ore',amount:1,probability:100}], outputs:[{itemName:'processed ore',amount:1,probability:100}] },
  // Ore Factory
  { id:'of_crushed',  name:'Process Crushed Ore (HV)', machineTypeId:'ore_factory',          duration:3.0,  baseTier:'HV', inputs:[{itemName:'crushed ore',amount:1,probability:100}], outputs:[{itemName:'processed ore',amount:1,probability:100}] },
];

export function getRecipes(): RecipeTemplate[] { return _recipes; }

export function getRecipesForType(machineTypeId: string): RecipeTemplate[] {
  return _recipes.filter(r => r.machineTypeId === machineTypeId);
}

export function findMatchingRecipes(machineTypeId: string, incomingItems: string[]): RecipeTemplate[] {
  return _recipes.filter(r =>
    r.machineTypeId === machineTypeId &&
    r.inputs.some(i => incomingItems.includes(i.itemName))
  );
}

export function getRecipeById(id: string): RecipeTemplate | undefined {
  return _recipes.find(r => r.id === id);
}

export function addRecipe(r: RecipeTemplate) { _recipes = [..._recipes, r]; }
export function updateRecipe(id: string, patch: Partial<RecipeTemplate>) {
  _recipes = _recipes.map(r => r.id === id ? { ...r, ...patch } : r);
}
export function removeRecipe(id: string) { _recipes = _recipes.filter(r => r.id !== id); }
export function setRecipes(recipes: RecipeTemplate[]) { _recipes = recipes; }
