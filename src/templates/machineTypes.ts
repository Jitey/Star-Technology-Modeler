import type { MachineType } from '../types';

export const MACHINE_TYPES: MachineType[] = [
  { id: 'macerator',             name: 'Macerator',              description: 'Broie les minerais bruts en crushed ore.',         defaultTier: 'LV', supportsParallel: false, perfectOC: false },
  { id: 'ore_washer',            name: 'Ore Washer',             description: 'Lave la crushed ore en purified ore.',             defaultTier: 'LV', supportsParallel: false, perfectOC: false },
  { id: 'ore_factory',           name: 'Ore Factory',            description: 'Multiblock HV. 4 recettes simultanées, +60% temps.',defaultTier: 'HV', supportsParallel: true,  perfectOC: false },
  { id: 'electric_ore_factory',  name: 'Electric Ore Factory',   description: 'Multiblock EV. Traitement rapide, parallel hatch.',defaultTier: 'EV', supportsParallel: true,  perfectOC: false },
  { id: 'centrifuge',            name: 'Centrifuge',             description: 'Sépare les mixtures en composants.',              defaultTier: 'LV', supportsParallel: false, perfectOC: false },
  { id: 'electrolyzer',          name: 'Electrolyzer',           description: 'Décompose les composés par électrolyse.',         defaultTier: 'LV', supportsParallel: false, perfectOC: false },
  { id: 'sifter',                name: 'Sifter',                 description: 'Tamise pour gemmes et sous-produits.',            defaultTier: 'LV', supportsParallel: false, perfectOC: false },
  { id: 'lcr',                   name: 'Large Chemical Reactor',  description: 'Multiblock. Perfect OC (4× puissance = 4× speed).', defaultTier: 'HV', supportsParallel: true,  perfectOC: true  },
];
