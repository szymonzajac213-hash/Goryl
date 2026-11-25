import { ACHIEVEMENTS } from './data/achievements';
import { getHelperMilestoneMultiplier, HELPERS } from './data/helpers';
import { PRESTIGE_NODES } from './data/prestige';
import { getToolById, RARITY_META, TOOLS } from './data/tools';
import { UPGRADES } from './data/upgrades';
import { getWorldById, WORLDS } from './data/worlds';
import {
  ActiveBuff,
  BossEncounter,
  BuyMode,
  ComputedStats,
  GameState,
  HelperDef,
  Rarity,
  ToolDef,
} from './types';

export const SAVE_STORAGE_KEY = 'goryl_miner_save_v1';
export const SAVE_VERSION = 1;
export const MAX_OFFLINE_SEC = 24 * 60 * 60; // 24h
export const HELPER_GROWTH_RATE = 1.15;

export function createInitialState(now = Date.now()): GameState {
  return {
    version: SAVE_VERSION,
    chips: 0,
    goldenSpices: 5,
    goldenPotatoes: 0,
    totalGoldenPotatoesEarned: 0,
    currentWorldId: 1,
    highestWorldUnlocked: 1,
    purchasedTransports: [],
    helpers: {},
    upgrades: [],
    ownedTools: {
      plastic_fork: { count: 1, forgeLevel: 0 },
    },
    equippedToolId: 'plastic_fork',
    unopenedCrates: 0,
    prestigeNodes: [],
    achievements: [],
    feverCharge: 0,
    feverActiveSec: 0,
    activeBuffs: [],
    stats: {
      totalClicks: 0,
      totalCrits: 0,
      totalChipsRun: 0,
      totalChipsAllTime: 0,
      emptyBagsOpened: 0,
      airDropsClicked: 0,
      bossesDefeated: 0,
      endlessBossLevel: 0,
      cratesOpened: 0,
      toolsSmelted: 0,
      feverActivations: 0,
      prestigesDone: 0,
      maxForgeLevel: 0,
      playTimeSec: 0,
    },
    muted: false,
    lastSavedAt: now,
  };
}

export function hasPrestigeNode(state: GameState, nodeId: string): boolean {
  return state.prestigeNodes.includes(nodeId);
}

export function getHelperSingleCost(helper: HelperDef, owned: number, costMult = 1): number {
  return Math.ceil(helper.baseCost * Math.pow(HELPER_GROWTH_RATE, owned) * costMult);
}

export function getBulkHelperCost(
  helper: HelperDef,
  owned: number,
  quantity: number,
  costMult = 1
): number {
  if (quantity <= 0) return 0;
  const first = helper.baseCost * Math.pow(HELPER_GROWTH_RATE, owned) * costMult;
  const total = (first * (Math.pow(HELPER_GROWTH_RATE, quantity) - 1)) / (HELPER_GROWTH_RATE - 1);
  return Math.ceil(total);
}

export function getMaxAffordableHelpers(
  helper: HelperDef,
  owned: number,
  chips: number,
  costMult = 1
): { count: number; totalCost: number } {
  const firstCost = getHelperSingleCost(helper, owned, costMult);
  if (chips < firstCost) {
    return { count: 0, totalCost: firstCost };
  }
  const firstRaw = helper.baseCost * Math.pow(HELPER_GROWTH_RATE, owned) * costMult;
  const approx = Math.floor(
    Math.log((chips * (HELPER_GROWTH_RATE - 1)) / firstRaw + 1) / Math.log(HELPER_GROWTH_RATE)
  );
  let count = Math.max(1, Math.min(approx, 1000));
  while (getBulkHelperCost(helper, owned, count + 1, costMult) <= chips && count < 1000) {
    count++;
  }
  while (count > 1 && getBulkHelperCost(helper, owned, count, costMult) > chips) {
    count--;
  }
  return { count, totalCost: getBulkHelperCost(helper, owned, count, costMult) };
}

export function getHelperPurchasePlan(
  helper: HelperDef,
  owned: number,
  chips: number,
  buyMode: BuyMode,
  costMult = 1
): { count: number; totalCost: number; canAfford: boolean } {
  if (buyMode === 'MAX') {
    const max = getMaxAffordableHelpers(helper, owned, chips, costMult);
    if (max.count === 0) {
      return { count: 1, totalCost: max.totalCost, canAfford: false };
    }
    return { count: max.count, totalCost: max.totalCost, canAfford: true };
  }
  const cost = getBulkHelperCost(helper, owned, buyMode, costMult);
  return { count: buyMode, totalCost: cost, canAfford: chips >= cost };
}

