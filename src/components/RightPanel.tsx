import React, { useState } from 'react';
import {
  Award,
  Check,
  Download,
  Flame,
  Hammer,
  PackageOpen,
  RotateCcw,
  Save,
  Sparkles,
  Trash2,
  TrendingUp,
  Upload,
  Users,
  Wrench,
} from 'lucide-react';
import { ACHIEVEMENTS } from '../game/data/achievements';
import { getHelperMilestoneMultiplier, HELPER_MILESTONES, HELPERS } from '../game/data/helpers';
import { PRESTIGE_NODES } from '../game/data/prestige';
import { getToolById, RARITY_META, TOOLS } from '../game/data/tools';
import { UPGRADES } from '../game/data/upgrades';
import {
  calculatePendingGoldenPotatoes,
  canBuyPrestigeNode,
  getForgeCost,
  getHelperPurchasePlan,
  getToolEffectiveStats,
  getTotalSmeltableSpices,
  hasPrestigeNode,
} from '../game/engine';
import { formatDuration, formatNumber } from '../game/format';
import { BuyMode, ComputedStats, GameState, RightTab } from '../game/types';
import {
  CrateIconSvg,
  GoldenPotatoIconSvg,
  HelperBadgeSvg,
  SpiceIconSvg,
  ToolGraphicSvg,
} from './svg/ToolIconSvg';

interface RightPanelProps {
  state: GameState;
  stats: ComputedStats;
  activeTab: RightTab;
  buyMode: BuyMode;
  onChangeTab: (tab: RightTab) => void;
  onChangeBuyMode: (mode: BuyMode) => void;
  onBuyHelper: (helperId: string) => void;
  onBuyUpgrade: (upgradeId: string) => void;
  onEquipTool: (toolId: string) => void;
  onForgeEquipped: () => void;
  onSmeltTool: (toolId: string) => void;
  onSmeltAll: () => void;
  onOpenCrate: () => void;
  onBuyPrestigeNode: (nodeId: string) => void;
  onRequestPrestige: () => void;
  onManualSave: () => void;
  onExportSave: () => string;
  onImportSave: (encoded: string) => boolean;
  onRequestHardReset: () => void;
}

const TAB_ITEMS: { id: RightTab; label: string; icon: React.ReactNode }[] = [
  { id: 'helpers', label: 'Pomocnicy', icon: <Users className="w-4 h-4" /> },
  { id: 'upgrades', label: 'Ulepszenia', icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'inventory', label: 'Kowalnia', icon: <Wrench className="w-4 h-4" /> },
  { id: 'prestige', label: 'Prestiż', icon: <Sparkles className="w-4 h-4" /> },
  { id: 'achievements', label: 'Osiągnięcia', icon: <Award className="w-4 h-4" /> },
];

