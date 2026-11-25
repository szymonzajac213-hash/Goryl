import React from 'react';
import { Award, Play, RotateCcw, ShieldAlert, Sparkles, X } from 'lucide-react';
import { RARITY_META } from '../game/data/tools';
import { formatDuration, formatNumber } from '../game/format';
import { ToolDef } from '../game/types';
import { ChipIconSvg, GoldenPotatoIconSvg, ToolGraphicSvg } from './svg/ToolIconSvg';

export interface ToastItem {
  id: number;
  title: string;
  subtitle: string;
}

export const AchievementToastStack: React.FC<{ toasts: ToastItem[] }> = ({ toasts }) => {
  if (toasts.length === 0) return null;
  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-xs w-full"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="panel-cartoon rounded-xl bg-[#25180f] border-amber-400 px-3.5 py-2.5 flex items-center gap-2.5"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-400 text-stone-950 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-extrabold text-amber-300 truncate">{t.title}</div>
            <div className="text-[11px] text-amber-100/85 truncate">{t.subtitle}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const PauseModal: React.FC<{
  chips: number;
  highestWorld: number;
  achievementsCount: number;
  onResume: () => void;
  onReturnTitle: () => void;
}> = ({ chips, highestWorld, achievementsCount, onResume, onReturnTitle }) => (
  <div
    role="dialog"
    aria-modal="true"
    aria-labelledby="pause-modal-title"
    className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
  >
    <div className="panel-cartoon rounded-2xl bg-[#261a12] max-w-md w-full p-6 text-center">
      <h2 id="pause-modal-title" className="font-display font-extrabold text-2xl text-amber-300">
        Pauza
      </h2>
      <p className="mt-1 text-xs text-amber-100/75">
        Kopalnia czeka — goryle odpoczywają na przerwie.
      </p>

      <div className="mt-5 grid grid-cols-3 gap-2">
        <div className="p-2.5 rounded-xl bg-[#1a110b] border border-[#3a281c]">
          <div className="text-[11px] text-amber-200/70">Chipsy</div>
          <div className="font-mono-num font-extrabold text-sm text-amber-300">
            {formatNumber(chips)}
          </div>
        </div>
        <div className="p-2.5 rounded-xl bg-[#1a110b] border border-[#3a281c]">
          <div className="text-[11px] text-amber-200/70">Światy</div>
          <div className="font-mono-num font-extrabold text-sm text-amber-300">
            {highestWorld}/22
          </div>
        </div>
        <div className="p-2.5 rounded-xl bg-[#1a110b] border border-[#3a281c]">
          <div className="text-[11px] text-amber-200/70">Osiągnięcia</div>
          <div className="font-mono-num font-extrabold text-sm text-emerald-300">
            {achievementsCount}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2.5">
        <button
          type="button"
          onClick={onResume}
          className="btn-3d w-full py-3 rounded-xl bg-amber-400 text-stone-950 font-display font-extrabold text-base inline-flex items-center justify-center gap-2 cursor-pointer"
        >
          <Play className="w-4 h-4" />
          Wznów kopanie
        </button>
        <button
          type="button"
          onClick={onReturnTitle}
          className="btn-3d w-full py-2.5 rounded-xl bg-stone-800 text-amber-100 font-bold text-sm cursor-pointer"
        >
          Ekran tytułowy
        </button>
      </div>
    </div>
  </div>
);

export const OfflineProgressModal: React.FC<{
  elapsedSec: number;
  chipsEarned: number;
  onClaim: () => void;
}> = ({ elapsedSec, chipsEarned, onClaim }) => (
  <div
    role="dialog"
    aria-modal="true"
    aria-labelledby="offline-modal-title"
    className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
  >
    <div className="panel-cartoon rounded-2xl bg-[#261a12] max-w-md w-full p-6 text-center">
      <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-400/20 border-2 border-amber-400 flex items-center justify-center">
        <ChipIconSvg className="w-10 h-10" />
      </div>
      <h2 id="offline-modal-title" className="mt-3 font-display font-extrabold text-xl text-amber-300">
        Witaj z powrotem!
      </h2>
      <p className="mt-2 text-sm text-amber-100/90 leading-relaxed">
        Podczas gdy Cię nie było ({formatDuration(elapsedSec)}), Twoje goryle nasmażyły{' '}
        <strong className="font-mono-num text-amber-300">{formatNumber(chipsEarned)} chipsów</strong>!
      </p>
      <button
        type="button"
        onClick={onClaim}
        className="btn-3d mt-5 w-full py-3 rounded-xl bg-amber-400 text-stone-950 font-display font-extrabold text-base cursor-pointer"
      >
        Odbierz chipsy
      </button>
    </div>
  </div>
);

export const CrateRewardModal: React.FC<{
  tool: ToolDef;
  isDuplicate: boolean;
  onClose: () => void;
  onEquipNow: () => void;
}> = ({ tool, isDuplicate, onClose, onEquipNow }) => {
  const meta = RARITY_META[tool.rarity];
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="crate-modal-title"
      className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
    >
      <div className="panel-cartoon rounded-2xl bg-[#261a12] max-w-sm w-full p-6 text-center relative">
        <button
          type="button"
          onClick={onClose}
          aria-label="Zamknij okno nagrody"
          className="absolute top-3 right-3 text-amber-200/70 hover:text-white p-1 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="inline-flex items-center gap-1 text-xs font-extrabold text-amber-300">
          <Sparkles className="w-4 h-4" />
          ZAWARTOŚĆ SKRZYNKI
        </div>

        <div
          className="mx-auto mt-3 w-24 h-24 rounded-2xl border-4 flex items-center justify-center"
          style={{ background: meta.bg, borderColor: meta.border }}
        >
          <ToolGraphicSvg tool={tool} className="w-20 h-20" />
        </div>

        <h3 id="crate-modal-title" className="mt-3 font-display font-extrabold text-xl text-amber-50">
          {tool.name}
        </h3>
        <div className="text-xs font-extrabold mt-0.5" style={{ color: meta.color }}>
          {meta.label} {isDuplicate ? '· Duplikat (do przetopienia)' : '· NOWE NARZĘDZIE!'}
        </div>
        <p className="mt-2 text-xs text-amber-100/80">{tool.description}</p>
        <div className="mt-3 text-xs font-mono-num text-amber-200">
          +{formatNumber(tool.cpcBonus)} CPC · +{tool.cpsPercent}% CPS · +
          {Math.round(tool.critChanceBonus * 100)}% Kryt · +{tool.luckBonus} Szczęścia
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onEquipNow}
            className="btn-3d flex-1 py-2.5 rounded-xl bg-amber-400 text-stone-950 font-extrabold text-sm cursor-pointer"
          >
            Załóż teraz
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn-3d py-2.5 px-4 rounded-xl bg-stone-800 text-amber-100 font-bold text-sm cursor-pointer"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export const ConfirmModal: React.FC<{
  title: string;
  description: string;
  confirmLabel: string;
  danger?: boolean;
  highlightBadge?: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ title, description, confirmLabel, danger, highlightBadge, onConfirm, onCancel }) => (
  <div
    role="dialog"
    aria-modal="true"
    aria-labelledby="confirm-modal-title"
    className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
  >
    <div className="panel-cartoon rounded-2xl bg-[#261a12] max-w-md w-full p-6 text-center">
      <div className="mx-auto w-12 h-12 rounded-2xl bg-black/40 border-2 border-amber-400/60 flex items-center justify-center">
        {danger ? (
          <ShieldAlert className="w-6 h-6 text-red-400" />
        ) : (
          <GoldenPotatoIconSvg className="w-8 h-8" />
        )}
      </div>
      <h2 id="confirm-modal-title" className="mt-3 font-display font-extrabold text-xl text-amber-200">
        {title}
      </h2>
      {highlightBadge && (
        <div className="mt-2 font-mono-num text-sm font-extrabold text-yellow-300">
          {highlightBadge}
        </div>
      )}
      <p className="mt-2 text-xs sm:text-sm text-amber-100/85 leading-relaxed">{description}</p>
      <div className="mt-5 flex gap-2.5">
        <button
          type="button"
          onClick={onCancel}
          className="btn-3d flex-1 py-2.5 rounded-xl bg-stone-800 text-amber-100 font-bold text-sm cursor-pointer"
        >
          Anuluj
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className={`btn-3d flex-1 py-2.5 rounded-xl font-extrabold text-sm inline-flex items-center justify-center gap-1.5 cursor-pointer ${
            danger ? 'bg-red-600 text-white' : 'bg-yellow-400 text-stone-950'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
);
