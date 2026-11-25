import React from 'react';
import { Compass, Lock, Sparkles, Users } from 'lucide-react';
import { HELPERS } from '../game/data/helpers';
import { WORLDS } from '../game/data/worlds';
import { formatNumber } from '../game/format';
import { ComputedStats, EventLogEntry, GameState } from '../game/types';
import { HelperBadgeSvg } from './svg/ToolIconSvg';

interface MiddleColumnProps {
  state: GameState;
  stats: ComputedStats;
  logs: EventLogEntry[];
  onSelectWorld: (worldId: number) => void;
}

export const MiddleColumn: React.FC<MiddleColumnProps> = ({
  state,
  stats,
  logs,
  onSelectWorld,
}) => {
  const ownedHelpers = HELPERS.filter((h) => (state.helpers[h.id] ?? 0) > 0);

  return (
    <section
      aria-label="Mapa światów, pomocnicy i dziennik zdarzeń"
      className="flex flex-col h-full gap-3 min-h-0"
    >
      {/* 1. 22-World Expansion Map */}
      <div className="panel-cartoon rounded-2xl bg-[#241912] flex flex-col min-h-0 flex-[1.25] overflow-hidden">
        <div className="px-3.5 py-2.5 border-b border-black/40 bg-[#1c130d] flex items-center justify-between">
          <h2 className="font-display font-extrabold text-sm text-amber-200 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-amber-400" />
            Mapa 22 Światów
          </h2>
          <span className="text-xs font-mono-num text-amber-100/75">
            {state.highestWorldUnlocked}/22
          </span>
        </div>

        <div className="p-2.5 overflow-y-auto custom-scroll space-y-1.5 flex-1">
          {WORLDS.map((w) => {
            const unlocked = w.id <= state.highestWorldUnlocked;
            const isCurrent = w.id === state.currentWorldId;

            return (
              <button
                key={w.id}
                type="button"
                disabled={!unlocked}
                onClick={() => onSelectWorld(w.id)}
                className={`w-full text-left px-3 py-2 rounded-xl border-2 transition-transform duration-100 flex items-center justify-between gap-2 ${
                  isCurrent
                    ? 'border-amber-300 bg-amber-500/20 shadow-[0_2px_0_#140c06] cursor-pointer'
                    : unlocked
                      ? 'border-[#3b291c] bg-[#2e2017] hover:bg-[#3a281d] cursor-pointer'
                      : 'border-[#251a12] bg-[#19110c] opacity-55 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-7 h-7 rounded-lg border-2 border-[#140c06] flex items-center justify-center font-mono-num text-xs font-extrabold shrink-0 text-white"
                    style={{ background: unlocked ? w.palette.badgeBg : '#29201a' }}
                  >
                    {unlocked ? w.id : <Lock className="w-3.5 h-3.5 text-stone-400" />}
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-amber-50 truncate">{w.name}</div>
                    <div className="text-[11px] text-amber-200/70 truncate">
                      {unlocked ? `${w.flavor} · x${formatNumber(w.baseMultiplier)}` : `Boss: ${w.bossName}`}
                    </div>
                  </div>
                </div>

                {isCurrent && (
                  <span className="text-[11px] font-extrabold text-amber-300 shrink-0">
                    TU JESTEŚ
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Working Helpers Live Stage */}
      <div className="panel-cartoon rounded-2xl bg-[#241912] flex flex-col overflow-hidden shrink-0">
        <div className="px-3.5 py-2 border-b border-black/40 bg-[#1c130d] flex items-center justify-between">
          <h2 className="font-display font-extrabold text-sm text-amber-200 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-emerald-400" />
            Pracująca Brygada
          </h2>
          <span className="text-xs font-mono-num text-emerald-300">
            {formatNumber(stats.cps)}/s
          </span>
        </div>

        <div className="p-2.5 min-h-[82px] max-h-[126px] overflow-y-auto custom-scroll">
          {ownedHelpers.length === 0 ? (
            <p className="text-xs text-amber-100/60 text-center py-4">
              Zatrudnij pierwszego pomocnika po prawej, by ruszyła produkcja pasywna!
            </p>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-4 gap-2">
              {ownedHelpers.map((h, idx) => {
                const count = state.helpers[h.id] ?? 0;
                return (
                  <div
                    key={h.id}
                    title={`${h.name}: ${count} szt. (${formatNumber(stats.helperCpsById[h.id] ?? 0)}/s)`}
                    className="flex flex-col items-center p-1.5 rounded-xl bg-[#1a120c] border border-[#3a281c]"
                  >
                    <div
                      className="animate-helper-work"
                      style={{ animationDelay: `${(idx % 5) * 140}ms` }}
                    >
                      <HelperBadgeSvg helper={h} className="w-9 h-9" />
                    </div>
                    <span className="mt-0.5 text-[11px] font-mono-num font-bold text-amber-200">
                      x{count}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 3. Active Buffs & Recent Event Log */}
      <div className="panel-cartoon rounded-2xl bg-[#241912] flex flex-col min-h-0 flex-[0.85] overflow-hidden">
        <div className="px-3.5 py-2 border-b border-black/40 bg-[#1c130d] flex items-center justify-between">
          <h2 className="font-display font-extrabold text-sm text-amber-200 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-sky-400" />
            Buffy i Dziennik Zdarzeń
          </h2>
          <span className="text-[11px] text-amber-100/65">
            Szczęście: {stats.luck}
          </span>
        </div>

        <div className="p-2.5 overflow-y-auto custom-scroll space-y-2 flex-1">
          {state.activeBuffs.length > 0 && (
            <div className="space-y-1.5 pb-2 border-b border-white/10">
              {state.activeBuffs.map((buff) => {
                const pct = Math.max(0, Math.min(100, (buff.remainingSec / buff.durationSec) * 100));
                return (
                  <div
                    key={buff.id}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-500/15 border border-amber-400/50"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-amber-200">
                      <span>{buff.name}</span>
                      <span className="font-mono-num">{buff.remainingSec.toFixed(1)}s</span>
                    </div>
                    <div className="text-[11px] text-amber-100/75">{buff.description}</div>
                    <div className="mt-1 h-1.5 rounded bg-black/50 overflow-hidden">
                      <div className="h-full bg-amber-400" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {logs.length === 0 ? (
            <p className="text-xs text-amber-100/55">
              Wypatruj Latających Paczek i Złotych Ziemniaków przelatujących nad kopalnią!
            </p>
          ) : (
            <ul className="space-y-1.5">
              {logs.map((entry) => (
                <li
                  key={entry.id}
                  className={`text-xs leading-snug ${
                    entry.tone === 'rare'
                      ? 'text-yellow-300 font-semibold'
                      : entry.tone === 'boss'
                        ? 'text-rose-300 font-semibold'
                        : entry.tone === 'achievement'
                          ? 'text-emerald-300 font-semibold'
                          : entry.tone === 'warning'
                            ? 'text-sky-300'
                            : 'text-amber-100/80'
                  }`}
                >
                  {entry.text}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
};
