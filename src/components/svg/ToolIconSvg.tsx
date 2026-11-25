import React from 'react';
import { HelperDef, ToolDef } from '../../game/types';

export const ChipIconSvg: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
    <ellipse
      cx="16"
      cy="17"
      rx="13"
      ry="10.5"
      fill="#f59e0b"
      stroke="#1b110a"
      strokeWidth="2.4"
    />
    <ellipse cx="16" cy="15.5" rx="10.5" ry="7.8" fill="#fde047" />
    <path
      d="M7 15c3-2.5 6 2.5 9 0s6 2.5 9 0"
      fill="none"
      stroke="#d97706"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <circle cx="11.5" cy="12.5" r="1.3" fill="#b45309" />
    <circle cx="19.5" cy="18.5" r="1.4" fill="#b45309" />
    <circle cx="16.5" cy="12" r="1" fill="#fffbeb" />
  </svg>
);

export const SpiceIconSvg: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
    <path
      d="M16 3l3.6 7.4 8.2 1.2-5.9 5.8 1.4 8.2L16 21.8l-7.3 3.8 1.4-8.2-5.9-5.8 8.2-1.2z"
      fill="#fb923c"
      stroke="#1b110a"
      strokeWidth="2.4"
      strokeLinejoin="round"
    />
    <path d="M16 7.5l2.2 4.5 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.5 5-.7z" fill="#fef08a" />
  </svg>
);

export const GoldenPotatoIconSvg: React.FC<{ className?: string }> = ({
  className = 'w-5 h-5',
}) => (
  <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
    <path
      d="M7 18c-1.5-6.5 3.5-12 10.5-12.5S27 11 26 17.5C25 24 19 27.5 13 26.5S8.5 24.5 7 18z"
      fill="#facc15"
      stroke="#1b110a"
      strokeWidth="2.4"
    />
    <ellipse cx="13" cy="12" rx="3.2" ry="1.8" transform="rotate(-24 13 12)" fill="#fef9c3" />
    <circle cx="19.5" cy="15.5" r="1.4" fill="#a16207" />
    <circle cx="14.5" cy="21" r="1.2" fill="#a16207" />
    <circle cx="21" cy="20.5" r="1" fill="#a16207" />
  </svg>
);

export const CrateIconSvg: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
    <rect
      x="4"
      y="6"
      width="24"
      height="21"
      rx="3.5"
      fill="#b45309"
      stroke="#1b110a"
      strokeWidth="2.4"
    />
    <path d="M4 13h24M13 6v21M19 6v21" stroke="#1b110a" strokeWidth="2" />
    <rect x="12" y="10.5" width="8" height="5" rx="1.5" fill="#fde047" stroke="#1b110a" strokeWidth="1.8" />
  </svg>
);

