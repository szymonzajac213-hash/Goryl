import React, { useEffect, useRef } from 'react';
import { getToolById } from '../game/data/tools';
import { getWorldById } from '../game/data/worlds';
import { formatNumber } from '../game/format';
import { GameState } from '../game/types';
import { ParticleCanvas, ParticleCanvasHandle } from './ParticleCanvas';
import { GorillaSvg } from './svg/GorillaSvg';
import { TitleLogoSvg } from './svg/ToolIconSvg';
import { WorldObjectSvg } from './svg/WorldObjectSvg';

interface TitleScreenProps {
  hasExistingSave: boolean;
  savedState: GameState;
  onStart: () => void;
  onNewGame: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  hasExistingSave,
  savedState,
  onStart,
  onNewGame,
}) => {
  const canvasRef = useRef<ParticleCanvasHandle | null>(null);
  const world = getWorldById(savedState.currentWorldId);
  const tool = getToolById(savedState.equippedToolId);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onStart();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onStart]);

  const handleStageTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;
    canvasRef.current?.spawnHit(nx, ny, 'CHRUP!', false, '#fde047', '#f59e0b');
  };

  return (
    <main
      className="relative min-h-screen w-full overflow-hidden flex flex-col justify-between"
      style={{
        background:
          'radial-gradient(circle at 26% 48%, #3c2716 0%, #20150d 48%, #120b07 100%)',
      }}
    >
      {/* Subtle decorative radial sunburst lines behind showcase */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'repeating-conic-gradient(from 0deg at 28% 52%, rgba(251, 191, 36, 0.25) 0deg 10deg, transparent 10deg 24deg)',
        }}
      />

      <ParticleCanvas ref={canvasRef} ambientColor="#fbbf24" isFever />

      {/* Main asymmetric two-region showcase: Left focal hero, Right calm negative space + title/CTA */}
      <div className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: Interactive Centerpiece Showcase */}
        <div
          onClick={handleStageTap}
          className="lg:col-span-6 flex flex-col items-center justify-center relative cursor-pointer select-none min-h-[320px] lg:min-h-[460px]"
        >
          <div className="relative flex items-end justify-center gap-0 sm:gap-2 z-10">
            <GorillaSvg
              equippedTool={tool}
              isSwinging={false}
              isFever={false}
              isBoss={false}
              className="w-48 h-48 sm:w-64 sm:h-64 -mr-6 z-10"
            />
            <WorldObjectSvg
              world={world}
              isBossMode={false}
              hitFlash={false}
              hitAnimKey={0}
              className="w-48 h-48 sm:w-64 sm:h-64"
            />
          </div>
          <p className="relative z-10 mt-4 text-xs font-semibold text-amber-200/75 tracking-wide">
            Świat {world.id}/22 · {world.name}
          </p>
        </div>

        {/* Right: Title Lockup & Actions over calm negative space */}
        <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left">
          <TitleLogoSvg className="w-full max-w-[490px] drop-shadow-[0_10px_22px_rgba(0,0,0,0.65)]" />

          <p className="mt-4 text-base sm:text-lg text-amber-100/90 max-w-md leading-relaxed">
            Krusz bulwy, pokonuj bossów zgrzewu, zbieraj legendarne narzędzia i podbij wszystkie
            22 chipsowe światy.
          </p>

          {hasExistingSave && (
            <div className="mt-4 text-sm text-amber-200/80 font-mono-num">
              Zapisany postęp: {formatNumber(savedState.chips)} Chipsów · Świat{' '}
              {savedState.highestWorldUnlocked}/22
            </div>
          )}

          <div className="mt-7 flex flex-wrap items-center justify-center lg:justify-start gap-4">
            <button
              type="button"
              data-start="true"
              onClick={onStart}
              className="btn-3d bg-amber-400 hover:bg-amber-300 text-stone-950 font-display font-extrabold text-xl px-8 py-3.5 rounded-2xl cursor-pointer whitespace-nowrap"
            >
              {hasExistingSave ? 'Kontynuuj kopanie' : 'Rozpocznij kopanie'}
            </button>

            {hasExistingSave && (
              <button
                type="button"
                onClick={onNewGame}
                className="btn-3d bg-stone-800 hover:bg-stone-700 text-amber-100 font-display font-bold text-base px-5 py-3.5 rounded-2xl cursor-pointer whitespace-nowrap"
              >
                Nowa gra
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Single flat borderless control-hint line in bottom safe margin */}
      <footer className="relative z-10 pb-5 px-6 text-center text-xs sm:text-sm text-amber-200/65">
        Klikaj lub Spacja: Kop · 1–5: Zakładki · M: Dźwięk · Esc: Pauza
      </footer>
    </main>
  );
};