export function getForgeCost(tool: ToolDef, currentForgeLevel: number): number {
  const rarityFactor: Record<Rarity, number> = {
    common: 1,
    uncommon: 1.5,
    rare: 2.4,
    epic: 4,
    legendary: 7,
    mythic: 12,
    cosmic: 20,
  };
  const base = 4 * rarityFactor[tool.rarity];
  return Math.ceil(base * Math.pow(1.65, currentForgeLevel));
}

export function getToolEffectiveStats(
  tool: ToolDef,
  forgeLevel: number,
  hasForgeMastery: boolean
): { cpcBonus: number; cpsPercent: number; critChanceBonus: number; luckBonus: number } {
  const perLevel = hasForgeMastery ? 0.35 : 0.2;
  const mult = 1 + forgeLevel * perLevel;
  return {
    cpcBonus: tool.cpcBonus * mult,
    cpsPercent: tool.cpsPercent * mult,
    critChanceBonus: tool.critChanceBonus + forgeLevel * 0.005,
    luckBonus: Math.round(tool.luckBonus + forgeLevel * 2),
  };
}

export function computeGameStats(state: GameState): ComputedStats {
  const world = getWorldById(state.currentWorldId);
  const equippedTool = getToolById(state.equippedToolId);
  const ownedRec = state.ownedTools[state.equippedToolId] ?? { count: 1, forgeLevel: 0 };
  const hasForgeMastery = hasPrestigeNode(state, 'p_forge_mastery');
  const toolStats = getToolEffectiveStats(equippedTool, ownedRec.forgeLevel, hasForgeMastery);

  const achievementMult = 1 + state.achievements.length * 0.02;
  const potatoPower = hasPrestigeNode(state, 'p_golden_potency') ? 0.2 : 0.1;
  const prestigePassiveMult = 1 + state.goldenPotatoes * potatoPower;

  let cpcMult = 1;
  let cpcFromCpsRatio = 0;
  let globalCpsMult = 1;
  let critChance = 0.05 + toolStats.critChanceBonus;
  let critMultiplier = 5;
  let luck = toolStats.luckBonus;
  let feverMult = 3;
  let feverChargeRate = 1;
  let bossDamageMult = 1;

  const helperUpgMults: Record<string, number> = {};

  for (const upgId of state.upgrades) {
    const upg = UPGRADES.find((u) => u.id === upgId);
    if (!upg) continue;
    switch (upg.effect.type) {
      case 'cpc_mult':
        cpcMult *= upg.effect.value;
        break;
      case 'cpc_from_cps':
        cpcFromCpsRatio += upg.effect.value;
        break;
      case 'cps_mult':
        globalCpsMult *= upg.effect.value;
        break;
      case 'helper_mult':
        helperUpgMults[upg.effect.helperId] =
          (helperUpgMults[upg.effect.helperId] ?? 1) * upg.effect.value;
        break;
      case 'crit_chance':
        critChance += upg.effect.value;
        break;
      case 'crit_mult':
        critMultiplier += upg.effect.value;
        break;
      case 'fever_mult':
        feverMult += upg.effect.value;
        break;
      case 'fever_charge':
        feverChargeRate += upg.effect.value;
        break;
      case 'luck':
        luck += upg.effect.value;
        break;
      case 'boss_dmg':
        bossDamageMult += upg.effect.value;
        break;
      case 'cpc_flat':
        break;
    }
  }

  // Prestige Skill Tree modifiers
  if (hasPrestigeNode(state, 'p_start_click_10x')) cpcMult *= 10;
  if (hasPrestigeNode(state, 'p_fast_fever')) {
    feverChargeRate *= 2;
    feverMult += 1;
  }
  if (hasPrestigeNode(state, 'p_crit_power_up')) {
    critChance += 0.1;
    critMultiplier += 10;
  }
  if (hasPrestigeNode(state, 'p_boss_slayer')) {
    bossDamageMult += 0.75;
  }
  if (hasPrestigeNode(state, 'p_crate_luck')) {
    luck += 50;
  }
  if (hasPrestigeNode(state, 'p_cps_overdrive')) {
    globalCpsMult *= 3;
    cpcMult *= 3;
  }
  if (hasPrestigeNode(state, 'p_infinite_crunch')) {
    globalCpsMult *= 5;
  }

  const helperCostMult = hasPrestigeNode(state, 'p_cheaper_helpers_20') ? 0.8 : 1;
  const spiceGainMult = hasPrestigeNode(state, 'p_spice_magnet') ? 2 : 1;

  let autoClickRate = 0;
  if (hasPrestigeNode(state, 'p_auto_click_12')) autoClickRate = 12;
  else if (hasPrestigeNode(state, 'p_auto_click_5')) autoClickRate = 5;

  // Active temporary buffs
  let buffCpsMult = 1;
  let buffCpcMult = 1;
  let guaranteedCrit = false;
  for (const buff of state.activeBuffs) {
    if (buff.remainingSec > 0) {
      if (buff.cpsMult) buffCpsMult *= buff.cpsMult;
      if (buff.cpcMult) buffCpcMult *= buff.cpcMult;
      if (buff.guaranteedCrit) guaranteedCrit = true;
    }
  }

  const toolCpsMult = 1 + toolStats.cpsPercent / 100;
  const sharedCpsMult =
    world.baseMultiplier *
    toolCpsMult *
    globalCpsMult *
    achievementMult *
    prestigePassiveMult *
    buffCpsMult;

  const helperCpsById: Record<string, number> = {};
  let totalCps = 0;

  for (const helper of HELPERS) {
    const owned = state.helpers[helper.id] ?? 0;
    if (owned <= 0) {
      helperCpsById[helper.id] = 0;
      continue;
    }
    const milestoneMult = getHelperMilestoneMultiplier(owned);
    const upgMult = helperUpgMults[helper.id] ?? 1;
    const hCps = helper.baseCps * owned * milestoneMult * upgMult * sharedCpsMult;
    helperCpsById[helper.id] = hCps;
    totalCps += hCps;
  }

  const activeFeverMult = state.feverActiveSec > 0 ? feverMult : 1;
  const baseCpc = (1 + toolStats.cpcBonus) * world.baseMultiplier * cpcMult * achievementMult * prestigePassiveMult;
  const synergyBonus = totalCps * cpcFromCpsRatio;
  const cpc = (baseCpc + synergyBonus) * activeFeverMult * buffCpcMult;

  return {
    cpc,
    cps: totalCps,
    critChance: guaranteedCrit ? 1 : Math.min(0.95, critChance),
    critMultiplier: Math.min(65, critMultiplier),
    luck,
    bossDamageMult,
    worldMult: world.baseMultiplier,
    achievementMult,
    prestigePassiveMult,
    feverMult,
    feverChargeRate,
    autoClickRate,
    helperCostMult,
    spiceGainMult,
    helperCpsById,
  };
}