export const ToolGraphicSvg: React.FC<{
  tool: ToolDef;
  className?: string;
}> = ({ tool, className = 'w-10 h-10' }) => {
  const c1 = tool.primaryColor;
  const c2 = tool.secondaryColor;

  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      {tool.shape === 'fork' && (
        <g stroke="#180f08" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 52L36 32" stroke={c2} strokeWidth="6" />
          <path d="M16 52L36 32" fill="none" stroke="#180f08" strokeWidth="2.2" />
          <path d="M32 28l14-14M38 34l14-14M35 31l15-15" stroke={c1} strokeWidth="4.5" />
          <path d="M30 30l14-14M36 36l14-14M33 33l15-15" fill="none" stroke="#180f08" strokeWidth="1.8" />
          <circle cx="35" cy="33" r="5" fill={c1} />
        </g>
      )}
      {tool.shape === 'spoon' && (
        <g stroke="#180f08" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 51L35 29" stroke={c2} strokeWidth="6.5" />
          <ellipse cx="43" cy="21" rx="11" ry="8" transform="rotate(-45 43 21)" fill={c1} />
          <ellipse cx="42" cy="19.5" rx="5" ry="3" transform="rotate(-45 42 19.5)" fill="#fffbeb" stroke="none" opacity="0.55" />
        </g>
      )}
      {tool.shape === 'peeler' && (
        <g stroke="#180f08" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <rect x="10" y="34" width="24" height="9" rx="4" transform="rotate(-45 22 38)" fill={c2} />
          <path d="M30 24l15-15 10 10-15 15z" fill={c1} />
          <line x1="36" y1="26" x2="46" y2="16" stroke="#180f08" strokeWidth="2.5" />
        </g>
      )}
      {tool.shape === 'shovel' && (
        <g stroke="#180f08" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 52L34 30" stroke={c2} strokeWidth="6" />
          <path d="M29 25l16-14 11 11-14 16-13-13z" fill={c1} />
          <path d="M35 24l9-8" stroke="#fff" strokeWidth="2" opacity="0.6" />
        </g>
      )}
      {tool.shape === 'hammer' && (
        <g stroke="#180f08" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 52L38 28" stroke={c2} strokeWidth="7" />
          <rect
            x="28"
            y="8"
            width="24"
            height="15"
            rx="4"
            transform="rotate(45 40 16)"
            fill={c1}
          />
          <circle cx="44" cy="17" r="3" fill={c2} stroke="none" />
        </g>
      )}
      {tool.shape === 'wrench' && (
        <g stroke="#180f08" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 49L38 26" stroke={c2} strokeWidth="7" />
          <path
            d="M34 17a11 11 0 1 1 13 13l-6-6 3-3-3-3-3 3z"
            fill={c1}
          />
        </g>
      )}
      {tool.shape === 'cleaver' && (
        <g stroke="#180f08" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 50l14-14" stroke={c2} strokeWidth="7" />
          <path d="M22 34L44 12l12 12-20 20z" fill={c1} />
          <circle cx="44" cy="20" r="2.8" fill="#180f08" stroke="none" />
        </g>
      )}
      {tool.shape === 'chainsaw' && (
        <g stroke="#180f08" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="8" y="34" width="20" height="15" rx="4" transform="rotate(-32 18 42)" fill={c2} />
          <rect x="23" y="21" width="32" height="11" rx="5.5" transform="rotate(-32 39 27)" fill={c1} />
          <path d="M31 28l18-11" stroke="#fef08a" strokeWidth="2.5" strokeDasharray="3 3" />
        </g>
      )}
      {tool.shape === 'laser_blade' && (
        <g stroke="#180f08" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="10" y="38" width="16" height="9" rx="3" transform="rotate(-45 18 42)" fill={c2} />
          <path d="M24 38L54 8l2 2-30 30z" fill={c1} />
          <line x1="27" y1="35" x2="51" y2="11" stroke="#ffffff" strokeWidth="2.2" />
        </g>
      )}
      {tool.shape === 'plasma_drill' && (
        <g stroke="#180f08" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="34" width="18" height="14" rx="4" transform="rotate(-45 18 41)" fill={c2} />
          <polygon points="24,28 56,8 36,40" fill={c1} />
          <line x1="30" y1="24" x2="40" y2="34" stroke="#180f08" strokeWidth="2.5" />
          <line x1="38" y1="18" x2="45" y2="25" stroke="#180f08" strokeWidth="2.5" />
        </g>
      )}
      {tool.shape === 'scepter' && (
        <g stroke="#180f08" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 52L40 24" stroke={c2} strokeWidth="6" />
          <polygon points="45,8 49,17 58,19 50,25 52,34 44,29 36,34 38,25 31,19 40,17" fill={c1} />
          <circle cx="44" cy="22" r="4" fill="#fffbeb" stroke="none" />
        </g>
      )}
      {tool.shape === 'gauntlet' && (
        <g stroke="#180f08" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="16" y="20" width="32" height="32" rx="9" fill={c1} />
          <rect x="18" y="42" width="28" height="12" rx="4" fill={c2} />
          <circle cx="24" cy="29" r="3" fill="#ef4444" stroke="none" />
          <circle cx="32" cy="27" r="3" fill="#3b82f6" stroke="none" />
          <circle cx="40" cy="29" r="3" fill="#22c55e" stroke="none" />
          <circle cx="32" cy="36" r="4" fill="#a855f7" stroke="none" />
        </g>
      )}
    </svg>
  );
};

