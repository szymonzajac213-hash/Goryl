import assert from 'node:assert/strict';
import test from 'node:test';
import { ACHIEVEMENTS } from './data/achievements';
import { getHelperMilestoneMultiplier, HELPERS } from './data/helpers';
import { PRESTIGE_NODES } from './data/prestige';
import { TOOLS } from './data/tools';
import { UPGRADES } from './data/upgrades';
import { WORLDS } from './data/worlds';
import {
  calculateOfflineProgress,
  calculatePendingGoldenPotatoes,
  computeGameStats,
  createBossEncounter,
  createInitialState,
  decodeSaveFromBase64,
  encodeSaveToBase64,
  evaluateNewAchievements,
  getBulkHelperCost,
  getForgeCost,
  getHelperSingleCost,
  getMaxAffordableHelpers,
  MAX_OFFLINE_SEC,
  performPrestigeReset,
  rollAirDropOutcome,
  rollToolFromCrate,
} from './engine';
import { formatDuration, formatNumber } from './format';

test('dataset completeness meets all game design specs', () => {
  assert.equal(WORLDS.length, 22, 'Exactly 22 unique worlds must exist');
  assert.ok(HELPERS.length >= 18, 'At least 18 helpers must exist');
  assert.ok(TOOLS.length >= 25, 'At least 25 unique tools must exist');
  assert.ok(PRESTIGE_NODES.length >= 15, 'At least 15 prestige nodes must exist');
  assert.ok(ACHIEVEMENTS.length >= 30, 'At least 30 achievements must exist');
  assert.ok(UPGRADES.length >= 25, 'Substantial upgrade pool must exist');

  // Verify world IDs are 1..22 consecutive
  WORLDS.forEach((w, idx) => {
    assert.equal(w.id, idx + 1);
    assert.ok(w.name.length > 0 && w.bossName.length > 0 && w.flavor.length > 0);
  });
});

test('big number formatting handles K, M, B, T, Qa, Qi, Sx, Sp, Oc, No, Dc cleanly', () => {
  assert.equal(formatNumber(0), '0');
  assert.equal(formatNumber(950), '950');
  assert.equal(formatNumber(1_500), '1.5K');
  assert.equal(formatNumber(2_340_000), '2.34M');
  assert.equal(formatNumber(1_000_000_000), '1B');
  assert.equal(formatNumber(5.2e12), '5.2T');
  assert.equal(formatNumber(7.5e15), '7.5Qa');
  assert.equal(formatNumber(1e18), '1Qi');
  assert.equal(formatNumber(1e21), '1Sx');
  assert.equal(formatNumber(1e33), '1Dc');
  assert.equal(formatDuration(3665), '1h 1m 5s');
});

test('exponential helper pricing and bulk MAX calculations match accurately', () => {
  const starling = HELPERS[0];
  assert.equal(getHelperSingleCost(starling, 0), 15);
  assert.equal(getHelperSingleCost(starling, 1), Math.ceil(15 * 1.15));

  const cost10 = getBulkHelperCost(starling, 0, 10);
  assert.ok(cost10 > 15 * 10);

  const maxPlan = getMaxAffordableHelpers(starling, 0, cost10);
  assert.equal(maxPlan.count, 10);
  assert.equal(maxPlan.totalCost, cost10);

  // Milestone doublings at 10, 25, 50, 100
  assert.equal(getHelperMilestoneMultiplier(9), 1);
  assert.equal(getHelperMilestoneMultiplier(10), 2);
  assert.equal(getHelperMilestoneMultiplier(25), 4);
  assert.equal(getHelperMilestoneMultiplier(50), 8);
  assert.equal(getHelperMilestoneMultiplier(100), 16);
});

