import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Compass, Pickaxe, ShoppingBag } from 'lucide-react';
import { MiddleColumn } from './components/MiddleColumn';
import { MiningColumn } from './components/MiningColumn';
import {
  AchievementToastStack,
  ConfirmModal,
  CrateRewardModal,
  OfflineProgressModal,
  PauseModal,
  ToastItem,
} from './components/Modals';
import { ParticleCanvasHandle } from './components/ParticleCanvas';
import { RightPanel } from './components/RightPanel';
import { TitleScreen } from './components/TitleScreen';
import { soundFx } from './game/audio';
import { ACHIEVEMENTS } from './game/data/achievements';
import { HELPERS } from './game/data/helpers';
import { PRESTIGE_NODES } from './game/data/prestige';
import { getToolById } from './game/data/tools';
import { UPGRADES } from './game/data/upgrades';
import { getWorldById } from './game/data/worlds';
import {
  calculateOfflineProgress,
  calculatePendingGoldenPotatoes,
  canBuyPrestigeNode,
  computeGameStats,
  createBossEncounter,
  createInitialState,
  decodeSaveFromBase64,
  encodeSaveToBase64,
  evaluateNewAchievements,
  getForgeCost,
  getHelperPurchasePlan,
  hasPrestigeNode,
  performPrestigeReset,
  rollAirDropOutcome,
  rollToolFromCrate,
  sanitizeLoadedState,
  SAVE_STORAGE_KEY,
} from './game/engine';
import { formatNumber } from './game/format';
import {
  AirDropEntity,
  BossEncounter,
  BuyMode,
  EventLogEntry,
  GameScreen,
  GameState,
  RightTab,
  ToolDef,
} from './game/types';

function loadSavedState(): { state: GameState; hasSave: boolean } {
  try {
    const raw = localStorage.getItem(SAVE_STORAGE_KEY);
    if (!raw) return { state: createInitialState(), hasSave: false };
    const parsed = JSON.parse(raw) as Partial<GameState>;
    const sanitized = sanitizeLoadedState(parsed);
    if (!sanitized) return { state: createInitialState(), hasSave: false };
    return { state: sanitized, hasSave: true };
  } catch {
    return { state: createInitialState(), hasSave: false };
  }
}