export function calculatePendingGoldenPotatoes(state: GameState): number {
  if (state.highestWorldUnlocked < 5) return 0;
  // Square-root + logarithmic scaling so reaching World 5+ grants meaningful prestige gain
  const base = Math.floor(Math.sqrt(state.stats.totalChipsRun / 180_000));
  if (base <= 0) return 0;
  const mult = hasPrestigeNode(state, 'p_infinite_crunch') ? 1.5 : 1;
  return Math.max(1, Math.floor(base * mult));
}

export function createBossEncounter(state: GameState, worldId: number): BossEncounter {
  const world = getWorldById(worldId);
  const extraTime = hasPrestigeNode(state, 'p_boss_slayer') ? 5 : 0;
  const isEndless = worldId === 22;
  const endlessLevel = isEndless ? state.stats.endlessBossLevel + 1 : 0;
  const hp = isEndless
    ? world.bossBaseHp * Math.pow(2.2, endlessLevel - 1)
    : world.bossBaseHp;
  const spiceReward = Math.round(
    (isEndless ? world.bossSpiceReward * (1 + endlessLevel * 0.35) : world.bossSpiceReward) *
      (hasPrestigeNode(state, 'p_spice_magnet') ? 2 : 1)
  );

  return {
    worldId,
    name: isEndless ? `${world.bossName} Poz. ${endlessLevel}` : world.bossName,
    title: world.bossTitle,
    maxHp: hp,
    currentHp: hp,
    timeRemaining: world.bossTimeSec + extraTime,
    totalTime: world.bossTimeSec + extraTime,
    endlessLevel,
    spiceReward,
  };
}