export const RightPanel: React.FC<RightPanelProps> = ({
  state,
  stats,
  activeTab,
  buyMode,
  onChangeTab,
  onChangeBuyMode,
  onBuyHelper,
  onBuyUpgrade,
  onEquipTool,
  onForgeEquipped,
  onSmeltTool,
  onSmeltAll,
  onOpenCrate,
  onBuyPrestigeNode,
  onRequestPrestige,
  onManualSave,
  onExportSave,
  onImportSave,
  onRequestHardReset,
}) => {
  const [exportCode, setExportCode] = useState('');
  const [importInput, setImportInput] = useState('');
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const equippedTool = getToolById(state.equippedToolId);
  const equippedRec = state.ownedTools[state.equippedToolId] ?? { count: 1, forgeLevel: 0 };
  const hasForgeMastery = hasPrestigeNode(state, 'p_forge_mastery');
  const equippedEffective = getToolEffectiveStats(
    equippedTool,
    equippedRec.forgeLevel,
    hasForgeMastery
  );
  const forgeCost = getForgeCost(equippedTool, equippedRec.forgeLevel);
  const smeltable = getTotalSmeltableSpices(state);

  const pendingPotatoes = calculatePendingGoldenPotatoes(state);
  const canPrestige = state.highestWorldUnlocked >= 5 && pendingPotatoes > 0;

  const visibleUpgrades = UPGRADES.filter((u) => {
    if (state.upgrades.includes(u.id)) return false;
    if (u.requiredWorld && state.highestWorldUnlocked < u.requiredWorld) return false;
    if (
      u.requiredHelperCount &&
      (state.helpers[u.requiredHelperCount.helperId] ?? 0) < u.requiredHelperCount.count
    ) {
      return false;
    }
    return true;
  }).sort((a, b) => a.cost - b.cost);

  const handleExport = () => {
    const code = onExportSave();
    setExportCode(code);
    if (navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(code);
      setSaveMsg('Skopiowano kod Base64 zapisu do schowka!');
    } else {
      setSaveMsg('Wygenerowano kod Base64 zapisu poniżej.');
    }
  };

  const handleImport = () => {
    if (!importInput.trim()) {
      setSaveMsg('Wklej poprawny ciąg Base64 przed importem.');
      return;
    }
    const ok = onImportSave(importInput);
    if (ok) {
      setImportInput('');
      setSaveMsg('Zapis został pomyślnie wczytany!');
    } else {
      setSaveMsg('Błędny kod zapisu Base64 — nie udało się wczytać.');
    }
  };

  return (
    <section
      aria-label="Panel zarządzania i ulepszeń"
      className="panel-cartoon rounded-2xl bg-[#241912] flex flex-col h-full min-h-0 overflow-hidden"
    >
      {/* 5 Tabs Bar */}
      <div
        role="tablist"
        aria-label="Zakładki zarządzania"
        className="grid grid-cols-5 gap-1 p-2 bg-[#1a110b] border-b border-black/40 shrink-0"
      >
        {TAB_ITEMS.map((tab) => {
          const active = activeTab === tab.id;
          const badgeCount =
            tab.id === 'inventory' && state.unopenedCrates > 0
              ? state.unopenedCrates
              : tab.id === 'upgrades'
                ? visibleUpgrades.filter((u) => state.chips >= u.cost).length
                : 0;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChangeTab(tab.id)}
              className={`relative flex flex-col items-center justify-center gap-0.5 py-2 px-1 rounded-xl text-[11px] font-bold transition-colors cursor-pointer ${
                active
                  ? 'bg-amber-400 text-stone-950 border-2 border-[#180f08] shadow-[0_2px_0_#180f08]'
                  : 'bg-[#2c1f16] text-amber-100/80 hover:bg-[#3a291d] border-2 border-transparent'
              }`}
            >
              {tab.icon}
              <span className="truncate max-w-full">{tab.label}</span>
              {badgeCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-mono-num font-extrabold flex items-center justify-center border border-[#180f08]">
                  {badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: POMOCNICY */}
      {activeTab === 'helpers' && (
        <div className="flex flex-col flex-1 min-h-0">
          <div className="px-3.5 py-2 bg-[#1e140e] border-b border-black/30 flex items-center justify-between gap-2 shrink-0">
            <span className="text-xs font-bold text-amber-200">Ilość zakupu:</span>
            <div className="flex items-center gap-1">
              {([1, 10, 100, 'MAX'] as BuyMode[]).map((mode) => (
                <button
                  key={String(mode)}
                  type="button"
                  onClick={() => onChangeBuyMode(mode)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-extrabold cursor-pointer transition-colors ${
                    buyMode === mode
                      ? 'bg-amber-400 text-stone-950 border border-[#180f08]'
                      : 'bg-[#312319] text-amber-100/80 hover:bg-[#412f22]'
                  }`}
                >
                  {mode === 'MAX' ? 'MAX' : `x${mode}`}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 overflow-y-auto custom-scroll space-y-2 flex-1">
            {HELPERS.map((helper) => {
              const owned = state.helpers[helper.id] ?? 0;
              const isVisible =
                helper.unlockWorld <= state.highestWorldUnlocked + 1 || owned > 0;
              if (!isVisible) return null;

              const plan = getHelperPurchasePlan(
                helper,
                owned,
                state.chips,
                buyMode,
                stats.helperCostMult
              );
              const nextMilestone = HELPER_MILESTONES.find((m) => owned < m);
              const milestoneMult = getHelperMilestoneMultiplier(owned);
              const currentCps = stats.helperCpsById[helper.id] ?? 0;

              return (
                <div
                  key={helper.id}
                  className="p-2.5 rounded-xl bg-[#2d2017] border-2 border-[#180f08] flex items-center gap-2.5"
                >
                  <HelperBadgeSvg helper={helper} className="w-11 h-11 shrink-0" />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-xs sm:text-sm font-extrabold text-amber-50 truncate">
                        {helper.name}
                      </span>
                      <span className="font-mono-num text-xs font-extrabold text-amber-300 shrink-0">
                        {owned} szt.
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-100/70 line-clamp-1">
                      {helper.description}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 text-[11px] font-mono-num text-emerald-300">
                      <span>+{formatNumber(currentCps)}/s</span>
                      <span className="text-white/30">·</span>
                      <span className="text-amber-200/80">
                        Próg x{milestoneMult}
                        {nextMilestone ? ` (nast. przy ${nextMilestone})` : ' (MAX)'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={!plan.canAfford}
                    onClick={() => onBuyHelper(helper.id)}
                    className="btn-3d bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-extrabold px-3 py-2 rounded-xl text-xs shrink-0 flex flex-col items-end min-w-[82px] cursor-pointer"
                  >
                    <span className="font-mono-num">{formatNumber(plan.totalCost)}</span>
                    <span className="text-[10px] opacity-85">Kup +{plan.count}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: ULEPSZENIA */}
      {activeTab === 'upgrades' && (
        <div className="p-3 overflow-y-auto custom-scroll space-y-2 flex-1">
          <div className="text-xs text-amber-200/80 pb-1 flex items-center justify-between">
            <span>Dostępne ulepszenia</span>
            <span className="font-mono-num">
              Kupiono: {state.upgrades.length}/{UPGRADES.length}
            </span>
          </div>

          {visibleUpgrades.length === 0 ? (
            <div className="p-6 text-center text-xs text-amber-100/65 bg-[#1b120d] rounded-xl border border-[#3a281c]">
              Wykupiono wszystkie dostępne teraz ulepszenia! Odblokuj kolejne światy lub kup więcej
              pomocników, aby odkryć następne.
            </div>
          ) : (
            visibleUpgrades.map((upg) => {
              const affordable = state.chips >= upg.cost;
              return (
                <div
                  key={upg.id}
                  className="p-3 rounded-xl bg-[#2d2017] border-2 border-[#180f08] flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-extrabold text-amber-50">
                      {upg.name}
                    </div>
                    <p className="text-[11px] text-amber-100/75 mt-0.5">{upg.description}</p>
                  </div>
                  <button
                    type="button"
                    disabled={!affordable}
                    onClick={() => onBuyUpgrade(upg.id)}
                    className="btn-3d bg-amber-400 hover:bg-amber-300 text-stone-950 font-mono-num font-extrabold text-xs px-3.5 py-2 rounded-xl shrink-0 cursor-pointer"
                  >
                    {formatNumber(upg.cost)}
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 3: EKWIPUNEK I KOWALNIA */}
      {activeTab === 'inventory' && (
        <div className="p-3 overflow-y-auto custom-scroll space-y-3 flex-1">
          {/* Loot Crates Banner */}
          <div className="p-3 rounded-xl bg-[#1c130d] border-2 border-amber-500/50 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <CrateIconSvg className="w-9 h-9 shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-extrabold text-amber-200">
                  Skrzynki z Narzędziami: <span className="font-mono-num">{state.unopenedCrates}</span>
                </div>
                <div className="text-[11px] text-amber-100/70">
                  Zrzucane przez Latające Paczki i Bossów (Szczęście: {stats.luck})
                </div>
              </div>
            </div>
            <button
              type="button"
              disabled={state.unopenedCrates <= 0}
              onClick={onOpenCrate}
              className="btn-3d bg-amber-400 text-stone-950 font-extrabold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <PackageOpen className="w-4 h-4" />
              Otwórz
            </button>
          </div>

          {/* Kowalnia Przypraw (Forge Equipped Tool) */}
          <div className="p-3 rounded-xl bg-[#2d2017] border-2 border-[#180f08]">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-extrabold text-orange-300 flex items-center gap-1.5">
                <Hammer className="w-4 h-4" />
                Kowalnia Przypraw (Założone narzędzie)
              </span>
              <span className="text-xs font-mono-num text-orange-200 flex items-center gap-1">
                <SpiceIconSvg className="w-3.5 h-3.5" />
                {formatNumber(state.goldenSpices)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div
                className="w-14 h-14 rounded-xl border-2 flex items-center justify-center shrink-0"
                style={{
                  background: RARITY_META[equippedTool.rarity].bg,
                  borderColor: RARITY_META[equippedTool.rarity].border,
                }}
              >
                <ToolGraphicSvg tool={equippedTool} className="w-12 h-12" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="text-sm font-extrabold text-amber-50 truncate">
                  {equippedTool.name}{' '}
                  {equippedRec.forgeLevel > 0 && (
                    <span className="text-amber-300">+{equippedRec.forgeLevel}</span>
                  )}
                </div>
                <div
                  className="text-[11px] font-bold"
                  style={{ color: RARITY_META[equippedTool.rarity].color }}
                >
                  {RARITY_META[equippedTool.rarity].label}
                </div>
                <div className="mt-1 text-[11px] font-mono-num text-amber-100/85">
                  +{formatNumber(equippedEffective.cpcBonus)} CPC · +
                  {Math.round(equippedEffective.cpsPercent)}% CPS · +
                  {Math.round(equippedEffective.critChanceBonus * 100)}% Kryt · +
                  {equippedEffective.luckBonus} Szczęścia
                </div>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={state.goldenSpices < forgeCost}
                onClick={onForgeEquipped}
                className="btn-3d flex-1 bg-orange-500 hover:bg-orange-400 text-stone-950 font-extrabold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Flame className="w-4 h-4" />
                Ulepsz na +{equippedRec.forgeLevel + 1} ({formatNumber(forgeCost)} Przypraw)
              </button>

              {smeltable.duplicates > 0 && (
                <button
                  type="button"
                  onClick={onSmeltAll}
                  className="btn-3d bg-stone-700 hover:bg-stone-600 text-amber-200 font-bold text-xs py-2 px-3 rounded-xl cursor-pointer whitespace-nowrap"
                >
                  Przetop {smeltable.duplicates} dup. (+{formatNumber(smeltable.totalSpices)})
                </button>
              )}
            </div>
          </div>

          {/* Owned & All 28 Tools List */}
          <div className="space-y-1.5">
            <div className="text-xs font-bold text-amber-200/80 flex items-center justify-between">
              <span>Kolekcja narzędzi</span>
              <span className="font-mono-num">
                {Object.values(state.ownedTools).filter((t) => t.count > 0).length}/{TOOLS.length}
              </span>
            </div>

            {TOOLS.map((tool) => {
              const rec = state.ownedTools[tool.id];
              const owned = rec && rec.count > 0;
              const isEquipped = state.equippedToolId === tool.id;
              const meta = RARITY_META[tool.rarity];
              const shownStats = owned
                ? getToolEffectiveStats(tool, rec.forgeLevel, hasForgeMastery)
                : {
                    cpcBonus: tool.cpcBonus,
                    cpsPercent: tool.cpsPercent,
                    critChanceBonus: tool.critChanceBonus,
                    luckBonus: tool.luckBonus,
                  };

              return (
                <div
                  key={tool.id}
                  className={`p-2 rounded-xl border-2 flex items-center gap-2.5 ${
                    isEquipped
                      ? 'bg-amber-500/15 border-amber-300'
                      : owned
                        ? 'bg-[#2a1d15] border-[#180f08]'
                        : 'bg-[#18110c] border-[#251a12] opacity-50'
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-lg border flex items-center justify-center shrink-0"
                    style={{ background: owned ? meta.bg : '#1c1510', borderColor: meta.border }}
                  >
                    <ToolGraphicSvg tool={tool} className="w-8 h-8" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-extrabold text-amber-50 truncate">
                        {tool.name}
                        {owned && rec.forgeLevel > 0 ? ` +${rec.forgeLevel}` : ''}
                      </span>
                      {owned && rec.count > 1 && (
                        <span className="text-[11px] font-mono-num text-orange-300 shrink-0">
                          x{rec.count}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-mono-num text-amber-100/70 truncate">
                      <span style={{ color: meta.color }}>{meta.label}</span> · +
                      {formatNumber(shownStats.cpcBonus)} CPC · +{Math.round(shownStats.cpsPercent)}% CPS · +
                      {shownStats.luckBonus} Szcz.
                    </div>
                  </div>

                  {owned ? (
                    <div className="flex items-center gap-1 shrink-0">
                      {rec.count > 1 && (
                        <button
                          type="button"
                          onClick={() => onSmeltTool(tool.id)}
                          title={`Przetop 1 duplikat na Złote Przyprawy`}
                          className="btn-3d bg-orange-600 text-white text-[11px] font-bold px-2 py-1.5 rounded-lg cursor-pointer"
                        >
                          Przetop
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={isEquipped}
                        onClick={() => onEquipTool(tool.id)}
                        className={`btn-3d text-[11px] font-extrabold px-2.5 py-1.5 rounded-lg cursor-pointer ${
                          isEquipped
                            ? 'bg-emerald-700 text-emerald-100'
                            : 'bg-amber-400 text-stone-950'
                        }`}
                      >
                        {isEquipped ? 'Założone' : 'Załóż'}
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] text-stone-400 shrink-0">Św. {tool.minWorld}+</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: PRESTIŻ (OŚWIECENIE CHRUPKOŚCI) */}
      {activeTab === 'prestige' && (
        <div className="p-3 overflow-y-auto custom-scroll space-y-3 flex-1">
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-amber-950/90 to-[#1f130a] border-2 border-amber-400/70">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-display font-extrabold text-base text-amber-300">
                Oświecenie Chrupkości
              </h3>
              <span className="inline-flex items-center gap-1 font-mono-num text-sm font-extrabold text-yellow-300">
                <GoldenPotatoIconSvg className="w-4 h-4" />
                {formatNumber(state.goldenPotatoes)}
              </span>
            </div>
            <p className="text-xs text-amber-100/80 mt-1">
              Każdy Złoty Ziemniak daje pasywne{' '}
              <strong>+{hasPrestigeNode(state, 'p_golden_potency') ? '20%' : '10%'}</strong> do
              całej produkcji (obecnie: x{stats.prestigePassiveMult.toFixed(2)}).
            </p>
            <div className="mt-2 text-xs text-amber-200 font-mono-num">
              {state.highestWorldUnlocked < 5
                ? `Wymagany co najmniej 5. świat (masz: ${state.highestWorldUnlocked}/5).`
                : `Reset teraz da: +${formatNumber(pendingPotatoes)} Złotych Ziemniaków`}
            </div>
            <button
              type="button"
              disabled={!canPrestige}
              onClick={onRequestPrestige}
              className="btn-3d mt-3 w-full py-2.5 px-4 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-stone-950 font-display font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Wielki Reset Żołądka (+{formatNumber(pendingPotatoes)})
            </button>
          </div>

          {/* Skill Tree Tiers 1..4 */}
          {([1, 2, 3, 4] as const).map((tier) => (
            <div key={tier} className="space-y-1.5">
              <div className="text-xs font-extrabold text-amber-300/90">
                Drzewko Umiejętności — Poziom {tier}
              </div>
              {PRESTIGE_NODES.filter((n) => n.tier === tier).map((node) => {
                const owned = state.prestigeNodes.includes(node.id);
                const buyable = canBuyPrestigeNode(state, node.id);
                const missingReq =
                  node.requires?.some((r) => !state.prestigeNodes.includes(r)) ?? false;

                return (
                  <div
                    key={node.id}
                    className={`p-2.5 rounded-xl border-2 flex items-center justify-between gap-2.5 ${
                      owned
                        ? 'bg-emerald-950/60 border-emerald-500/70'
                        : missingReq
                          ? 'bg-[#18110c] border-[#291d14] opacity-60'
                          : 'bg-[#2c1f16] border-[#180f08]'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-extrabold text-amber-50 flex items-center gap-1.5">
                        {owned && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                        <span className="truncate">{node.name}</span>
                      </div>
                      <p className="text-[11px] text-amber-100/75 mt-0.5">{node.description}</p>
                    </div>
                    {owned ? (
                      <span className="text-[11px] font-extrabold text-emerald-300 shrink-0">
                        AKTYWNE
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={!buyable}
                        onClick={() => onBuyPrestigeNode(node.id)}
                        className="btn-3d bg-yellow-400 text-stone-950 font-mono-num font-extrabold text-xs px-3 py-1.5 rounded-xl shrink-0 flex items-center gap-1 cursor-pointer"
                      >
                        <GoldenPotatoIconSvg className="w-3.5 h-3.5" />
                        {node.cost}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* TAB 5: OSIĄGNIĘCIA, STATYSTYKI I ZAPIS */}
      {activeTab === 'achievements' && (
        <div className="p-3 overflow-y-auto custom-scroll space-y-4 flex-1">
          {/* Stats Summary */}
          <div className="p-3 rounded-xl bg-[#1c130d] border-2 border-[#3b291c]">
            <h3 className="font-display font-extrabold text-sm text-amber-300 mb-2">
              Statystyki Goryla
            </h3>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
              <div className="flex justify-between">
                <dt className="text-amber-100/65">Kliknięcia:</dt>
                <dd className="font-mono-num font-bold text-amber-100">
                  {formatNumber(state.stats.totalClicks)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-amber-100/65">Krytyki:</dt>
                <dd className="font-mono-num font-bold text-amber-100">
                  {formatNumber(state.stats.totalCrits)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-amber-100/65">Chipsy (razem):</dt>
                <dd className="font-mono-num font-bold text-amber-100">
                  {formatNumber(state.stats.totalChipsAllTime)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-amber-100/65">Bossowie:</dt>
                <dd className="font-mono-num font-bold text-amber-100">
                  {state.stats.bossesDefeated}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-amber-100/65">Puste paczki:</dt>
                <dd className="font-mono-num font-bold text-amber-100">
                  {state.stats.emptyBagsOpened}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-amber-100/65">Prestiże:</dt>
                <dd className="font-mono-num font-bold text-amber-100">
                  {state.stats.prestigesDone}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-amber-100/65">Czas gry:</dt>
                <dd className="font-mono-num font-bold text-amber-100">
                  {formatDuration(state.stats.playTimeSec)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-amber-100/65">Bonus osiąg.:</dt>
                <dd className="font-mono-num font-bold text-emerald-300">
                  +{state.achievements.length * 2}% CPS
                </dd>
              </div>
            </dl>
          </div>

          {/* Save / Base64 Export & Import / Hard Reset */}
          <div className="p-3 rounded-xl bg-[#1c130d] border-2 border-[#3b291c] space-y-2.5">
            <h3 className="font-display font-extrabold text-sm text-amber-300">
              Zapis gry (Auto-zapis co 10s)
            </h3>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  onManualSave();
                  setSaveMsg('Zapisano grę w pamięci przeglądarki!');
                }}
                className="btn-3d bg-emerald-500 text-stone-950 font-extrabold text-xs px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                Zapisz teraz
              </button>
              <button
                type="button"
                onClick={handleExport}
                className="btn-3d bg-amber-400 text-stone-950 font-extrabold text-xs px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Eksport Base64
              </button>
              <button
                type="button"
                onClick={onRequestHardReset}
                className="btn-3d bg-red-600 text-white font-extrabold text-xs px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hard Reset
              </button>
            </div>

            {exportCode && (
              <div>
                <label
                  htmlFor="export-save-code"
                  className="block text-[11px] text-amber-200/80 mb-1"
                >
                  Twój kod zapisu (Base64):
                </label>
                <textarea
                  id="export-save-code"
                  readOnly
                  value={exportCode}
                  rows={2}
                  className="w-full rounded-lg bg-black/50 border border-[#4a3525] p-2 text-[11px] font-mono-num text-amber-100"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="import-save-input"
                className="block text-[11px] text-amber-200/80"
              >
                Importuj zapis (wklej kod Base64):
              </label>
              <div className="flex gap-2">
                <input
                  id="import-save-input"
                  type="text"
                  value={importInput}
                  onChange={(e) => setImportInput(e.target.value)}
                  placeholder="Wklej zakodowany zapis..."
                  className="flex-1 min-w-0 rounded-lg bg-black/50 border border-[#4a3525] px-2.5 py-1.5 text-xs text-amber-50 placeholder:text-amber-100/35"
                />
                <button
                  type="button"
                  onClick={handleImport}
                  className="btn-3d bg-sky-400 text-stone-950 font-extrabold text-xs px-3 py-1.5 rounded-lg inline-flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Importuj
                </button>
              </div>
            </div>

            {saveMsg && <p className="text-xs font-semibold text-amber-300">{saveMsg}</p>}
          </div>

          {/* 36 Achievements Book */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-extrabold text-amber-300">
              <span>Księga Osiągnięć (+2% CPS za każde)</span>
              <span className="font-mono-num">
                {state.achievements.length}/{ACHIEVEMENTS.length}
              </span>
            </div>

            {ACHIEVEMENTS.map((ach) => {
              const unlocked = state.achievements.includes(ach.id);
              return (
                <div
                  key={ach.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                    unlocked
                      ? 'bg-emerald-950/55 border-emerald-500/60'
                      : 'bg-[#19110c] border-[#2e2016] opacity-60'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-xs font-extrabold text-amber-50 truncate">{ach.name}</div>
                    <div className="text-[11px] text-amber-100/70">{ach.description}</div>
                  </div>
                  <span
                    className={`text-[11px] font-extrabold shrink-0 ${
                      unlocked ? 'text-emerald-300' : 'text-stone-400'
                    }`}
                  >
                    {unlocked ? '+2% CPS' : 'Zablok.'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};
