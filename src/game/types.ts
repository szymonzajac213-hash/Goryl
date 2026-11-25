export type Rarity =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary'
  | 'mythic'
  | 'cosmic';

export type BuyMode = 1 | 10 | 100 | 'MAX';

export type RightTab = 'helpers' | 'upgrades' | 'inventory' | 'prestige' | 'achievements';

export type GameScreen = 'title' | 'playing' | 'paused';

export interface WorldDef {
  id: number; // 1..22
  name: string;
  flavor: string;
  baseMultiplier: number;
  transportName: string;
  transportCost: number;
  bossName: string;
  bossTitle: string;
  bossBaseHp: number;
  bossTimeSec: number;
  bossSpiceReward: number;
  palette: {
    bgFrom: string;
    bgVia: string;
    bgTo: string;
    accent: string;
    crumbPrimary: string;
    crumbSecondary: string;
    badgeBg: string;
  };
  objectVariant:
    | 'potato'
    | 'frying_pot'
    | 'school_bag'
    | 'pallet'
    | 'conveyor'
    | 'deep_fryer'
    | 'nitrogen_bag'
    | 'salt_crystal'
    | 'area51_can'
    | 'satellite'
    | 'cheddar_moon'
    | 'paprika_mars'
    | 'asteroid'
    | 'onion_jupiter'
    | 'saturn_rings'
    | 'cryo_pluto'
    | 'black_hole'
    | 'reaper_core'
    | 'cyber_chip'
    | 'golden_ruins'
    | 'dark_bbq'
    | 'absolute_crunch';
}

export interface HelperDef {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  baseCps: number;
  unlockWorld: number;
  accentColor: string;
  iconKey:
    | 'starling'
    | 'intern'
    | 'chimp'
    | 'grandma'
    | 'forklift'
    | 'kebab'
    | 'laser'
    | 'frybot'
    | 'nitrogen'
    | 'chemist'
    | 'baboon'
    | 'harvester'
    | 'oil_sat'
    | 'cybergorilla'
    | 'portal'
    | 'wizard'
    | 'replicator'
    | 'god';
}

export interface ToolDef {
  id: string;
  name: string;
  rarity: Rarity;
  description: string;
  cpcBonus: number;
  cpsPercent: number; // e.g. 15 means +15% CPS
  critChanceBonus: number; // e.g. 0.03 means +3%
  luckBonus: number; // e.g. 8 means +8 luck
  smeltSpices: number;
  minWorld: number;
  shape:
    | 'fork'
    | 'spoon'
    | 'peeler'
    | 'shovel'
    | 'hammer'
    | 'wrench'
    | 'cleaver'
    | 'chainsaw'
    | 'laser_blade'
    | 'plasma_drill'
    | 'gauntlet'
    | 'scepter';
  primaryColor: string;
  secondaryColor: string;
}

export interface UpgradeDef {
  id: string;
  name: string;
  description: string;
  cost: number;
  category: 'click' | 'helper' | 'crit' | 'fever' | 'global' | 'luck';
  targetHelperId?: string;
  requiredWorld?: number;
  requiredHelperCount?: { helperId: string; count: number };
  effect:
    | { type: 'cpc_flat'; value: number }
    | { type: 'cpc_mult'; value: number }
    | { type: 'cpc_from_cps'; value: number }
    | { type: 'cps_mult'; value: number }
    | { type: 'helper_mult'; helperId: string; value: number }
    | { type: 'crit_chance'; value: number }
    | { type: 'crit_mult'; value: number }
    | { type: 'fever_mult'; value: number }
    | { type: 'fever_charge'; value: number }
    | { type: 'luck'; value: number }
    | { type: 'boss_dmg'; value: number };
}

export interface PrestigeNodeDef {
  id: string;
  name: string;
  description: string;
  cost: number; // Golden Potatoes
  tier: 1 | 2 | 3 | 4;
  requires?: string[];
  effectKey:
    | 'start_click_10x'
    | 'cheaper_helpers_20'
    | 'keep_best_tool'
    | 'auto_click_5'
    | 'double_airdrop'
    | 'fast_fever'
    | 'crit_power_up'
    | 'spice_magnet'
    | 'boss_slayer'
    | 'offline_boost'
    | 'starting_chips'
    | 'forge_mastery'
    | 'golden_potency'
    | 'crate_luck'
    | 'auto_click_12'
    | 'world_leap'
    | 'cps_overdrive'
    | 'infinite_crunch';
}

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  category: 'clicks' | 'chips' | 'worlds' | 'bosses' | 'drops' | 'helpers' | 'prestige' | 'tools';
  check: (state: GameState) => boolean;
}

export interface ActiveBuff {
  id: string;
  type: 'spice_rain' | 'hot_oil' | 'turbo_fry';
  name: string;
  description: string;
  remainingSec: number;
  durationSec: number;
  cpsMult?: number;
  cpcMult?: number;
  guaranteedCrit?: boolean;
}

export interface BossEncounter {
  worldId: number;
  name: string;
  title: string;
  maxHp: number;
  currentHp: number;
  timeRemaining: number;
  totalTime: number;
  endlessLevel: number; // >0 for World 22 scaling boss
  spiceReward: number;
}

export interface AirDropEntity {
  id: number;
  kind: 'bag' | 'golden_potato';
  xPercent: number; // 0..100
  yPercent: number; // 12..68
  speedX: number; // % per second
  bobPhase: number;
}

export interface EventLogEntry {
  id: number;
  timestamp: number;
  text: string;
  tone: 'info' | 'rare' | 'boss' | 'warning' | 'achievement';
}

export interface OwnedToolRecord {
  count: number; // total owned copies (>=1 means unlocked, >1 means duplicates ready to smelt)
  forgeLevel: number; // +0, +1, +2...
}

export interface PlayerStats {
  totalClicks: number;
  totalCrits: number;
  totalChipsRun: number;
  totalChipsAllTime: number;
  emptyBagsOpened: number;
  airDropsClicked: number;
  bossesDefeated: number;
  endlessBossLevel: number;
  cratesOpened: number;
  toolsSmelted: number;
  feverActivations: number;
  prestigesDone: number;
  maxForgeLevel: number;
  playTimeSec: number;
}

export interface GameState {
  version: number;
  chips: number;
  goldenSpices: number;
  goldenPotatoes: number;
  totalGoldenPotatoesEarned: number;
  currentWorldId: number; // 1..22
  highestWorldUnlocked: number; // 1..22
  purchasedTransports: number[]; // worldIds whose transport to next world has been bought
  helpers: Record<string, number>;
  upgrades: string[];
  ownedTools: Record<string, OwnedToolRecord>;
  equippedToolId: string;
  unopenedCrates: number;
  prestigeNodes: string[];
  achievements: string[];
  feverCharge: number; // 0..100
  feverActiveSec: number; // 0..15
  activeBuffs: ActiveBuff[];
  stats: PlayerStats;
  muted: boolean;
  lastSavedAt: number;
}

export interface ComputedStats {
  cpc: number;
  cps: number;
  critChance: number;
  critMultiplier: number;
  luck: number;
  bossDamageMult: number;
  worldMult: number;
  achievementMult: number;
  prestigePassiveMult: number;
  feverMult: number;
  feverChargeRate: number;
  autoClickRate: number;
  helperCostMult: number;
  spiceGainMult: number;
  helperCpsById: Record<string, number>;
}