export function rollToolFromCrate(
  highestWorldUnlocked: number,
  luck: number,
  rng: () => number = Math.random
): ToolDef {
  // Luck boosts weights of rarer tiers
  const luckFactor = 1 + luck / 70;
  const eligible = TOOLS.filter((t) => t.minWorld <= Math.max(highestWorldUnlocked + 1, 2));
  const pool = eligible.length > 0 ? eligible : TOOLS.slice(0, 4);

  const rarityBoost: Record<Rarity, number> = {
    common: Math.max(0.25, 1 / Math.sqrt(luckFactor)),
    uncommon: 1,
    rare: Math.pow(luckFactor, 0.55),
    epic: Math.pow(luckFactor, 0.9),
    legendary: Math.pow(luckFactor, 1.25),
    mythic: Math.pow(luckFactor, 1.55),
    cosmic: Math.pow(luckFactor, 1.85),
  };

  const weighted = pool.map((tool) => ({
    tool,
    w: RARITY_META[tool.rarity].weight * rarityBoost[tool.rarity],
  }));

  const totalW = weighted.reduce((acc, item) => acc + item.w, 0);
  let pick = rng() * totalW;
  for (const item of weighted) {
    pick -= item.w;
    if (pick <= 0) return item.tool;
  }
  return weighted[weighted.length - 1].tool;
}

export type AirDropOutcome =
  | { kind: 'empty_air'; chipsGain: number; message: string }
  | { kind: 'buff'; buff: ActiveBuff; spicesGain: number; message: string }
  | { kind: 'crate'; cratesGain: number; spicesGain: number; message: string }
  | { kind: 'golden_burst'; chipsGain: number; spicesGain: number; message: string };

export function rollAirDropOutcome(
  state: GameState,
  stats: ComputedStats,
  dropKind: 'bag' | 'golden_potato',
  rng: () => number = Math.random
): AirDropOutcome {
  const doubleDrop = hasPrestigeNode(state, 'p_double_airdrop') ? 2 : 1;
  const spiceMult = stats.spiceGainMult * doubleDrop;

  if (dropKind === 'golden_potato') {
    const burst = Math.max(stats.cpc * 35, stats.cps * 45, 75 * stats.worldMult) * doubleDrop;
    const spices = Math.max(3, Math.round((2 + state.currentWorldId * 1.4) * spiceMult));
    return {
      kind: 'golden_burst',
      chipsGain: Math.round(burst),
      spicesGain: spices,
      message: `Złoty Ziemniak eksplodował! +${Math.round(burst)} Chipsów i +${spices} Złotych Przypraw!`,
    };
  }

  // Empty air joke chance: starts at 25%, decreases smoothly with Luck
  const minAirChance = hasPrestigeNode(state, 'p_crate_luck') ? 0.04 : 0.07;
  const emptyAirChance = Math.max(minAirChance, 0.25 / (1 + stats.luck / 55));

  const roll = rng();
  if (roll < emptyAirChance) {
    return {
      kind: 'empty_air',
      chipsGain: 1,
      message: 'PSST! Paczka zawierała 99% azotu i 1 samotny okruszek! (+1 Chips)',
    };
  }

  if (roll < emptyAirChance + 0.34) {
    const spices = Math.max(2, Math.round((1 + state.currentWorldId * 0.8) * spiceMult));
    const crates = doubleDrop;
    return {
      kind: 'crate',
      cratesGain: crates,
      spicesGain: spices,
      message: `Zrzut Skrzynki z Narzędziem! +${crates} skrzynka i +${spices} Złotych Przypraw!`,
    };
  }

  // Temporary buffs
  const buffRoll = rng();
  const durMult = doubleDrop === 2 ? 1.5 : 1;
  const spices = Math.max(1, Math.round((1 + state.currentWorldId * 0.5) * spiceMult));

  if (buffRoll < 0.4) {
    const dur = Math.round(30 * durMult);
    return {
      kind: 'buff',
      spicesGain: spices,
      buff: {
        id: `buff_${Date.now()}_${Math.floor(rng() * 9999)}`,
        type: 'spice_rain',
        name: 'Deszcz Przypraw',
        description: 'x7 CPS ze wszystkich pomocników!',
        remainingSec: dur,
        durationSec: dur,
        cpsMult: 7,
      },
      message: `Deszcz Przypraw! x7 CPS przez ${dur}s oraz +${spices} Złotych Przypraw!`,
    };
  }

  if (buffRoll < 0.72) {
    const dur = Math.round(15 * durMult);
    return {
      kind: 'buff',
      spicesGain: spices,
      buff: {
        id: `buff_${Date.now()}_${Math.floor(rng() * 9999)}`,
        type: 'hot_oil',
        name: 'Gorący Olej',
        description: '100% szansy na Krytyczne Chrupnięcie!',
        remainingSec: dur,
        durationSec: dur,
        guaranteedCrit: true,
      },
      message: `Gorący Olej! 100% szans na Krytyk przez ${dur}s oraz +${spices} Złotych Przypraw!`,
    };
  }

  const dur = Math.round(20 * durMult);
  return {
    kind: 'buff',
    spicesGain: spices,
    buff: {
      id: `buff_${Date.now()}_${Math.floor(rng() * 9999)}`,
      type: 'turbo_fry',
      name: 'Turbo Smażenie',
      description: 'x5 do mocy każdego kliknięcia (CPC)!',
      remainingSec: dur,
      durationSec: dur,
      cpcMult: 5,
    },
    message: `Turbo Smażenie! x5 CPC przez ${dur}s oraz +${spices} Złotych Przypraw!`,
  };
}

