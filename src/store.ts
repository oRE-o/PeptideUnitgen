import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { StateStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';

const idbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};
import type { AminoUnit, AminoItem, Preset } from './types';

interface AppState {
  language: 'ko' | 'en' | 'ja';
  units: AminoUnit[];
  items: AminoItem[];
  setLanguage: (lang: 'ko' | 'en' | 'ja') => void;
  addUnit: (unit: AminoUnit) => void;
  updateUnit: (id: string, unit: AminoUnit) => void;
  deleteUnit: (id: string) => void;
  addItem: (item: AminoItem) => void;
  updateItem: (id: string, item: AminoItem) => void;
  deleteItem: (id: string) => void;
  loadPreset: (preset: Preset) => void;
  clearAll: () => void;
}

const defaultDummyUnit: AminoUnit = {
  id: 'unit-1',
  name: 'Basic Amino-chan',
  description: 'The foundation of all life.',
  baseStats: {
    turretName: 'L-Leucine',
    deploymentCost: 10,
    totalWeight: 10,
    maxHealth: 100,
    attackDamage: 10,
    healAmount: 0,
    defense: 5,
    maxPenetration: 1,
    knockbackForce: 10,
    attackType: 'Direct',
    projectilePrefab: 'none',
    range: 50,
    critChance: 0.1,
    critMultiplier: 1.5,
    projectileSpeed: 50,
    flightTime: 2,
    magazineSize: 10,
    burstCount: 1,
    reloadTime: 1.5,
    hasSplash: false,
    splashRadius: 0,
    hasAreaEffect: false,
    slowAmount: 0,
    effectTypeId: 'None',
    damagePerTick: 0,
    areaAttackDelay: 0,
    areaRadius: 0,
    areaDuration: 0,
    atpDropBonusRate: 0,
  },
  buffPattern: [],
  innateBuffs: []
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      language: 'ko',
      units: [defaultDummyUnit],
      items: [],
      setLanguage: (lang) => set({ language: lang }),
      addUnit: (unit) => set((state) => ({ units: [...state.units, unit] })),
      updateUnit: (id, unit) => set((state) => ({
        units: state.units.map((u) => u.id === id ? unit : u)
      })),
      deleteUnit: (id) => set((state) => ({ units: state.units.filter((u) => u.id !== id) })),
      addItem: (item) => set((state) => ({ items: [...state.items, item] })),
      updateItem: (id, item) => set((state) => ({
        items: state.items.map((i) => i.id === id ? item : i)
      })),
      deleteItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      loadPreset: (preset) => set({ units: preset.units || [], items: preset.items || [] }),
      clearAll: () => set({ units: [], items: [] }),
    }),
    {
      name: 'peptide-unitgen-storage',
      storage: createJSONStorage(() => idbStorage),
    }
  )
);
