import React from 'react';
import { Flame, Pause, ShieldAlert, Swords, Truck, Volume2, VolumeX } from 'lucide-react';
import { getToolById } from '../game/data/tools';
import { getWorldById } from '../game/data/worlds';
import { formatNumber } from '../game/format';
import {
  AirDropEntity,
  BossEncounter,
  ComputedStats,
  GameState,
} from '../game/types';
import { ParticleCanvas, ParticleCanvasHandle } from './ParticleCanvas';
import { GorillaSvg } from './svg/GorillaSvg';
import {
  ChipIconSvg,
  GoldenPotatoIconSvg,
  SpiceIconSvg,
} from './svg/ToolIconSvg';
import { WorldObjectSvg } from './svg/WorldObjectSvg';

interface MiningColumnProps {
  state: GameState;
  stats: ComputedStats;
  boss: BossEncounter | null;
  bossTrailPct: number;
  airDrop: AirDropEntity | null;
  isSwinging: boolean;
  hitFlash: boolean;
  hitAnimKey: number;
  critShakeKey: number;
  canvasRef: React.RefObject<ParticleCanvasHandle | null>;
  onMineClick: (normX?: number, normY?: number) => void;
  onAirDropClick: () => void;
  onBuyTransport: () => void;
  onStartBoss: () => void;
  onToggleMute: () => void;
  onPause: () => void;
}