export function evaluateNewAchievements(state: GameState): string[] {
  const newlyUnlocked: string[] = [];
  for (const ach of ACHIEVEMENTS) {
    if (!state.achievements.includes(ach.id) && ach.check(state)) {
      newlyUnlocked.push(ach.id);
    }
  }
  return newlyUnlocked;
}

export function performPrestigeReset(state: GameState, now = Date.now()): GameState {
  const earned = calculatePendingGoldenPotatoes(state);
  if (earned <= 0) return state;

  const keepBest = hasPrestigeNode(state, 'p_keep_best_tool');
  const startChips = hasPrestigeNode(state, 'p_starting_chips') ? 2_500 : 0;
  const startWorld = hasPrestigeNode(state, 'p_world_leap') ? 3 : 1;

  // Determine best owned tool if keeping
  let keptTools: GameState['ownedTools'] = {
    plastic_fork: { count: 1, forgeLevel: 0 },
  };
  let equippedId = 'plastic_fork';

  if (keepBest) {
    let bestToolId = 'plastic_fork';
    let bestScore = -1;
    for (const [toolId, rec] of Object.entries(state.ownedTools)) {
      if (rec.count <= 0) continue;
      const def = getToolById(toolId);
      const score = def.cpcBonus * (1 + rec.forgeLevel * 0.25) + def.cpsPercent * 10;
      if (score > bestScore) {
        bestScore = score;
        bestToolId = toolId;
      }
    }
    const bestRec = state.ownedTools[bestToolId] ?? { count: 1, forgeLevel: 0 };
    keptTools = {
      plastic_fork: { count: 1, forgeLevel: 0 },
      [bestToolId]: { count: 1, forgeLevel: bestRec.forgeLevel },
    };
    equippedId = bestToolId;
  }

  return {
    ...createInitialState(now),
    chips: startChips,
    goldenSpices: state.goldenSpices,
    goldenPotatoes: state.goldenPotatoes + earned,
    totalGoldenPotatoesEarned: state.totalGoldenPotatoesEarned + earned,
    currentWorldId: startWorld,
    highestWorldUnlocked: startWorld,
    purchasedTransports: startWorld > 1 ? Array.from({ length: startWorld - 1 }, (_, i) => i + 1) : [],
    ownedTools: keptTools,
    equippedToolId: equippedId,
    prestigeNodes: [...state.prestigeNodes],
    achievements: [...state.achievements],
    muted: state.muted,
    stats: {
      ...state.stats,
      totalChipsRun: startChips,
      prestigesDone: state.stats.prestigesDone + 1,
    },
    lastSavedAt: now,
  };
}

export function calculateOfflineProgress(
  state: GameState,
  nowMs: number
): { elapsedSec: number; chipsEarned: number } {
  const rawElapsed = Math.max(0, (nowMs - state.lastSavedAt) / 1000);
  const elapsedSec = Math.min(rawElapsed, MAX_OFFLINE_SEC);
  if (elapsedSec < 30) {
    return { elapsedSec: 0, chipsEarned: 0 };
  }
  const stats = computeGameStats({ ...state, activeBuffs: [], feverActiveSec: 0 });
  const efficiency = hasPrestigeNode(state, 'p_offline_boost') ? 1.0 : 0.6;
  const chipsEarned = Math.floor(stats.cps * elapsedSec * efficiency);
  return { elapsedSec: Math.floor(elapsedSec), chipsEarned };
}

