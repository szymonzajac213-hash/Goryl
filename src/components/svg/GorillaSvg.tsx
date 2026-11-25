import React from 'react';
import { ToolDef } from '../../game/types';
import { ToolGraphicSvg } from './ToolIconSvg';

interface GorillaSvgProps {
  equippedTool: ToolDef;
  isSwinging: boolean;
  isFever: boolean;
  isBoss: boolean;
  className?: string;
}

export const GorillaSvg: React.FC<GorillaSvgProps> = ({
  equippedTool,
  isSwinging,
  isFever,
  isBoss,
  className = 'w-44 h-44',
}) => {
  return (
    <div
      className={`relative select-none pointer-events-none ${className} ${
        isSwinging ? '' : 'animate-gorilla-idle'
      }`}
    >
      <svg viewBox="0 0 220 220" className="w-full h-full overflow-visible" aria-hidden="true">
        <defs>
          <radialGradient id="gorillaAura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={isFever ? '#fbbf24' : '#f59e0b'} stopOpacity="0.45" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ground shadow */}
        <ellipse cx="105" cy="202" rx="64" ry="12" fill="#000" opacity="0.38" />

        {/* Fever aura behind gorilla */}
        {isFever && <circle cx="105" cy="115" r="88" fill="url(#gorillaAura)" />}

        {/* Left leg */}
        <path
          d="M66 155 C58 175 56 192 66 196 C78 200 90 194 92 178 L94 155 Z"
          fill="#2d2320"
          stroke="#140c08"
          strokeWidth="5"
          strokeLinejoin="round"
        />
        {/* Right leg */}
        <path
          d="M118 155 L120 178 C122 194 134 200 146 196 C156 192 154 175 144 155 Z"
          fill="#2d2320"
          stroke="#140c08"
          strokeWidth="5"
          strokeLinejoin="round"
        />

        {/* Back left arm */}
        <path
          d="M64 106 C38 118 32 146 46 164 C54 174 68 170 72 154 L76 126 Z"
          fill="#3a2d28"
          stroke="#140c08"
          strokeWidth="5"
          strokeLinejoin="round"
        />

        {/* Muscular Torso */}
        <path
          d="M56 96 C54 68 78 58 106 58 C134 58 156 70 156 100 C156 138 148 164 106 166 C64 166 56 136 56 96 Z"
          fill="#3d302b"
          stroke="#140c08"
          strokeWidth="5.5"
        />
        {/* Chest plate (lighter fur) */}
        <path
          d="M74 102 C74 88 90 84 106 84 C122 84 138 88 138 102 C138 128 128 146 106 146 C84 146 74 128 74 102 Z"
          fill="#634f46"
          stroke="#140c08"
          strokeWidth="3.5"
        />
        {/* Chest pec line */}
        <path
          d="M84 112 Q95 119 106 112 Q117 119 128 112"
          fill="none"
          stroke="#140c08"
          strokeWidth="3.2"
          strokeLinecap="round"
        />

        {/* Head */}
        <g transform="translate(0, -6)">
          {/* Ears */}
          <circle cx="67" cy="64" r="10" fill="#59453c" stroke="#140c08" strokeWidth="4.5" />
          <circle cx="145" cy="64" r="10" fill="#59453c" stroke="#140c08" strokeWidth="4.5" />

          {/* Skull */}
          <path
            d="M72 68 C72 38 88 28 106 28 C124 28 140 38 140 68 C140 90 128 100 106 100 C84 100 72 90 72 68 Z"
            fill="#3d302b"
            stroke="#140c08"
            strokeWidth="5"
          />

          {/* Face muzzle */}
          <ellipse
            cx="106"
            cy="77"
            rx="27"
            ry="20"
            fill="#8c6d5c"
            stroke="#140c08"
            strokeWidth="4"
          />

          {/* Brow & Eyes */}
          <path
            d="M81 55 Q106 47 131 55"
            fill="none"
            stroke="#140c08"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {isFever ? (
            /* Cool fiery sunglasses during Fever Mode */
            <g>
              <polygon
                points="80,56 103,58 100,70 83,68"
                fill="#facc15"
                stroke="#140c08"
                strokeWidth="3.2"
              />
              <polygon
                points="109,58 132,56 129,68 112,70"
                fill="#f97316"
                stroke="#140c08"
                strokeWidth="3.2"
              />
              <line x1="103" y1="60" x2="109" y2="60" stroke="#140c08" strokeWidth="3.5" />
            </g>
          ) : (
            <g>
              <circle cx="94" cy="63" r="6" fill="#fff8ed" stroke="#140c08" strokeWidth="2.8" />
              <circle cx="118" cy="63" r="6" fill="#fff8ed" stroke="#140c08" strokeWidth="2.8" />
              <circle cx={isSwinging ? 96 : 95} cy="63" r="3" fill="#140c08" />
              <circle cx={isSwinging ? 120 : 119} cy="63" r="3" fill="#140c08" />
              {isBoss && (
                <>
                  <line x1="86" y1="53" x2="102" y2="59" stroke="#140c08" strokeWidth="4" strokeLinecap="round" />
                  <line x1="126" y1="53" x2="110" y2="59" stroke="#140c08" strokeWidth="4" strokeLinecap="round" />
                </>
              )}
            </g>
          )}

          {/* Nostrils */}
          <ellipse cx="100" cy="74" rx="3" ry="2" fill="#291c16" />
          <ellipse cx="112" cy="74" rx="3" ry="2" fill="#291c16" />

          {/* Expressive Mouth */}
          {isSwinging || isFever ? (
            <path
              d="M92 84 Q106 96 120 84 Z"
              fill="#991b1b"
              stroke="#140c08"
              strokeWidth="3"
              strokeLinejoin="round"
            />
          ) : (
            <path
              d="M93 85 Q106 93 119 85"
              fill="none"
              stroke="#140c08"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          )}

          {/* Golden Miner Helmet */}
          <path
            d="M72 47 C74 22 90 14 106 14 C122 14 138 22 140 47 Z"
            fill={isFever ? '#ef4444' : '#f59e0b'}
            stroke="#140c08"
            strokeWidth="4.5"
            strokeLinejoin="round"
          />
          <rect
            x="66"
            y="43"
            width="80"
            height="9"
            rx="4.5"
            fill={isFever ? '#fde047' : '#fbbf24'}
            stroke="#140c08"
            strokeWidth="4"
          />
          {/* Headlamp */}
          <circle
            cx="106"
            cy="31"
            r="8.5"
            fill="#fef08a"
            stroke="#140c08"
            strokeWidth="3.8"
          />
          <circle cx="106" cy="31" r="4" fill="#ffffff" />
        </g>

        {/* Swinging Right Arm + Equipped Tool */}
        <g
          style={{ transformOrigin: '142px 104px' }}
          className={isSwinging ? 'animate-gorilla-swing' : ''}
        >
          <path
            d="M140 94 C166 96 184 114 176 138 C170 154 152 156 144 142 L134 118 Z"
            fill="#473832"
            stroke="#140c08"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          {/* Equipped Tool projecting upward-right out of Gorilla's fist */}
          <g transform="translate(154, 48) rotate(10)">
            <foreignObject x="0" y="0" width="84" height="84">
              <ToolGraphicSvg tool={equippedTool} className="w-[84px] h-[84px]" />
            </foreignObject>
          </g>
          {/* Fist gripping the tool handle */}
          <circle cx="164" cy="130" r="14" fill="#634f46" stroke="#140c08" strokeWidth="4.5" />
          <path
            d="M156 125 Q164 120 172 126"
            fill="none"
            stroke="#140c08"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
};