export const MiningColumn: React.FC<MiningColumnProps> = ({
  state,
  stats,
  boss,
  bossTrailPct,
  airDrop,
  isSwinging,
  hitFlash,
  hitAnimKey,
  critShakeKey,
  canvasRef,
  onMineClick,
  onAirDropClick,
  onBuyTransport,
  onStartBoss,
  onToggleMute,
  onPause,
}) => {
  const world = getWorldById(state.currentWorldId);
  const equippedTool = getToolById(state.equippedToolId);
  const isFever = state.feverActiveSec > 0;

  const isFinalWorld = world.id === 22;
  const hasUnlockedNext = state.highestWorldUnlocked > world.id;
  const hasTransport = isFinalWorld || state.purchasedTransports.includes(world.id);
  const canAffordTransport = state.chips >= world.transportCost;

  const handleArenaClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = Math.max(0.15, Math.min(0.85, (e.clientX - rect.left) / rect.width));
    const ny = Math.max(0.15, Math.min(0.85, (e.clientY - rect.top) / rect.height));
    onMineClick(nx, ny);
  };

  const bossHpPct = boss ? Math.max(0, Math.min(100, (boss.currentHp / boss.maxHp) * 100)) : 0;

  return (
    <section
      aria-label="Scena główna kopania"
      className={`relative flex flex-col h-full overflow-hidden rounded-2xl panel-cartoon ${
        isFever ? 'fever-frame' : ''
      }`}
      style={{
        background: `linear-gradient(165deg, ${world.palette.bgFrom} 0%, ${world.palette.bgVia} 52%, ${world.palette.bgTo} 100%)`,
      }}
    >
      {/* Top World & Utility Header */}
      <div className="px-4 pt-3.5 pb-2.5 flex items-start justify-between gap-2 border-b border-black/35 bg-black/25">
        <div className="min-w-0">
          <div className="text-xs font-bold text-amber-300/90 truncate">
            Świat {world.id}/22 · Mnożnik x{formatNumber(world.baseMultiplier)}
          </div>
          <h1 className="font-display font-extrabold text-lg sm:text-xl text-amber-50 leading-tight truncate">
            {world.name}
          </h1>
          <div className="text-xs text-amber-100/75 truncate">Smak: {world.flavor}</div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              onToggleMute();
            }}
            aria-label={state.muted ? 'Włącz dźwięk' : 'Wycisz dźwięk'}
            title={state.muted ? 'Włącz dźwięk [M]' : 'Wycisz dźwięk [M]'}
            className="btn-3d bg-stone-900/90 text-amber-200 p-2 rounded-xl cursor-pointer"
          >
            {state.muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              onPause();
            }}
            aria-label="Pauza"
            title="Pauza [Esc]"
            className="btn-3d bg-stone-900/90 text-amber-200 p-2 rounded-xl cursor-pointer"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Primary Currencies Readout */}
      <div className="px-4 py-3 bg-black/30 border-b border-black/30">
        <div className="flex items-center justify-center gap-2.5">
          <ChipIconSvg className="w-9 h-9 shrink-0" />
          <div className="text-center">
            <div
              data-testid="chips-counter"
              className="font-display font-extrabold text-3xl sm:text-4xl text-amber-300 text-stroke-dark leading-none font-mono-num"
            >
              {formatNumber(state.chips)}
            </div>
            <div className="mt-1 text-xs font-semibold text-amber-100/85 font-mono-num">
              CPS: {formatNumber(stats.cps)}/s · Klik: {formatNumber(stats.cpc)} · Kryt:{' '}
              {Math.round(stats.critChance * 100)}% (x{stats.critMultiplier})
            </div>
          </div>
        </div>

        {/* Secondary currencies (unboxed clean inline row) */}
        <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-center gap-5 text-xs font-bold font-mono-num">
          <span className="inline-flex items-center gap-1.5 text-orange-200" title="Złote Przyprawy">
            <SpiceIconSvg className="w-4 h-4" />
            <span>{formatNumber(state.goldenSpices)} Przypraw</span>
          </span>
          <span aria-hidden="true" className="text-white/30">
            ·
          </span>
          <span
            className="inline-flex items-center gap-1.5 text-yellow-200"
            title="Złote Ziemniaki (Prestiż)"
          >
            <GoldenPotatoIconSvg className="w-4 h-4" />
            <span>{formatNumber(state.goldenPotatoes)} Zł. Ziemniaków</span>
          </span>
        </div>
      </div>

      {/* Fever Mode (Szał Jedzenia) Bar */}
      <div className="px-4 pt-2.5 pb-1">
        <div className="flex items-center justify-between text-xs font-bold mb-1">
          <span className="inline-flex items-center gap-1 text-amber-200">
            <Flame className={`w-3.5 h-3.5 ${isFever ? 'text-rose-400' : 'text-amber-400'}`} />
            {isFever
              ? `SZAŁ CHRUPANIA! x${stats.feverMult} KLIK`
              : 'Pasek Szału Jedzenia'}
          </span>
          <span className="font-mono-num text-amber-100/85">
            {isFever ? `${state.feverActiveSec.toFixed(1)}s` : `${Math.round(state.feverCharge)}%`}
          </span>
        </div>
        <div className="h-3 w-full rounded-lg bg-black/50 border-2 border-[#180f08] overflow-hidden">
          <div
            className="h-full transition-transform duration-100 origin-left"
            style={{
              width: '100%',
              transform: `scaleX(${
                isFever
                  ? Math.max(0, Math.min(1, state.feverActiveSec / 15))
                  : Math.max(0, Math.min(1, state.feverCharge / 100))
              })`,
              background: isFever
                ? 'linear-gradient(90deg, #f97316 0%, #facc15 50%, #f43f5e 100%)'
                : 'linear-gradient(90deg, #d97706 0%, #fbbf24 100%)',
            }}
          />
        </div>
      </div>

      {/* Boss HP HUD (only when Boss Encounter is active) */}
      {boss && (
        <div className="mx-4 mt-2 p-2.5 rounded-xl bg-red-950/90 border-2 border-red-500">
          <div className="flex items-center justify-between gap-2 text-xs font-extrabold">
            <span className="text-red-200 truncate flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-yellow-300 shrink-0" />
              BOSS: {boss.name}
            </span>
            <span className="font-mono-num text-yellow-300 shrink-0">
              {boss.timeRemaining.toFixed(1)}s
            </span>
          </div>
          <div className="mt-1.5 relative h-4 w-full rounded-md bg-black/70 border-2 border-[#180f08] overflow-hidden">
            {/* Delayed trailing damage ghost bar */}
            <div
              className="absolute inset-y-0 left-0 bg-amber-300/85 transition-all duration-300"
              style={{ width: `${bossTrailPct}%` }}
            />
            <div
              className="absolute inset-y-0 left-0 bg-red-500 transition-all duration-75"
              style={{ width: `${bossHpPct}%` }}
            />
            <div className="relative z-10 text-[11px] font-mono-num font-bold text-center text-white leading-3.5 drop-shadow">
              HP: {formatNumber(Math.ceil(boss.currentHp))} / {formatNumber(boss.maxHp)}
            </div>
          </div>
        </div>
      )}

      {/* Interactive Mining Arena (Gorilla + Clickable World/Boss Object + Particle Canvas + AirDrop) */}
      <div
        key={critShakeKey}
        className={`relative flex-1 min-h-[265px] flex items-center justify-center overflow-hidden ${
          critShakeKey > 0 ? 'animate-crit-shake' : ''
        }`}
      >
        {/* World-matched atmospheric backdrop scenery (spotlight + grounded horizon mound) */}
        <svg
          viewBox="0 0 400 320"
          preserveAspectRatio="xMidYMax slice"
          className="pointer-events-none absolute inset-0 w-full h-full"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id={`arenaGlow_${world.id}`} cx="62%" cy="54%" r="48%">
              <stop offset="0%" stopColor={world.palette.accent} stopOpacity="0.28" />
              <stop offset="100%" stopColor={world.palette.accent} stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* Soft rays & center glow */}
          <circle cx="248" cy="172" r="165" fill={`url(#arenaGlow_${world.id})`} />
          {/* Atmospheric stars / crumb motes in sky */}
          <circle cx="52" cy="48" r="3" fill={world.palette.crumbPrimary} opacity="0.35" />
          <circle cx="136" cy="34" r="2.5" fill="#fff8ed" opacity="0.3" />
          <circle cx="318" cy="44" r="3.5" fill={world.palette.crumbPrimary} opacity="0.35" />
          <circle cx="358" cy="96" r="2" fill="#fff8ed" opacity="0.3" />
          <circle cx="78" cy="108" r="2.2" fill={world.palette.crumbSecondary} opacity="0.35" />
          {/* Distant hill silhouette */}
          <path
            d="M0 248 Q110 212 220 236 T400 226 L400 320 L0 320 Z"
            fill="#000000"
            opacity="0.22"
          />
          {/* Foreground mining stage ground */}
          <path
            d="M-10 264 Q200 232 410 264 L410 330 L-10 330 Z"
            fill="#000000"
            opacity="0.34"
          />
          <path
            d="M-10 264 Q200 232 410 264"
            fill="none"
            stroke={world.palette.accent}
            strokeWidth="2.5"
            opacity="0.32"
          />
        </svg>

        {/* Main clickable mining target button */}
        <button
          type="button"
          data-testid="mine-target"
          onClick={handleArenaClick}
          aria-label={boss ? `Atakuj bossa ${boss.name}` : `Kop ${world.name}`}
          className="relative z-10 w-full h-full flex items-center justify-center cursor-pointer select-none focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/70"
        >
          <div className="relative flex items-end justify-center pointer-events-none px-2 pt-4">
            <GorillaSvg
              equippedTool={equippedTool}
              isSwinging={isSwinging}
              isFever={isFever}
              isBoss={Boolean(boss)}
              className="w-44 h-44 sm:w-52 sm:h-52 -mr-6 z-10"
            />
            <WorldObjectSvg
              world={world}
              isBossMode={Boolean(boss)}
              hitFlash={hitFlash}
              hitAnimKey={hitAnimKey}
              className="w-48 h-48 sm:w-56 sm:h-56"
            />
          </div>
          <span className="sr-only">Kliknij, aby kopać chipsy</span>
        </button>

        {/* Flying AirDrop (Latająca Paczka / Złoty Ziemniak) */}
        {airDrop && (
          <button
            type="button"
            data-testid="airdrop-target"
            onClick={onAirDropClick}
            aria-label={
              airDrop.kind === 'golden_potato'
                ? 'Złap Złotego Ziemniaka!'
                : 'Złap Latającą Paczkę Chipsów!'
            }
            className="absolute z-20 p-1.5 rounded-2xl cursor-pointer transition-transform hover:scale-115 active:scale-95 focus-visible:ring-2 focus-visible:ring-yellow-300"
            style={{
              left: `${airDrop.xPercent}%`,
              top: `${airDrop.yPercent}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {airDrop.kind === 'golden_potato' ? (
              <div className="drop-shadow-[0_6px_14px_rgba(250,204,21,0.8)]">
                <GoldenPotatoIconSvg className="w-14 h-14" />
              </div>
            ) : (
              <svg
                viewBox="0 0 64 64"
                className="w-14 h-14 drop-shadow-[0_6px_14px_rgba(56,189,248,0.75)]"
                aria-hidden="true"
              >
                <path
                  d="M16 14 L48 14 L52 50 L12 50 Z"
                  fill="#0284c7"
                  stroke="#180f08"
                  strokeWidth="3.5"
                  strokeLinejoin="round"
                />
                <rect x="14" y="10" width="36" height="6" rx="2" fill="#facc15" stroke="#180f08" strokeWidth="2.8" />
                <rect x="12" y="48" width="40" height="6" rx="2" fill="#facc15" stroke="#180f08" strokeWidth="2.8" />
                <circle cx="32" cy="32" r="10" fill="#fde047" stroke="#180f08" strokeWidth="2.6" />
                <text x="32" y="37" textAnchor="middle" fontWeight="800" fontSize="14" fill="#180f08">
                  ?
                </text>
              </svg>
            )}
          </button>
        )}

        {/* Zero-GC HTML5 Canvas particle overlay */}
        <ParticleCanvas
          ref={canvasRef}
          ambientColor={world.palette.crumbPrimary}
          isFever={isFever}
        />
      </div>

      {/* Bottom Transport / Boss Action Dock */}
      <div className="px-4 py-3 bg-black/35 border-t border-black/35">
        {boss ? (
          <div className="text-center text-xs font-bold text-amber-200">
            Klikaj szybko i pozwól pomocnikom zbić HP bossa przed końcem czasu!
          </div>
        ) : isFinalWorld ? (
          <button
            type="button"
            onClick={onStartBoss}
            className="btn-3d w-full py-2.5 px-4 rounded-xl bg-amber-400 text-stone-950 font-display font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Swords className="w-4 h-4 shrink-0" />
            <span className="truncate">
              Wyzwij Bossa Absolutu (Poz. {state.stats.endlessBossLevel + 1})
            </span>
          </button>
        ) : hasUnlockedNext ? (
          <div className="flex items-center justify-between gap-2 text-xs text-emerald-300 font-bold">
            <span>Boss pokonany — kolejny świat jest odblokowany na mapie!</span>
            <button
              type="button"
              onClick={onStartBoss}
              className="btn-3d bg-stone-800 text-amber-200 px-3 py-1.5 rounded-lg text-xs cursor-pointer whitespace-nowrap"
            >
              Rewanż
            </button>
          </div>
        ) : !hasTransport ? (
          <button
            type="button"
            onClick={onBuyTransport}
            disabled={!canAffordTransport}
            className="btn-3d w-full py-2.5 px-4 rounded-xl bg-amber-400 text-stone-950 font-display font-extrabold text-sm flex items-center justify-between gap-2 cursor-pointer"
          >
            <span className="inline-flex items-center gap-2 truncate">
              <Truck className="w-4 h-4 shrink-0" />
              <span className="truncate">Kup Transport: {world.transportName}</span>
            </span>
            <span className="font-mono-num shrink-0">{formatNumber(world.transportCost)}</span>
          </button>
        ) : (
          <button
            type="button"
            data-testid="start-boss-btn"
            onClick={onStartBoss}
            className="btn-3d w-full py-2.5 px-4 rounded-xl bg-red-500 hover:bg-red-400 text-white font-display font-extrabold text-sm flex items-center justify-between gap-2 cursor-pointer"
          >
            <span className="inline-flex items-center gap-2 truncate">
              <Swords className="w-4 h-4 shrink-0" />
              <span className="truncate">Walcz z Bossem: {world.bossName}</span>
            </span>
            <span className="font-mono-num shrink-0 text-yellow-200">
              +{world.bossSpiceReward} Przypraw
            </span>
          </button>
        )}
      </div>
    </section>
  );
};
