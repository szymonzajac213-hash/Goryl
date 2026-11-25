import React from 'react';
import { WorldDef } from '../../game/types';

interface WorldObjectSvgProps {
  world: WorldDef;
  isBossMode: boolean;
  hitFlash: boolean;
  hitAnimKey: number;
  className?: string;
}

export const WorldObjectSvg: React.FC<WorldObjectSvgProps> = ({
  world,
  isBossMode,
  hitFlash,
  hitAnimKey,
  className = 'w-52 h-52',
}) => {
  const { palette, objectVariant } = world;

  return (
    <div
      key={hitAnimKey}
      className={`relative select-none pointer-events-none ${className} ${
        hitAnimKey > 0 ? 'animate-object-hit' : 'animate-float-slow'
      }`}
    >
      <svg
        viewBox="0 0 220 220"
        className="w-full h-full overflow-visible"
        style={{
          filter: hitFlash
            ? 'brightness(1.45) drop-shadow(0 0 18px rgba(254, 240, 138, 0.85))'
            : isBossMode
              ? 'drop-shadow(0 12px 22px rgba(220, 38, 38, 0.55))'
              : 'drop-shadow(0 12px 18px rgba(0, 0, 0, 0.48))',
        }}
        aria-hidden="true"
      >
        {/* Ground shadow */}
        <ellipse cx="110" cy="198" rx="74" ry="14" fill="#000" opacity="0.38" />

        {/* Boss warning spiky halo */}
        {isBossMode && (
          <polygon
            points="110,8 128,34 158,20 162,50 194,52 182,82 210,104 186,126 202,156 170,162 164,194 134,182 110,206 86,182 56,194 50,162 18,156 34,126 10,104 38,82 26,52 58,50 62,20 92,34"
            fill="#dc2626"
            opacity="0.34"
            stroke="#fca5a5"
            strokeWidth="2.5"
          />
        )}

        {/* World-specific detailed SVG object (all 22 variants!) */}
        {objectVariant === 'potato' && (
          <g stroke="#1a1008" strokeWidth="5.5" strokeLinejoin="round">
            <path
              d="M42 128 C34 78 68 42 118 40 C168 38 188 76 184 124 C180 170 144 190 96 186 C54 182 48 164 42 128 Z"
              fill="#b87e3c"
            />
            <path d="M56 96 C62 66 94 54 124 54" fill="none" stroke="#eab676" strokeWidth="7" strokeLinecap="round" opacity="0.7" />
            <ellipse cx="86" cy="96" rx="9" ry="5" fill="#7c4d1e" strokeWidth="3" />
            <ellipse cx="144" cy="116" rx="11" ry="6" fill="#7c4d1e" strokeWidth="3" />
            <ellipse cx="106" cy="148" rx="8" ry="4.5" fill="#7c4d1e" strokeWidth="3" />
            {/* Sprout leaves on top */}
            <path d="M114 42 C110 22 92 18 88 26 C96 34 106 38 114 42 Z" fill="#22c55e" strokeWidth="4" />
            <path d="M116 42 C122 20 144 18 146 28 C136 36 124 38 116 42 Z" fill="#4ade80" strokeWidth="4" />
          </g>
        )}

        {objectVariant === 'frying_pot' && (
          <g stroke="#1a1008" strokeWidth="5" strokeLinejoin="round">
            <rect x="44" y="84" width="132" height="96" rx="16" fill="#475569" />
            <path d="M30 98h16M174 98h16" stroke="#1a1008" strokeWidth="9" strokeLinecap="round" />
            <ellipse cx="110" cy="84" rx="66" ry="20" fill="#f59e0b" />
            <ellipse cx="110" cy="84" rx="52" ry="12" fill="#fde047" stroke="none" />
            <circle cx="88" cy="78" r="7" fill="#fef9c3" strokeWidth="3" />
            <circle cx="128" cy="84" r="9" fill="#fef9c3" strokeWidth="3" />
            <circle cx="110" cy="54" r="6" fill="#fde047" strokeWidth="3" />
            <circle cx="136" cy="46" r="5" fill="#fb923c" strokeWidth="3" />
          </g>
        )}

        {objectVariant === 'school_bag' && (
          <g stroke="#1a1008" strokeWidth="5" strokeLinejoin="round">
            <path d="M54 44 L166 44 L176 176 L44 176 Z" fill="#2563eb" />
            <path d="M50 44 L170 44 L166 32 L54 32 Z" fill="#facc15" />
            <path d="M44 176 L176 176 L172 188 L48 188 Z" fill="#facc15" />
            <circle cx="110" cy="112" r="36" fill="#fde047" />
            <path d="M90 112 Q110 92 130 112 Q110 132 90 112 Z" fill="#f97316" strokeWidth="3.5" />
          </g>
        )}

        {objectVariant === 'pallet' && (
          <g stroke="#1a1008" strokeWidth="5" strokeLinejoin="round">
            <rect x="34" y="152" width="152" height="28" rx="4" fill="#92400e" />
            <rect x="44" y="96" width="64" height="56" rx="6" fill="#dc2626" />
            <rect x="112" y="96" width="64" height="56" rx="6" fill="#eab308" />
            <rect x="74" y="42" width="72" height="54" rx="6" fill="#ef4444" />
            <rect x="84" y="54" width="52" height="24" rx="4" fill="#fef08a" strokeWidth="3" />
          </g>
        )}

        {objectVariant === 'conveyor' && (
          <g stroke="#1a1008" strokeWidth="5" strokeLinejoin="round">
            <rect x="26" y="128" width="168" height="44" rx="22" fill="#475569" />
            <circle cx="52" cy="150" r="13" fill="#94a3b8" />
            <circle cx="110" cy="150" r="13" fill="#94a3b8" />
            <circle cx="168" cy="150" r="13" fill="#94a3b8" />
            {/* Stacked ridged chips */}
            <ellipse cx="110" cy="108" rx="54" ry="22" fill="#f59e0b" />
            <ellipse cx="110" cy="84" rx="46" ry="18" fill="#fbbf24" />
            <ellipse cx="110" cy="64" rx="36" ry="14" fill="#fde047" />
          </g>
        )}

        {objectVariant === 'deep_fryer' && (
          <g stroke="#1a1008" strokeWidth="5" strokeLinejoin="round">
            <rect x="40" y="88" width="140" height="94" rx="14" fill="#64748b" />
            <rect x="52" y="54" width="116" height="52" rx="8" fill="#f59e0b" />
            <path d="M52 70h116M52 86h116M80 54v52M110 54v52M140 54v52" stroke="#1a1008" strokeWidth="3.5" />
            <path d="M168 62 L198 40" stroke="#dc2626" strokeWidth="10" strokeLinecap="round" />
            <circle cx="88" cy="144" r="10" fill="#ef4444" />
            <circle cx="132" cy="144" r="10" fill="#22c55e" />
          </g>
        )}

        {objectVariant === 'nitrogen_bag' && (
          <g stroke="#1a1008" strokeWidth="5.5" strokeLinejoin="round">
            <path
              d="M44 48 C28 96 28 134 44 176 L176 176 C192 134 192 96 176 48 Z"
              fill="#6366f1"
            />
            <path d="M44 48 L176 48 L172 34 L48 34 Z" fill="#cbd5e1" />
            <path d="M44 176 L176 176 L172 190 L48 190 Z" fill="#cbd5e1" />
            {/* Air bubble inside */}
            <ellipse cx="110" cy="96" rx="44" ry="32" fill="#e0f2fe" opacity="0.88" strokeWidth="3.5" />
            <text x="110" y="105" textAnchor="middle" fontWeight="800" fontSize="26" fill="#1e3a8a" stroke="none">
              80% N₂
            </text>
            {/* Tiny pile of chips at the very bottom */}
            <ellipse cx="95" cy="154" rx="16" ry="8" fill="#fde047" strokeWidth="3" />
            <ellipse cx="126" cy="156" rx="16" ry="8" fill="#f59e0b" strokeWidth="3" />
          </g>
        )}

        {objectVariant === 'salt_crystal' && (
          <g stroke="#1a1008" strokeWidth="5" strokeLinejoin="round">
            <polygon points="110,24 156,74 144,174 76,174 64,74" fill="#67e8f9" />
            <polygon points="62,72 86,174 42,164 34,112" fill="#22d3ee" />
            <polygon points="158,72 186,112 178,164 134,174" fill="#06b6d4" />
            <polygon points="110,24 132,74 110,152 88,74" fill="#ecfeff" opacity="0.7" stroke="none" />
          </g>
        )}

        {objectVariant === 'area51_can' && (
          <g stroke="#1a1008" strokeWidth="5" strokeLinejoin="round">
            <rect x="58" y="42" width="104" height="142" rx="18" fill="#3f6212" />
            <rect x="68" y="72" width="84" height="82" rx="10" fill="#a3e635" />
            <circle cx="110" cy="112" r="24" fill="#1a2e05" />
            <ellipse cx="101" cy="108" rx="6" ry="9" transform="rotate(-20 101 108)" fill="#bef264" stroke="none" />
            <ellipse cx="119" cy="108" rx="6" ry="9" transform="rotate(20 119 108)" fill="#bef264" stroke="none" />
          </g>
        )}

        {objectVariant === 'satellite' && (
          <g stroke="#1a1008" strokeWidth="5" strokeLinejoin="round">
            <rect x="18" y="84" width="54" height="52" rx="6" fill="#2563eb" />
            <rect x="148" y="84" width="54" height="52" rx="6" fill="#2563eb" />
            <circle cx="110" cy="110" r="42" fill="#cbd5e1" />
            <circle cx="110" cy="110" r="24" fill="#f59e0b" />
            <line x1="110" y1="68" x2="110" y2="34" stroke="#1a1008" strokeWidth="6" />
            <circle cx="110" cy="30" r="9" fill="#ef4444" />
          </g>
        )}

        {objectVariant === 'cheddar_moon' && (
          <g stroke="#1a1008" strokeWidth="5.5">
            <circle cx="110" cy="112" r="74" fill="#facc15" />
            <circle cx="80" cy="88" r="16" fill="#d97706" strokeWidth="3.5" />
            <circle cx="142" cy="96" r="20" fill="#d97706" strokeWidth="3.5" />
            <circle cx="108" cy="146" r="14" fill="#d97706" strokeWidth="3.5" />
            <circle cx="144" cy="148" r="9" fill="#d97706" strokeWidth="3" />
          </g>
        )}

        {objectVariant === 'paprika_mars' && (
          <g stroke="#1a1008" strokeWidth="5.5">
            <circle cx="110" cy="112" r="74" fill="#dc2626" />
            <path d="M54 90 Q110 72 168 96" fill="none" stroke="#f97316" strokeWidth="14" strokeLinecap="round" opacity="0.8" />
            <path d="M46 132 Q110 154 174 126" fill="none" stroke="#991b1b" strokeWidth="12" strokeLinecap="round" />
            <circle cx="110" cy="112" r="74" fill="none" stroke="#1a1008" strokeWidth="5.5" />
          </g>
        )}

        {objectVariant === 'asteroid' && (
          <g stroke="#1a1008" strokeWidth="5.5" strokeLinejoin="round">
            <polygon points="72,42 138,34 182,78 174,148 124,186 56,166 36,104" fill="#78716c" />
            <circle cx="88" cy="92" r="14" fill="#fbbf24" strokeWidth="3.5" />
            <circle cx="138" cy="126" r="18" fill="#f59e0b" strokeWidth="3.5" />
            <circle cx="122" cy="70" r="9" fill="#fde047" strokeWidth="3" />
          </g>
        )}

        {objectVariant === 'onion_jupiter' && (
          <g stroke="#1a1008" strokeWidth="5.5">
            <circle cx="110" cy="112" r="74" fill="#22c55e" />
            <path d="M42 86 Q110 68 178 86" fill="none" stroke="#86efac" strokeWidth="13" />
            <path d="M38 118 Q110 136 182 118" fill="none" stroke="#15803d" strokeWidth="14" />
            <ellipse cx="136" cy="134" rx="22" ry="14" fill="#ef4444" strokeWidth="3.5" />
            <circle cx="110" cy="112" r="74" fill="none" stroke="#1a1008" strokeWidth="5.5" />
          </g>
        )}

        {objectVariant === 'saturn_rings' && (
          <g stroke="#1a1008" strokeWidth="5">
            <ellipse cx="110" cy="114" rx="96" ry="30" transform="rotate(-18 110 114)" fill="#f59e0b" />
            <ellipse cx="110" cy="114" rx="76" ry="20" transform="rotate(-18 110 114)" fill="#1f170c" stroke="none" />
            <circle cx="110" cy="112" r="48" fill="#fde047" />
            <path d="M24 142 Q110 166 196 86" fill="none" stroke="#fbbf24" strokeWidth="14" strokeLinecap="round" />
            <path d="M24 142 Q110 166 196 86" fill="none" stroke="#1a1008" strokeWidth="4" strokeLinecap="round" />
          </g>
        )}

        {objectVariant === 'cryo_pluto' && (
          <g stroke="#1a1008" strokeWidth="5.5" strokeLinejoin="round">
            <polygon points="110,28 178,68 178,154 110,192 42,154 42,68" fill="#7dd3fc" />
            <polygon points="110,48 158,78 158,142 110,170 62,142 62,78" fill="#e0f2fe" strokeWidth="3.5" />
            <path d="M110 66v88M74 88l72 44M146 88l-72 44" stroke="#0284c7" strokeWidth="5" strokeLinecap="round" />
          </g>
        )}

        {objectVariant === 'black_hole' && (
          <g stroke="#1a1008" strokeWidth="5">
            <ellipse cx="110" cy="112" rx="94" ry="32" transform="rotate(-14 110 112)" fill="#a855f7" />
            <ellipse cx="110" cy="112" rx="74" ry="22" transform="rotate(-14 110 112)" fill="#fde047" strokeWidth="3" />
            <circle cx="110" cy="112" r="46" fill="#09040f" stroke="#e879f9" strokeWidth="5" />
          </g>
        )}

        {objectVariant === 'reaper_core' && (
          <g stroke="#1a1008" strokeWidth="5.5" strokeLinejoin="round">
            <path
              d="M110 26 C142 54 176 74 166 130 C158 170 128 190 92 184 C54 176 44 134 56 96 C66 64 90 54 110 26 Z"
              fill="#dc2626"
            />
            <path d="M110 56 C130 82 146 104 134 142 C122 164 88 164 78 134 C72 104 92 84 110 56 Z" fill="#f97316" strokeWidth="3.5" />
            <circle cx="108" cy="126" r="18" fill="#fef08a" stroke="none" />
          </g>
        )}

        {objectVariant === 'cyber_chip' && (
          <g stroke="#1a1008" strokeWidth="5" strokeLinejoin="round">
            <rect x="46" y="48" width="128" height="128" rx="16" fill="#0f766e" />
            <rect x="68" y="70" width="84" height="84" rx="10" fill="#134e4a" />
            <polygon points="110,82 138,112 110,142 82,112" fill="#2dd4bf" />
            <path d="M46 80H26M46 112H26M46 144H26M174 80h20M174 112h20M174 144h20" stroke="#fbbf24" strokeWidth="7" strokeLinecap="round" />
          </g>
        )}

        {objectVariant === 'golden_ruins' && (
          <g stroke="#1a1008" strokeWidth="5" strokeLinejoin="round">
            <polygon points="110,28 186,176 34,176" fill="#d97706" />
            <polygon points="110,56 164,162 56,162" fill="#facc15" strokeWidth="3.5" />
            <circle cx="110" cy="118" r="22" fill="#fef9c3" />
            <circle cx="110" cy="118" r="9" fill="#92400e" />
          </g>
        )}

        {objectVariant === 'dark_bbq' && (
          <g stroke="#1a1008" strokeWidth="5.5">
            <circle cx="110" cy="112" r="72" fill="#4c1d95" />
            <path d="M52 112 A58 58 0 0 1 168 112" fill="none" stroke="#f97316" strokeWidth="14" strokeLinecap="round" />
            <circle cx="110" cy="112" r="34" fill="#1e1b4b" stroke="#f472b6" strokeWidth="4" />
            <polygon points="110,88 118,106 136,112 118,118 110,136 102,118 84,112 102,106" fill="#fde047" stroke="none" />
          </g>
        )}

        {objectVariant === 'absolute_crunch' && (
          <g stroke="#1a1008" strokeWidth="5" strokeLinejoin="round">
            <polygon
              points="110,18 134,70 190,62 152,106 188,154 132,148 110,202 88,148 32,154 68,106 30,62 86,70"
              fill="#f59e0b"
            />
            <circle cx="110" cy="110" r="46" fill="#fde047" />
            <ellipse cx="110" cy="110" rx="28" ry="18" fill="#ffffff" opacity="0.85" stroke="#d97706" strokeWidth="4" />
          </g>
        )}

        {/* Menacing Boss Face & Crown Overlay when fighting a Boss! */}
        {isBossMode && (
          <g>
            {/* Boss Crown */}
            <polygon
              points="74,46 84,18 110,36 136,18 146,46"
              fill="#facc15"
              stroke="#1a1008"
              strokeWidth="4.5"
              strokeLinejoin="round"
            />
            {/* Angry Eyes */}
            <polygon points="74,98 100,108 78,118" fill="#fef08a" stroke="#1a1008" strokeWidth="3.5" />
            <polygon points="146,98 120,108 142,118" fill="#fef08a" stroke="#1a1008" strokeWidth="3.5" />
            <circle cx="88" cy="109" r="3.5" fill="#dc2626" />
            <circle cx="132" cy="109" r="3.5" fill="#dc2626" />
            {/* Jagged Boss Mouth */}
            <path
              d="M78 138 L90 128 L102 140 L110 128 L118 140 L130 128 L142 138 L134 152 L86 152 Z"
              fill="#180f08"
              stroke="#fef08a"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
          </g>
        )}

        {/* World accent shimmer dots */}
        <circle cx="42" cy="54" r="4" fill={palette.crumbPrimary} opacity="0.75" />
        <circle cx="184" cy="64" r="5" fill={palette.crumbSecondary} opacity="0.75" />
      </svg>
    </div>
  );
};