export default function App() {
  const initialLoad = useMemo(() => loadSavedState(), []);
  const autostart = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('autostart') === '1';
  }, []);

  const [screen, setScreen] = useState<GameScreen>(autostart ? 'playing' : 'title');
  const [hasExistingSave, setHasExistingSave] = useState<boolean>(initialLoad.hasSave);

  const [gameState, setGameState] = useState<GameState>(initialLoad.state);
  const stateRef = useRef<GameState>(initialLoad.state);

  const [boss, setBoss] = useState<BossEncounter | null>(null);
  const bossRef = useRef<BossEncounter | null>(null);
  const [bossTrailPct, setBossTrailPct] = useState<number>(100);

  const [airDrop, setAirDrop] = useState<AirDropEntity | null>(null);
  const airDropRef = useRef<AirDropEntity | null>(null);

  const [activeTab, setActiveTab] = useState<RightTab>('helpers');
  const [buyMode, setBuyMode] = useState<BuyMode>(1);
  const [mobileSection, setMobileSection] = useState<'mine' | 'map' | 'shop'>('mine');

  const [isSwinging, setIsSwinging] = useState(false);
  const [hitFlash, setHitFlash] = useState(false);
  const [hitAnimKey, setHitAnimKey] = useState(0);
  const [critShakeKey, setCritShakeKey] = useState(0);

  const [logs, setLogs] = useState<EventLogEntry[]>([
    {
      id: 1,
      timestamp: Date.now(),
      text: 'Witaj w Goryl Miner! Klikaj w obiekt, kupuj pomocników i pokonaj Bossa Przejścia.',
      tone: 'info',
    },
  ]);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [offlineReward, setOfflineReward] = useState<{
    elapsedSec: number;
    chipsEarned: number;
  } | null>(null);
  const [crateModal, setCrateModal] = useState<{ tool: ToolDef; isDuplicate: boolean } | null>(
    null
  );
  const [showPrestigeConfirm, setShowPrestigeConfirm] = useState(false);
  const [showHardResetConfirm, setShowHardResetConfirm] = useState(false);

  const canvasRef = useRef<ParticleCanvasHandle | null>(null);
  const swingTimeoutRef = useRef<number | null>(null);
  const flashTimeoutRef = useRef<number | null>(null);
  const nextIdRef = useRef(10);
  const screenRef = useRef<GameScreen>(screen);
  screenRef.current = screen;

  const stats = useMemo(() => computeGameStats(gameState), [gameState]);

  // Sync body dataset.state for testability & game shell state machine
  useEffect(() => {
    document.body.dataset.state = screen;
  }, [screen]);

  // Keep audio engine mute synced
  useEffect(() => {
    soundFx.setMuted(gameState.muted);
  }, [gameState.muted]);

  // Compute offline progress once on load if existing save has CPS
  useEffect(() => {
    if (initialLoad.hasSave && !autostart) {
      const progress = calculateOfflineProgress(initialLoad.state, Date.now());
      if (progress.chipsEarned > 0) {
        setOfflineReward(progress);
      }
    }
  }, [initialLoad, autostart]);

  const pushLog = useCallback((text: string, tone: EventLogEntry['tone'] = 'info') => {
    const id = nextIdRef.current++;
    setLogs((prev) => [{ id, timestamp: Date.now(), text, tone }, ...prev].slice(0, 28));
  }, []);

  const pushToast = useCallback((title: string, subtitle: string) => {
    const id = nextIdRef.current++;
    setToasts((prev) => [...prev, { id, title, subtitle }].slice(-4));
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  const persistSave = useCallback((snapshot?: GameState) => {
    try {
      const target = { ...(snapshot ?? stateRef.current), lastSavedAt: Date.now() };
      stateRef.current = target;
      localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(target));
      setHasExistingSave(true);
    } catch {
      // Ignore storage quota errors gracefully
    }
  }, []);

  const checkAchievements = useCallback(
    (s: GameState): GameState => {
      const newly = evaluateNewAchievements(s);
      if (newly.length === 0) return s;
      const updated = {
        ...s,
        achievements: [...s.achievements, ...newly],
      };
      soundFx.playFanfare();
      for (const achId of newly) {
        const def = ACHIEVEMENTS.find((a) => a.id === achId);
        if (def) {
          pushToast(`Osiągnięcie: ${def.name}`, '+2% trwałego CPS!');
          pushLog(`Odblokowano osiągnięcie „${def.name}” (+2% CPS)!`, 'achievement');
        }
      }
      return updated;
    },
    [pushLog, pushToast]
  );

  const commitState = useCallback(
    (updater: (prev: GameState) => GameState) => {
      const next = checkAchievements(updater(stateRef.current));
      stateRef.current = next;
      setGameState(next);
      return next;
    },
    [checkAchievements]
  );

  const handleBossVictory = useCallback(
    (defeated: BossEncounter) => {
      soundFx.playFanfare();
      canvasRef.current?.spawnBurst(0.55, 0.5, '#fde047', '#f97316', 44);
      bossRef.current = null;
      setBoss(null);
      setBossTrailPct(100);

      const dropCrate = Math.random() < 0.45;
      commitState((prev) => {
        const nextHighest =
          defeated.worldId < 22
            ? Math.max(prev.highestWorldUnlocked, defeated.worldId + 1)
            : 22;
        const nextWorldId =
          defeated.worldId < 22 && prev.highestWorldUnlocked === defeated.worldId
            ? defeated.worldId + 1
            : prev.currentWorldId;

        return {
          ...prev,
          goldenSpices: prev.goldenSpices + defeated.spiceReward,
          highestWorldUnlocked: nextHighest,
          currentWorldId: nextWorldId,
          unopenedCrates: prev.unopenedCrates + (dropCrate ? 1 : 0),
          stats: {
            ...prev.stats,
            bossesDefeated: prev.stats.bossesDefeated + 1,
            endlessBossLevel:
              defeated.worldId === 22
                ? prev.stats.endlessBossLevel + 1
                : prev.stats.endlessBossLevel,
          },
        };
      });

      const nextWorld = defeated.worldId < 22 ? getWorldById(defeated.worldId + 1) : null;
      pushLog(
        `POKONANO BOSSA: ${defeated.name}! +${defeated.spiceReward} Złotych Przypraw${
          dropCrate ? ' oraz Skrzynka z Narzędziem' : ''
        }${nextWorld ? ` — odblokowano Świat ${nextWorld.id}: ${nextWorld.name}!` : '!'}`,
        'boss'
      );
      pushToast(
        `Boss pokonany: ${defeated.name}`,
        nextWorld ? `Witaj w: ${nextWorld.name}` : `+${defeated.spiceReward} Złotych Przypraw!`
      );
    },
    [commitState, pushLog, pushToast]
  );

  const executeMineHit = useCallback(
    (normX = 0.62, normY = 0.48, isAuto = false) => {
      const cur = stateRef.current;
      const computed = computeGameStats(cur);
      const world = getWorldById(cur.currentWorldId);

      const isCrit = Math.random() < computed.critChance;
      const gain = computed.cpc * (isCrit ? computed.critMultiplier : 1);
      const isFeverNow = cur.feverActiveSec > 0;

      // Fever charge gain on click
      let nextFeverCharge = cur.feverCharge;
      let nextFeverSec = cur.feverActiveSec;
      let feverJustActivated = false;

      if (nextFeverSec <= 0) {
        nextFeverCharge = Math.min(100, nextFeverCharge + (isAuto ? 1.8 : 4.2) * computed.feverChargeRate);
        if (nextFeverCharge >= 100) {
          nextFeverCharge = 0;
          nextFeverSec = 15;
          feverJustActivated = true;
        }
      }

      if (!isAuto) {
        soundFx.playCrunch(isCrit, isFeverNow);
        setIsSwinging(true);
        if (swingTimeoutRef.current) window.clearTimeout(swingTimeoutRef.current);
        swingTimeoutRef.current = window.setTimeout(() => setIsSwinging(false), 155);

        setHitFlash(true);
        if (flashTimeoutRef.current) window.clearTimeout(flashTimeoutRef.current);
        flashTimeoutRef.current = window.setTimeout(() => setHitFlash(false), 65);

        setHitAnimKey((k) => k + 1);
        if (isCrit) {
          setCritShakeKey((k) => k + 1);
        }
      }

      if (feverJustActivated) {
        soundFx.playFeverStart();
        pushLog(`SZAŁ CHRUPANIA AKTYWNY! x${computed.feverMult} do klikania przez 15s!`, 'rare');
        canvasRef.current?.spawnBurst(0.55, 0.5, '#facc15', '#f43f5e', 34);
      }

      // Boss damage if active
      const activeBoss = bossRef.current;
      if (activeBoss) {
        const dmg = gain * computed.bossDamageMult;
        const remaining = activeBoss.currentHp - dmg;
        canvasRef.current?.spawnHit(
          normX,
          normY,
          isCrit ? `KRYT! -${formatNumber(dmg)}` : `-${formatNumber(dmg)}`,
          isCrit,
          '#fca5a5',
          '#ef4444'
        );

        if (remaining <= 0) {
          handleBossVictory(activeBoss);
        } else {
          const updatedBoss = { ...activeBoss, currentHp: remaining };
          bossRef.current = updatedBoss;
          setBoss(updatedBoss);
          setBossTrailPct((prev) =>
            Math.max((remaining / activeBoss.maxHp) * 100, prev - 4)
          );
        }
      } else {
        canvasRef.current?.spawnHit(
          normX,
          normY,
          isCrit ? `KRYT! +${formatNumber(gain)}` : `+${formatNumber(gain)}`,
          isCrit,
          world.palette.crumbPrimary,
          world.palette.crumbSecondary
        );
      }

      commitState((prev) => ({
        ...prev,
        chips: prev.chips + gain,
        feverCharge: nextFeverCharge,
        feverActiveSec: nextFeverSec,
        stats: {
          ...prev.stats,
          totalClicks: prev.stats.totalClicks + 1,
          totalCrits: prev.stats.totalCrits + (isCrit ? 1 : 0),
          totalChipsRun: prev.stats.totalChipsRun + gain,
          totalChipsAllTime: prev.stats.totalChipsAllTime + gain,
          feverActivations: prev.stats.feverActivations + (feverJustActivated ? 1 : 0),
        },
      }));
    },
    [commitState, handleBossVictory, pushLog]
  );

  // Main 60fps requestAnimationFrame loop (clamped dt <= 0.05s, throttled React sync)
  useEffect(() => {
    let rafId = 0;
    let lastTime = performance.now();
    let hudSyncAccum = 0;
    let autoClickAccum = 0;
    let airDropSpawnTimer = 26; // First flying bag after ~26s
    let achCheckAccum = 0;

    const tick = (now: number) => {
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const dt = Math.min(Math.max(rawDt, 0), 0.05);

      if (screenRef.current === 'playing') {
        const cur = stateRef.current;
        const computed = computeGameStats(cur);

        // Passive chips gain
        const passiveChips = computed.cps * dt;
        let nextFeverSec = cur.feverActiveSec;
        let nextFeverCharge = cur.feverCharge;

        if (nextFeverSec > 0) {
          nextFeverSec = Math.max(0, nextFeverSec - dt);
        } else if (nextFeverCharge > 0) {
          nextFeverCharge = Math.max(0, nextFeverCharge - 5.5 * dt);
        }

        // Active buffs countdown
        let buffsChanged = false;
        const nextBuffs = cur.activeBuffs
          .map((b) => {
            const rem = b.remainingSec - dt;
            if (rem <= 0) buffsChanged = true;
            return { ...b, remainingSec: rem };
          })
          .filter((b) => b.remainingSec > 0);

        stateRef.current = {
          ...cur,
          chips: cur.chips + passiveChips,
          feverActiveSec: nextFeverSec,
          feverCharge: nextFeverCharge,
          activeBuffs: nextBuffs,
          stats: {
            ...cur.stats,
            totalChipsRun: cur.stats.totalChipsRun + passiveChips,
            totalChipsAllTime: cur.stats.totalChipsAllTime + passiveChips,
            playTimeSec: cur.stats.playTimeSec + dt,
          },
        };

        // Boss CPS damage & countdown
        const activeBoss = bossRef.current;
        if (activeBoss) {
          const bossDmg = computed.cps * computed.bossDamageMult * dt;
          const nextHp = activeBoss.currentHp - bossDmg;
          const nextTime = activeBoss.timeRemaining - dt;

          if (nextHp <= 0) {
            handleBossVictory(activeBoss);
          } else if (nextTime <= 0) {
            soundFx.playDefeat();
            bossRef.current = null;
            setBoss(null);
            setBossTrailPct(100);
            pushLog(
              `Czas minął! ${activeBoss.name} obronił przejście — wzmocnij pomocników lub narzędzie i spróbuj ponownie!`,
              'warning'
            );
          } else {
            bossRef.current = {
              ...activeBoss,
              currentHp: nextHp,
              timeRemaining: nextTime,
            };
          }
        }

        // Prestige Auto-Clicker
        if (computed.autoClickRate > 0) {
          autoClickAccum += dt * computed.autoClickRate;
          if (autoClickAccum >= 1) {
            autoClickAccum -= 1;
            executeMineHit(0.58 + (Math.random() - 0.5) * 0.14, 0.48 + (Math.random() - 0.5) * 0.12, true);
          }
        }

        // AirDrop spawning & gliding movement (every 30-60s)
        const activeDrop = airDropRef.current;
        if (activeDrop) {
          const nx = activeDrop.xPercent + activeDrop.speedX * dt;
          const phase = activeDrop.bobPhase + dt * 3.4;
          const ny = Math.max(14, Math.min(72, activeDrop.yPercent + Math.sin(phase) * 14 * dt));
          if (nx > 112 || nx < -12) {
            airDropRef.current = null;
            setAirDrop(null);
            airDropSpawnTimer = 30 + Math.random() * 30;
          } else {
            airDropRef.current = { ...activeDrop, xPercent: nx, yPercent: ny, bobPhase: phase };
          }
        } else {
          airDropSpawnTimer -= dt;
          if (airDropSpawnTimer <= 0) {
            const fromLeft = Math.random() > 0.5;
            const kind: AirDropEntity['kind'] = Math.random() < 0.28 ? 'golden_potato' : 'bag';
            const spawned: AirDropEntity = {
              id: nextIdRef.current++,
              kind,
              xPercent: fromLeft ? -6 : 106,
              yPercent: 22 + Math.random() * 38,
              speedX: fromLeft ? 12.5 : -12.5,
              bobPhase: 0,
            };
            airDropRef.current = spawned;
            setAirDrop(spawned);
            airDropSpawnTimer = 32 + Math.random() * 28;
          }
        }

        // Periodic achievement check every 0.6s
        achCheckAccum += dt;
        if (achCheckAccum >= 0.6) {
          achCheckAccum = 0;
          const checked = checkAchievements(stateRef.current);
          if (checked !== stateRef.current) {
            stateRef.current = checked;
          }
        }

        // Throttled HUD React state sync (~12 Hz)
        hudSyncAccum += dt;
        if (hudSyncAccum >= 0.08 || buffsChanged) {
          hudSyncAccum = 0;
          setGameState({ ...stateRef.current });
          if (bossRef.current) {
            setBoss({ ...bossRef.current });
            const pct = (bossRef.current.currentHp / bossRef.current.maxHp) * 100;
            setBossTrailPct((prev) => prev + (pct - prev) * 0.25);
          }
          if (airDropRef.current) {
            setAirDrop({ ...airDropRef.current });
          }
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [checkAchievements, executeMineHit, handleBossVictory, pushLog]);

  // Auto-save every 10 seconds + on page hide/unload
  useEffect(() => {
    const interval = window.setInterval(() => {
      if (screenRef.current === 'playing') {
        persistSave();
      }
    }, 10_000);
    const onUnload = () => persistSave();
    window.addEventListener('beforeunload', onUnload);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('beforeunload', onUnload);
    };
  }, [persistSave]);

  // Keyboard shortcuts during Playing / Paused
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (screenRef.current === 'title') return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;

      if (e.key === 'Escape' || e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setScreen((prev) => (prev === 'playing' ? 'paused' : 'playing'));
        return;
      }

      if (screenRef.current !== 'playing') return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (!e.repeat) {
          executeMineHit(0.62, 0.48, false);
        }
      } else if (e.key.toLowerCase() === 'm') {
        commitState((prev) => ({ ...prev, muted: !prev.muted }));
      } else if (e.key === '1') {
        setActiveTab('helpers');
      } else if (e.key === '2') {
        setActiveTab('upgrades');
      } else if (e.key === '3') {
        setActiveTab('inventory');
      } else if (e.key === '4') {
        setActiveTab('prestige');
      } else if (e.key === '5') {
        setActiveTab('achievements');
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [commitState, executeMineHit]);

  // Action Handlers
  const handleStartGame = useCallback(() => {
    (document.activeElement as HTMLElement | null)?.blur?.();
    setScreen('playing');
  }, []);

  const handleStartNewGame = useCallback(() => {
    const fresh = createInitialState();
    stateRef.current = fresh;
    bossRef.current = null;
    airDropRef.current = null;
    setBoss(null);
    setAirDrop(null);
    setOfflineReward(null);
    setGameState(fresh);
    persistSave(fresh);
    setScreen('playing');
  }, [persistSave]);

  const handleAirDropClick = useCallback(() => {
    const drop = airDropRef.current;
    if (!drop) return;
    airDropRef.current = null;
    setAirDrop(null);

    const cur = stateRef.current;
    const computed = computeGameStats(cur);
    const outcome = rollAirDropOutcome(cur, computed, drop.kind);

    if (outcome.kind === 'empty_air') {
      soundFx.playAirPop();
      canvasRef.current?.spawnHit(drop.xPercent / 100, drop.yPercent / 100, '+1 OKRUSZEK!', false, '#e2e8f0', '#94a3b8');
      commitState((prev) => ({
        ...prev,
        chips: prev.chips + outcome.chipsGain,
        stats: {
          ...prev.stats,
          airDropsClicked: prev.stats.airDropsClicked + 1,
          emptyBagsOpened: prev.stats.emptyBagsOpened + 1,
          totalChipsRun: prev.stats.totalChipsRun + outcome.chipsGain,
          totalChipsAllTime: prev.stats.totalChipsAllTime + outcome.chipsGain,
        },
      }));
      pushLog(outcome.message, 'warning');
      return;
    }

    soundFx.playFanfare();
    canvasRef.current?.spawnBurst(drop.xPercent / 100, drop.yPercent / 100, '#fde047', '#38bdf8', 30);

    if (outcome.kind === 'buff') {
      commitState((prev) => ({
        ...prev,
        goldenSpices: prev.goldenSpices + outcome.spicesGain,
        activeBuffs: [
          ...prev.activeBuffs.filter((b) => b.type !== outcome.buff.type),
          outcome.buff,
        ],
        stats: {
          ...prev.stats,
          airDropsClicked: prev.stats.airDropsClicked + 1,
        },
      }));
      pushLog(outcome.message, 'rare');
    } else if (outcome.kind === 'crate') {
      commitState((prev) => ({
        ...prev,
        goldenSpices: prev.goldenSpices + outcome.spicesGain,
        unopenedCrates: prev.unopenedCrates + outcome.cratesGain,
        stats: {
          ...prev.stats,
          airDropsClicked: prev.stats.airDropsClicked + 1,
        },
      }));
      pushLog(outcome.message, 'rare');
      pushToast('Zrzut Skrzynki!', 'Otwórz ją w zakładce Kowalnia!');
    } else {
      commitState((prev) => ({
        ...prev,
        chips: prev.chips + outcome.chipsGain,
        goldenSpices: prev.goldenSpices + outcome.spicesGain,
        stats: {
          ...prev.stats,
          airDropsClicked: prev.stats.airDropsClicked + 1,
          totalChipsRun: prev.stats.totalChipsRun + outcome.chipsGain,
          totalChipsAllTime: prev.stats.totalChipsAllTime + outcome.chipsGain,
        },
      }));
      pushLog(outcome.message, 'rare');
    }
  }, [commitState, pushLog, pushToast]);

  const handleBuyHelper = useCallback(
    (helperId: string) => {
      const helper = HELPERS.find((h) => h.id === helperId);
      if (!helper) return;
      const cur = stateRef.current;
      const owned = cur.helpers[helperId] ?? 0;
      const computed = computeGameStats(cur);
      const plan = getHelperPurchasePlan(helper, owned, cur.chips, buyMode, computed.helperCostMult);
      if (!plan.canAfford || plan.count <= 0) return;

      soundFx.playBuy();
      commitState((prev) => ({
        ...prev,
        chips: Math.max(0, prev.chips - plan.totalCost),
        helpers: {
          ...prev.helpers,
          [helperId]: (prev.helpers[helperId] ?? 0) + plan.count,
        },
      }));
    },
    [buyMode, commitState]
  );

  const handleBuyUpgrade = useCallback(
    (upgradeId: string) => {
      const upg = UPGRADES.find((u) => u.id === upgradeId);
      if (!upg) return;
      const cur = stateRef.current;
      if (cur.upgrades.includes(upgradeId) || cur.chips < upg.cost) return;

      soundFx.playBuy();
      commitState((prev) => ({
        ...prev,
        chips: Math.max(0, prev.chips - upg.cost),
        upgrades: [...prev.upgrades, upgradeId],
      }));
      pushLog(`Kupiono ulepszenie: ${upg.name}`, 'info');
    },
    [commitState, pushLog]
  );

  const handleBuyTransport = useCallback(() => {
    const cur = stateRef.current;
    const world = getWorldById(cur.currentWorldId);
    if (world.id >= 22 || cur.purchasedTransports.includes(world.id)) return;
    if (cur.chips < world.transportCost) return;

    soundFx.playBuy();
    commitState((prev) => ({
      ...prev,
      chips: Math.max(0, prev.chips - world.transportCost),
      purchasedTransports: [...prev.purchasedTransports, world.id],
    }));
    pushLog(
      `Kupiono transport „${world.transportName}”! Teraz możesz wyzwać Bossa: ${world.bossName}.`,
      'boss'
    );
  }, [commitState, pushLog]);

  const handleStartBoss = useCallback(() => {
    const cur = stateRef.current;
    const encounter = createBossEncounter(cur, cur.currentWorldId);
    bossRef.current = encounter;
    setBoss(encounter);
    setBossTrailPct(100);
    soundFx.playFeverStart();
    pushLog(`WALKA Z BOSSEM: ${encounter.name} (${encounter.title})! Masz ${encounter.totalTime}s!`, 'boss');
  }, [pushLog]);

  const handleSelectWorld = useCallback((worldId: number) => {
    if (worldId > stateRef.current.highestWorldUnlocked) return;
    bossRef.current = null;
    setBoss(null);
    commitState((prev) => ({ ...prev, currentWorldId: worldId }));
  }, [commitState]);

  const handleEquipTool = useCallback(
    (toolId: string) => {
      if (!stateRef.current.ownedTools[toolId]?.count) return;
      soundFx.playBuy();
      commitState((prev) => ({ ...prev, equippedToolId: toolId }));
    },
    [commitState]
  );

  const handleForgeEquipped = useCallback(() => {
    const cur = stateRef.current;
    const tool = getToolById(cur.equippedToolId);
    const rec = cur.ownedTools[cur.equippedToolId] ?? { count: 1, forgeLevel: 0 };
    const cost = getForgeCost(tool, rec.forgeLevel);
    if (cur.goldenSpices < cost) return;

    soundFx.playFanfare();
    const newLevel = rec.forgeLevel + 1;
    commitState((prev) => ({
      ...prev,
      goldenSpices: prev.goldenSpices - cost,
      ownedTools: {
        ...prev.ownedTools,
        [tool.id]: { ...rec, forgeLevel: newLevel },
      },
      stats: {
        ...prev.stats,
        maxForgeLevel: Math.max(prev.stats.maxForgeLevel, newLevel),
      },
    }));
    pushLog(`Kowalnia Przypraw: ulepszono ${tool.name} do poziomu +${newLevel}!`, 'rare');
  }, [commitState, pushLog]);

  const handleSmeltTool = useCallback(
    (toolId: string) => {
      const cur = stateRef.current;
      const rec = cur.ownedTools[toolId];
      if (!rec || rec.count <= 1) return;
      const def = getToolById(toolId);
      const gain = def.smeltSpices * (hasPrestigeNode(cur, 'p_spice_magnet') ? 2 : 1);

      soundFx.playBuy();
      commitState((prev) => ({
        ...prev,
        goldenSpices: prev.goldenSpices + gain,
        ownedTools: {
          ...prev.ownedTools,
          [toolId]: { ...rec, count: rec.count - 1 },
        },
        stats: {
          ...prev.stats,
          toolsSmelted: prev.stats.toolsSmelted + 1,
        },
      }));
      pushLog(`Przetopiono duplikat „${def.name}” na +${gain} Złotych Przypraw.`, 'info');
    },
    [commitState, pushLog]
  );

  const handleSmeltAll = useCallback(() => {
    const cur = stateRef.current;
    const mult = hasPrestigeNode(cur, 'p_spice_magnet') ? 2 : 1;
    let totalSpices = 0;
    let totalCount = 0;
    const nextTools: GameState['ownedTools'] = { ...cur.ownedTools };

    for (const [toolId, rec] of Object.entries(cur.ownedTools)) {
      if (rec.count > 1) {
        const extra = rec.count - 1;
        const def = getToolById(toolId);
        totalCount += extra;
        totalSpices += extra * def.smeltSpices * mult;
        nextTools[toolId] = { ...rec, count: 1 };
      }
    }
    if (totalCount === 0) return;

    soundFx.playBuy();
    commitState((prev) => ({
      ...prev,
      goldenSpices: prev.goldenSpices + totalSpices,
      ownedTools: nextTools,
      stats: {
        ...prev.stats,
        toolsSmelted: prev.stats.toolsSmelted + totalCount,
      },
    }));
    pushLog(`Przetopiono ${totalCount} duplikatów na +${formatNumber(totalSpices)} Złotych Przypraw!`, 'rare');
  }, [commitState, pushLog]);

  const handleOpenCrate = useCallback(() => {
    const cur = stateRef.current;
    if (cur.unopenedCrates <= 0) return;
    const computed = computeGameStats(cur);
    const rolled = rollToolFromCrate(cur.highestWorldUnlocked, computed.luck);
    const existing = cur.ownedTools[rolled.id];
    const isDuplicate = Boolean(existing && existing.count > 0);

    soundFx.playFanfare();
    commitState((prev) => {
      const prevRec = prev.ownedTools[rolled.id] ?? { count: 0, forgeLevel: 0 };
      return {
        ...prev,
        unopenedCrates: Math.max(0, prev.unopenedCrates - 1),
        ownedTools: {
          ...prev.ownedTools,
          [rolled.id]: { ...prevRec, count: prevRec.count + 1 },
        },
        stats: {
          ...prev.stats,
          cratesOpened: prev.stats.cratesOpened + 1,
        },
      };
    });
    setCrateModal({ tool: rolled, isDuplicate });
    pushLog(`Otwarto skrzynkę: wylosowano ${rolled.name}!`, 'rare');
  }, [commitState, pushLog]);

  const handleBuyPrestigeNode = useCallback(
    (nodeId: string) => {
      const cur = stateRef.current;
      if (!canBuyPrestigeNode(cur, nodeId)) return;
      const node = PRESTIGE_NODES.find((n) => n.id === nodeId);
      if (!node) return;

      soundFx.playFanfare();
      commitState((prev) => ({
        ...prev,
        goldenPotatoes: prev.goldenPotatoes - node.cost,
        prestigeNodes: [...prev.prestigeNodes, node.id],
      }));
      pushLog(`Odblokowano węzeł Prestiżu: ${node.name}!`, 'rare');
    },
    [commitState, pushLog]
  );

  const handleConfirmPrestige = useCallback(() => {
    const earned = calculatePendingGoldenPotatoes(stateRef.current);
    if (earned <= 0) {
      setShowPrestigeConfirm(false);
      return;
    }
    const resetState = performPrestigeReset(stateRef.current, Date.now());
    const checked = checkAchievements(resetState);
    stateRef.current = checked;
    bossRef.current = null;
    airDropRef.current = null;
    setBoss(null);
    setAirDrop(null);
    setGameState(checked);
    persistSave(checked);
    setShowPrestigeConfirm(false);
    soundFx.playFanfare();
    pushLog(`WIELKI RESET ŻOŁĄDKA! Zdobyto +${formatNumber(earned)} Złotych Ziemniaków!`, 'rare');
  }, [checkAchievements, persistSave, pushLog]);

  const handleConfirmHardReset = useCallback(() => {
    localStorage.removeItem(SAVE_STORAGE_KEY);
    const fresh = createInitialState();
    stateRef.current = fresh;
    bossRef.current = null;
    airDropRef.current = null;
    setBoss(null);
    setAirDrop(null);
    setGameState(fresh);
    setHasExistingSave(false);
    setShowHardResetConfirm(false);
    pushLog('Wykonano pełny reset zapisu. Powodzenia w nowej ekspansji!', 'warning');
  }, [pushLog]);

  const handleExportSave = useCallback(() => {
    persistSave();
    return encodeSaveToBase64(stateRef.current);
  }, [persistSave]);

  const handleImportSave = useCallback(
    (encoded: string) => {
      const decoded = decodeSaveFromBase64(encoded);
      if (!decoded) return false;
      stateRef.current = decoded;
      bossRef.current = null;
      airDropRef.current = null;
      setBoss(null);
      setAirDrop(null);
      setGameState(decoded);
      persistSave(decoded);
      soundFx.playFanfare();
      pushLog('Wczytano zapis gry z kodu Base64!', 'rare');
      return true;
    },
    [persistSave, pushLog]
  );

  if (screen === 'title') {
    return (
      <TitleScreen
        hasExistingSave={hasExistingSave}
        savedState={gameState}
        onStart={handleStartGame}
        onNewGame={handleStartNewGame}
      />
    );
  }

  return (
    <div className="h-screen w-full bg-[#150e0a] text-[#fff8ed] flex flex-col overflow-hidden">
      {/* Main 3-Column Responsive Workspace (35% / 30% / 35% on desktop) */}
      <main className="flex-1 min-h-0 p-2.5 sm:p-3 grid grid-cols-1 lg:grid-cols-[35fr_30fr_35fr] gap-3 overflow-hidden">
        {/* Left Column (35%): Main Mining Scene */}
        <div
          className={`min-h-0 h-full ${
            mobileSection === 'mine' ? 'block' : 'hidden lg:block'
          }`}
        >
          <MiningColumn
            state={gameState}
            stats={stats}
            boss={boss}
            bossTrailPct={bossTrailPct}
            airDrop={airDrop}
            isSwinging={isSwinging}
            hitFlash={hitFlash}
            hitAnimKey={hitAnimKey}
            critShakeKey={critShakeKey}
            canvasRef={canvasRef}
            onMineClick={(nx, ny) => executeMineHit(nx, ny, false)}
            onAirDropClick={handleAirDropClick}
            onBuyTransport={handleBuyTransport}
            onStartBoss={handleStartBoss}
            onToggleMute={() => commitState((prev) => ({ ...prev, muted: !prev.muted }))}
            onPause={() => setScreen('paused')}
          />
        </div>

        {/* Middle Column (30%): 22-World Map, Working Helpers, Buffs & Event Log */}
        <div
          className={`min-h-0 h-full ${
            mobileSection === 'map' ? 'block' : 'hidden lg:block'
          }`}
        >
          <MiddleColumn
            state={gameState}
            stats={stats}
            logs={logs}
            onSelectWorld={handleSelectWorld}
          />
        </div>

        {/* Right Column (35%): 5-Tab Management Panel */}
        <div
          className={`min-h-0 h-full ${
            mobileSection === 'shop' ? 'block' : 'hidden lg:block'
          }`}
        >
          <RightPanel
            state={gameState}
            stats={stats}
            activeTab={activeTab}
            buyMode={buyMode}
            onChangeTab={setActiveTab}
            onChangeBuyMode={setBuyMode}
            onBuyHelper={handleBuyHelper}
            onBuyUpgrade={handleBuyUpgrade}
            onEquipTool={handleEquipTool}
            onForgeEquipped={handleForgeEquipped}
            onSmeltTool={handleSmeltTool}
            onSmeltAll={handleSmeltAll}
            onOpenCrate={handleOpenCrate}
            onBuyPrestigeNode={handleBuyPrestigeNode}
            onRequestPrestige={() => setShowPrestigeConfirm(true)}
            onManualSave={() => persistSave()}
            onExportSave={handleExportSave}
            onImportSave={handleImportSave}
            onRequestHardReset={() => setShowHardResetConfirm(true)}
          />
        </div>
      </main>

      {/* Compact Mobile Bottom Switcher (hidden on lg desktop; <= 10% height) */}
      <nav
        aria-label="Nawigacja mobilna"
        className="lg:hidden shrink-0 grid grid-cols-3 gap-1.5 px-2.5 py-2 bg-[#1c130d] border-t-2 border-[#2d1e14]"
      >
        <button
          type="button"
          onClick={() => setMobileSection('mine')}
          className={`py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer ${
            mobileSection === 'mine'
              ? 'bg-amber-400 text-stone-950 border-2 border-[#140c06]'
              : 'bg-[#2a1d15] text-amber-100'
          }`}
        >
          <Pickaxe className="w-4 h-4" />
          Kopalnia
        </button>
        <button
          type="button"
          onClick={() => setMobileSection('map')}
          className={`py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer ${
            mobileSection === 'map'
              ? 'bg-amber-400 text-stone-950 border-2 border-[#140c06]'
              : 'bg-[#2a1d15] text-amber-100'
          }`}
        >
          <Compass className="w-4 h-4" />
          Mapa i Brygada
        </button>
        <button
          type="button"
          onClick={() => setMobileSection('shop')}
          className={`py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer ${
            mobileSection === 'shop'
              ? 'bg-amber-400 text-stone-950 border-2 border-[#140c06]'
              : 'bg-[#2a1d15] text-amber-100'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          Sklep i Kuźnia
        </button>
      </nav>

      {/* Modals & Toasts */}
      {screen === 'paused' && (
        <PauseModal
          chips={gameState.chips}
          highestWorld={gameState.highestWorldUnlocked}
          achievementsCount={gameState.achievements.length}
          onResume={() => setScreen('playing')}
          onReturnTitle={() => {
            persistSave();
            setScreen('title');
          }}
        />
      )}

      {offlineReward && screen === 'playing' && (
        <OfflineProgressModal
          elapsedSec={offlineReward.elapsedSec}
          chipsEarned={offlineReward.chipsEarned}
          onClaim={() => {
            const reward = offlineReward.chipsEarned;
            setOfflineReward(null);
            soundFx.playFanfare();
            commitState((prev) => ({
              ...prev,
              chips: prev.chips + reward,
              stats: {
                ...prev.stats,
                totalChipsRun: prev.stats.totalChipsRun + reward,
                totalChipsAllTime: prev.stats.totalChipsAllTime + reward,
              },
            }));
            pushLog(`Odebrano postęp offline: +${formatNumber(reward)} Chipsów!`, 'rare');
          }}
        />
      )}

      {crateModal && (
        <CrateRewardModal
          tool={crateModal.tool}
          isDuplicate={crateModal.isDuplicate}
          onClose={() => setCrateModal(null)}
          onEquipNow={() => {
            handleEquipTool(crateModal.tool.id);
            setCrateModal(null);
          }}
        />
      )}

      {showPrestigeConfirm && (
        <ConfirmModal
          title="Wielki Reset Żołądka"
          highlightBadge={`Zyskasz +${formatNumber(calculatePendingGoldenPotatoes(gameState))} Złotych Ziemniaków`}
          description="Zresetujesz Chipsy, Światy i Pomocników, ale zachowasz Osiągnięcia, Złote Przyprawy, odblokowane węzły Drzewka (oraz najlepsze narzędzie, jeśli posiadasz Pamiątkę Rodzinną)."
          confirmLabel="Wykonaj Prestiż"
          onConfirm={handleConfirmPrestige}
          onCancel={() => setShowPrestigeConfirm(false)}
        />
      )}

      {showHardResetConfirm && (
        <ConfirmModal
          title="Pełny Hard Reset?"
          description="Ta akcja bezpowrotnie usunie cały zapis gry z pamięci przeglądarki, łącznie z Osiągnięciami i Złotymi Ziemniakami. Czy na pewno chcesz zacząć od zera?"
          confirmLabel="Usuń zapis"
          danger
          onConfirm={handleConfirmHardReset}
          onCancel={() => setShowHardResetConfirm(false)}
        />
      )}

      <AchievementToastStack toasts={toasts} />
    </div>
  );
}