export const HelperBadgeSvg: React.FC<{
  helper: HelperDef;
  className?: string;
}> = ({ helper, className = 'w-10 h-10' }) => {
  const c = helper.accentColor;
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <rect
        x="3"
        y="3"
        width="42"
        height="42"
        rx="11"
        fill="#241811"
        stroke="#130b06"
        strokeWidth="3"
      />
      <circle cx="24" cy="24" r="15" fill={c} opacity="0.22" />
      {helper.iconKey === 'starling' && (
        <g stroke="#140c06" strokeWidth="2.2" strokeLinejoin="round">
          <ellipse cx="23" cy="26" rx="10" ry="7.5" fill={c} />
          <circle cx="30" cy="19" r="6" fill={c} />
          <polygon points="35,18 42,20 35,22" fill="#facc15" />
          <circle cx="31.5" cy="18" r="1.4" fill="#140c06" stroke="none" />
        </g>
      )}
      {(helper.iconKey === 'intern' || helper.iconKey === 'chimp' || helper.iconKey === 'baboon' || helper.iconKey === 'cybergorilla') && (
        <g stroke="#140c06" strokeWidth="2.2">
          <circle cx="13" cy="22" r="4.5" fill="#7c5238" />
          <circle cx="35" cy="22" r="4.5" fill="#7c5238" />
          <circle cx="24" cy="24" r="12" fill={helper.iconKey === 'cybergorilla' ? '#334155' : '#4a3222'} />
          <ellipse cx="24" cy="27" rx="8.5" ry="6.5" fill={helper.iconKey === 'cybergorilla' ? '#94a3b8' : '#c6936c'} />
          <circle cx="20" cy="21" r="2.2" fill={helper.iconKey === 'cybergorilla' ? '#2dd4bf' : '#fff'} stroke="none" />
          <circle cx="28" cy="21" r="2.2" fill={helper.iconKey === 'cybergorilla' ? '#2dd4bf' : '#fff'} stroke="none" />
          <path d="M14 15h20l-2-6H16z" fill={c} />
        </g>
      )}
      {helper.iconKey === 'grandma' && (
        <g stroke="#140c06" strokeWidth="2.2">
          <circle cx="24" cy="12" r="5" fill="#e2e8f0" />
          <circle cx="24" cy="25" r="11" fill="#fde68a" />
          <circle cx="19.5" cy="24" r="3" fill="none" stroke="#140c06" />
          <circle cx="28.5" cy="24" r="3" fill="none" stroke="#140c06" />
          <path d="M20 31q4 3 8 0" fill="none" strokeLinecap="round" />
        </g>
      )}
      {(helper.iconKey === 'forklift' || helper.iconKey === 'harvester') && (
        <g stroke="#140c06" strokeWidth="2.2" strokeLinejoin="round">
          <rect x="10" y="18" width="18" height="14" rx="3" fill={c} />
          <path d="M28 14v18h10" fill="none" stroke="#e2e8f0" strokeWidth="3.2" />
          <circle cx="15" cy="34" r="4" fill="#1e293b" />
          <circle cx="25" cy="34" r="4" fill="#1e293b" />
        </g>
      )}
      {helper.iconKey === 'kebab' && (
        <g stroke="#140c06" strokeWidth="2.2">
          <path d="M16 14h16l-2 22H18z" fill="#b45309" />
          <ellipse cx="24" cy="14" rx="8" ry="3.5" fill={c} />
          <line x1="24" y1="8" x2="24" y2="40" stroke="#e2e8f0" strokeWidth="2.4" />
        </g>
      )}
      {(helper.iconKey === 'laser' || helper.iconKey === 'frybot') && (
        <g stroke="#140c06" strokeWidth="2.2">
          <rect x="12" y="13" width="24" height="20" rx="5" fill="#475569" />
          <rect x="16" y="18" width="16" height="6" rx="2" fill={c} />
          <line x1="24" y1="7" x2="24" y2="13" stroke={c} strokeWidth="3" />
          <circle cx="24" cy="7" r="2.5" fill={c} />
        </g>
      )}
      {(helper.iconKey === 'nitrogen' || helper.iconKey === 'chemist') && (
        <g stroke="#140c06" strokeWidth="2.2">
          <path d="M19 10h10v7l7 15a4 4 0 0 1-3.5 6h-17a4 4 0 0 1-3.5-6l7-15z" fill={c} />
          <circle cx="22" cy="29" r="2" fill="#fff" stroke="none" />
          <circle cx="27" cy="25" r="1.5" fill="#fff" stroke="none" />
        </g>
      )}
      {(helper.iconKey === 'oil_sat' || helper.iconKey === 'replicator') && (
        <g stroke="#140c06" strokeWidth="2.2">
          <rect x="6" y="19" width="11" height="10" rx="2" fill="#38bdf8" />
          <rect x="31" y="19" width="11" height="10" rx="2" fill="#38bdf8" />
          <circle cx="24" cy="24" r="7" fill={c} />
        </g>
      )}
      {(helper.iconKey === 'portal' || helper.iconKey === 'wizard' || helper.iconKey === 'god') && (
        <g stroke="#140c06" strokeWidth="2.2">
          <circle cx="24" cy="24" r="13" fill={c} opacity="0.9" />
          <circle cx="24" cy="24" r="7.5" fill="#180f08" />
          <polygon points="24,13 26.5,21 34,24 26.5,27 24,35 21.5,27 14,24 21.5,21" fill="#fef08a" stroke="none" />
        </g>
      )}
    </svg>
  );
};

