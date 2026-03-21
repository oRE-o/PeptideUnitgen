export interface Vector2Int {
  x: number;
  y: number;
}

export type AttackType = 'Direct' | 'Shotgun' | 'Mortar';

export interface CardStats {
  // Basic Info
  turretName: string;
  deploymentCost: number;
  totalWeight: number;

  // Combat Stats
  maxHealth: number;
  attackDamage: number;
  healAmount: number;
  defense: number;
  maxPenetration: number;
  knockbackForce: number;

  // Attack Config
  attackType: AttackType;
  projectilePrefab: string;
  range: number;

  // Critical & Technical
  critChance: number;
  critMultiplier: number;
  projectileSpeed: number;
  flightTime: number;
  magazineSize: number;
  burstCount: number;
  reloadTime: number;

  // Special Effects
  hasSplash: boolean;
  splashRadius: number;
  hasAreaEffect: boolean;
  slowAmount: number;
  effectTypeId: string;
  damagePerTick: number;
  areaAttackDelay: number;
  areaRadius: number;
  areaDuration: number;

  // Resource Bonus
  atpDropBonusRate: number;
}

export interface Buff {
  id: string;          // Maps to BuffInfo.buffType
  name: string;        // Displa name
  description: string; // Description 
  type: 'STAT_MODIFIER' | 'UNIQUE_EFFECT';
  duration: number; // 0 for permanent
  value: number; // e.g., 10 for +10% or +10 flat. Maps to BuffInfo.buffAmount
  statTarget?: keyof CardStats;
  isMultiplier: boolean; // if true, multiplies base stat, else adds
}

export interface AminoItem {
  id: string;
  name: string;
  description: string;
  image?: string;
  weight: number; 
  statModifiers: Partial<CardStats>; // Flat modifiers applied to base stats
  buffs: Buff[];
}

export interface AminoUnit {
  id: string;
  name: string;
  description: string;
  image?: string;
  images?: string[];
  baseStats: CardStats;
  buffPattern: Vector2Int[]; // relative hex coordinates
  innateBuffs: Buff[];
}

export interface Preset {
  version: string;
  units: AminoUnit[];
  items: AminoItem[];
}