export function encodeSaveToBase64(state: GameState): string {
  const json = JSON.stringify(state);
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function decodeSaveFromBase64(encoded: string): GameState | null {
  try {
    const trimmed = encoded.trim();
    if (!trimmed) return null;
    const binary = atob(trimmed);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const json = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(json) as Partial<GameState>;
    return sanitizeLoadedState(parsed);
  } catch {
    return null;
  }
}

export function sanitizeLoadedState(parsed: Partial<GameState> | null): GameState | null {
  if (!parsed || typeof parsed !== 'object') return null;
  if (typeof parsed.chips !== 'number' || !Number.isFinite(parsed.chips)) return null;

  const base = createInitialState(Date.now());
  const worldId =
    typeof parsed.currentWorldId === 'number'
      ? Math.max(1, Math.min(WORLDS.length, Math.floor(parsed.currentWorldId)))
      : 1;
  const highestWorld =
    typeof parsed.highestWorldUnlocked === 'number'
      ? Math.max(worldId, Math.min(WORLDS.length, Math.floor(parsed.highestWorldUnlocked)))
      : worldId;

  const ownedTools =
    parsed.ownedTools && typeof parsed.ownedTools === 'object'
      ? { plastic_fork: { count: 1, forgeLevel: 0 }, ...parsed.ownedTools }
      : base.ownedTools;

  const equippedToolId =
    typeof parsed.equippedToolId === 'string' && ownedTools[parsed.equippedToolId]?.count > 0
      ? parsed.equippedToolId
      : 'plastic_fork';

  return {
    ...base,
    ...parsed,
    version: SAVE_VERSION,
    chips: Math.max(0, parsed.chips),
    goldenSpices: Math.max(0, Number(parsed.goldenSpices) || 0),
    goldenPotatoes: Math.max(0, Number(parsed.goldenPotatoes) || 0),
    totalGoldenPotatoesEarned: Math.max(0, Number(parsed.totalGoldenPotatoesEarned) || 0),
    currentWorldId: worldId,
    highestWorldUnlocked: highestWorld,
    purchasedTransports: Array.isArray(parsed.purchasedTransports)
      ? parsed.purchasedTransports.filter((n) => typeof n === 'number')
      : [],
    helpers: parsed.helpers && typeof parsed.helpers === 'object' ? { ...parsed.helpers } : {},
    upgrades: Array.isArray(parsed.upgrades) ? [...parsed.upgrades] : [],
    ownedTools,
    equippedToolId,
    unopenedCrates: Math.max(0, Number(parsed.unopenedCrates) || 0),
    prestigeNodes: Array.isArray(parsed.prestigeNodes) ? [...parsed.prestigeNodes] : [],
    achievements: Array.isArray(parsed.achievements) ? [...parsed.achievements] : [],
    feverCharge: Math.max(0, Math.min(100, Number(parsed.feverCharge) || 0)),
    feverActiveSec: Math.max(0, Number(parsed.feverActiveSec) || 0),
    activeBuffs: Array.isArray(parsed.activeBuffs) ? parsed.activeBuffs : [],
    stats: {
      ...base.stats,
      ...(parsed.stats && typeof parsed.stats === 'object' ? parsed.stats : {}),
    },
    muted: Boolean(parsed.muted),
    lastSavedAt: typeof parsed.lastSavedAt === 'number' ? parsed.lastSavedAt : Date.now(),
  };
}

export function canBuyPrestigeNode(state: GameState, nodeId: string): boolean {
  const node = PRESTIGE_NODES.find((n) => n.id === nodeId);
  if (!node) return false;
  if (state.prestigeNodes.includes(node.id)) return false;
  if (state.goldenPotatoes < node.cost) return false;
  if (node.requires && node.requires.some((req) => !state.prestigeNodes.includes(req))) {
    return false;
  }
  return true;
}

export function getTotalSmeltableSpices(state: GameState): {
  duplicates: number;
  totalSpices: number;
} {
  const spiceMult = hasPrestigeNode(state, 'p_spice_magnet') ? 2 : 1;
  let duplicates = 0;
  let totalSpices = 0;
  for (const [toolId, rec] of Object.entries(state.ownedTools)) {
    if (rec.count > 1) {
      const extra = rec.count - 1;
      const def = getToolById(toolId);
      duplicates += extra;
      totalSpices += extra * def.smeltSpices * spiceMult;
    }
  }
  return { duplicates, totalSpices };
}