test('computeGameStats aggregates world mult, helpers, tools, forge, achievements, fever and prestige', () => {
  const state = createInitialState(1000);
  state.helpers.starling = 10; // milestone x2
  state.achievements = ['ach_click_1', 'ach_click_100']; // +4%
  state.goldenPotatoes = 5; // +50%
  state.feverActiveSec = 10; // x3 CPC

  const stats = computeGameStats(state);
  assert.ok(stats.cps > 0);
  assert.equal(stats.achievementMult, 1.04);
  assert.equal(stats.prestigePassiveMult, 1.5);
  assert.equal(stats.feverMult, 3);

  // World 2 multiplies CPS by 2.2x
  const w2Stats = computeGameStats({ ...state, currentWorldId: 2 });
  assert.ok(Math.abs(w2Stats.cps / stats.cps - 2.2) < 0.001);

  // Forge upgrades increase tool CPC bonus
  const forged = createInitialState(1000);
  forged.ownedTools.plastic_fork = { count: 1, forgeLevel: 5 };
  const baseStats = computeGameStats(createInitialState(1000));
  const forgedStats = computeGameStats(forged);
  assert.ok(forgedStats.cpc > baseStats.cpc);
  assert.ok(getForgeCost(TOOLS[0], 3) > getForgeCost(TOOLS[0], 0));
});

test('prestige requires World 5+ and preserves achievements, spices, and best tool when perk unlocked', () => {
  const state = createInitialState(1000);
  state.stats.totalChipsRun = 10_000_000;
  state.highestWorldUnlocked = 4;
  assert.equal(calculatePendingGoldenPotatoes(state), 0, 'Cannot prestige before World 5');

  state.highestWorldUnlocked = 5;
  const pending = calculatePendingGoldenPotatoes(state);
  assert.ok(pending >= 7);

  state.goldenSpices = 99;
  state.achievements = ['ach_world_5'];
  state.prestigeNodes = ['p_keep_best_tool', 'p_starting_chips'];
  state.ownedTools.oil_chainsaw = { count: 2, forgeLevel: 3 };

  const after = performPrestigeReset(state, 5000);
  assert.equal(after.goldenPotatoes, pending);
  assert.equal(after.goldenSpices, 99);
  assert.deepEqual(after.achievements, ['ach_world_5']);
  assert.equal(after.chips, 2_500);
  assert.equal(after.equippedToolId, 'oil_chainsaw');
  assert.equal(after.ownedTools.oil_chainsaw.forgeLevel, 3);
  assert.equal(after.stats.prestigesDone, 1);
});

test('air drop, crate rolling, boss scaling, achievements, offline cap, and Base64 save round-trip', () => {
  const state = createInitialState(1000);
  state.helpers.starling = 10;
  const stats = computeGameStats(state);

  // Luck lowers empty air bag chance, deterministic RNG = 0 triggers air bag
  const airOutcome = rollAirDropOutcome(state, stats, 'bag', () => 0.001);
  assert.equal(airOutcome.kind, 'empty_air');
  assert.equal(airOutcome.chipsGain, 1);

  const potatoOutcome = rollAirDropOutcome(state, stats, 'golden_potato', () => 0.5);
  assert.equal(potatoOutcome.kind, 'golden_burst');
  assert.ok(potatoOutcome.chipsGain > 0 && potatoOutcome.spicesGain > 0);

  const crateTool = rollToolFromCrate(10, 50, () => 0.5);
  assert.ok(crateTool.id.length > 0);

  // Endless boss on World 22 scales HP
  const b1 = createBossEncounter({ ...state, stats: { ...state.stats, endlessBossLevel: 0 } }, 22);
  const b2 = createBossEncounter({ ...state, stats: { ...state.stats, endlessBossLevel: 2 } }, 22);
  assert.ok(b2.maxHp > b1.maxHp);

  // Achievement unlock check
  state.stats.totalClicks = 1;
  const unlocked = evaluateNewAchievements(state);
  assert.ok(unlocked.includes('ach_click_1'));

  // Offline progress caps at 24h
  const hugeOffline = calculateOfflineProgress(state, 1000 + 48 * 3600 * 1000);
  assert.equal(hugeOffline.elapsedSec, MAX_OFFLINE_SEC);
  assert.ok(hugeOffline.chipsEarned > 0);

  // Base64 encode/decode round trip
  state.chips = 123456;
  state.currentWorldId = 4;
  state.highestWorldUnlocked = 6;
  const b64 = encodeSaveToBase64(state);
  const decoded = decodeSaveFromBase64(b64);
  assert.ok(decoded !== null);
  assert.equal(decoded?.chips, 123456);
  assert.equal(decoded?.currentWorldId, 4);
  assert.equal(decoded?.highestWorldUnlocked, 6);
});