export const TitleLogoSvg: React.FC<{ className?: string }> = ({ className = 'w-full max-w-xl' }) => (
  <svg viewBox="0 0 640 210" className={className} role="img" aria-label="Goryl Miner: Chipsowa Ekspansja">
    <defs>
      <linearGradient id="goldTitleFill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="55%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#c2410c" />
      </linearGradient>
      <linearGradient id="bannerRibbon" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#9a3412" />
        <stop offset="50%" stopColor="#dc2626" />
        <stop offset="100%" stopColor="#9a3412" />
      </linearGradient>
    </defs>

    {/* Decorative golden crunch burst behind wordmark */}
    <polygon
      points="320,8 345,38 395,18 408,52 465,42 456,80 518,90 485,126 530,158 468,162 452,196 392,175 320,198 248,175 188,196 172,162 110,158 155,126 122,90 184,80 175,42 232,52 245,18 295,38"
      fill="#7c2d12"
      opacity="0.38"
    />

    {/* Main Wordmark */}
    <text
      x="320"
      y="98"
      textAnchor="middle"
      fontFamily="Bricolage Grotesque, system-ui, sans-serif"
      fontWeight="800"
      fontSize="82"
      letterSpacing="-2"
      fill="url(#goldTitleFill)"
      stroke="#190e07"
      strokeWidth="13"
      paintOrder="stroke fill"
    >
      GORYL MINER
    </text>

    {/* Ribbon plaque */}
    <path
      d="M84 122 L556 122 L538 152 L556 182 L84 182 L102 152 Z"
      fill="url(#bannerRibbon)"
      stroke="#190e07"
      strokeWidth="6"
      strokeLinejoin="round"
    />
    <text
      x="320"
      y="163"
      textAnchor="middle"
      fontFamily="Bricolage Grotesque, system-ui, sans-serif"
      fontWeight="800"
      fontSize="31"
      letterSpacing="2.5"
      fill="#fef9c3"
      stroke="#190e07"
      strokeWidth="5"
      paintOrder="stroke fill"
    >
      CHIPSOWA EKSPANSJA
    </text>
  </svg>
);
