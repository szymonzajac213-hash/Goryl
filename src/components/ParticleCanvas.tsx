import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export interface ParticleCanvasHandle {
  spawnHit: (
    normX: number,
    normY: number,
    label: string,
    isCrit: boolean,
    colorA: string,
    colorB: string
  ) => void;
  spawnBurst: (normX: number, normY: number, colorA: string, colorB: string, count?: number) => void;
}

interface CrumbParticle {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rot: number;
  vRot: number;
  life: number;
  maxLife: number;
  color: string;
  shape: 0 | 1 | 2; // 0 = irregular chip, 1 = spark, 2 = crumb square
}

interface FloatingLabel {
  active: boolean;
  x: number;
  y: number;
  vy: number;
  life: number;
  maxLife: number;
  text: string;
  isCrit: boolean;
}

interface ShockRing {
  active: boolean;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  life: number;
  maxLife: number;
  color: string;
}

const MAX_PARTICLES = 220;
const MAX_LABELS = 48;
const MAX_RINGS = 20;

interface ParticleCanvasProps {
  ambientColor?: string;
  isFever?: boolean;
  className?: string;
}

export const ParticleCanvas = forwardRef<ParticleCanvasHandle, ParticleCanvasProps>(
  ({ ambientColor = '#fde047', isFever = false, className = '' }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const ambientColorRef = useRef(ambientColor);
    const isFeverRef = useRef(isFever);
    ambientColorRef.current = ambientColor;
    isFeverRef.current = isFever;

    // Pre-allocated zero-GC ring buffers
    const particlesRef = useRef<CrumbParticle[]>(
      Array.from({ length: MAX_PARTICLES }, () => ({
        active: false,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        size: 5,
        rot: 0,
        vRot: 0,
        life: 0,
        maxLife: 1,
        color: '#fde047',
        shape: 0,
      }))
    );
    const pCursorRef = useRef(0);

    const labelsRef = useRef<FloatingLabel[]>(
      Array.from({ length: MAX_LABELS }, () => ({
        active: false,
        x: 0,
        y: 0,
        vy: -70,
        life: 0,
        maxLife: 0.9,
        text: '',
        isCrit: false,
      }))
    );
    const lCursorRef = useRef(0);

    const ringsRef = useRef<ShockRing[]>(
      Array.from({ length: MAX_RINGS }, () => ({
        active: false,
        x: 0,
        y: 0,
        radius: 10,
        maxRadius: 90,
        life: 0,
        maxLife: 0.35,
        color: '#fde047',
      }))
    );
    const rCursorRef = useRef(0);

    const sizeRef = useRef({ width: 400, height: 400 });

    const spawnParticlesInternal = (
      x: number,
      y: number,
      count: number,
      colorA: string,
      colorB: string,
      speedScale: number
    ) => {
      const pool = particlesRef.current;
      for (let i = 0; i < count; i++) {
        const idx = pCursorRef.current;
        pCursorRef.current = (idx + 1) % MAX_PARTICLES;
        const p = pool[idx];
        const angle = Math.random() * Math.PI * 2;
        const speed = (75 + Math.random() * 190) * speedScale;
        p.active = true;
        p.x = x + (Math.random() - 0.5) * 18;
        p.y = y + (Math.random() - 0.5) * 18;
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed - 90 * speedScale;
        p.size = 4 + Math.random() * (speedScale > 1.1 ? 8 : 6);
        p.rot = Math.random() * Math.PI * 2;
        p.vRot = (Math.random() - 0.5) * 11;
        p.maxLife = 0.45 + Math.random() * 0.45;
        p.life = p.maxLife;
        p.color = Math.random() > 0.4 ? colorA : colorB;
        p.shape = (i % 3) as 0 | 1 | 2;
      }
    };

    useImperativeHandle(ref, () => ({
      spawnHit(normX, normY, label, isCrit, colorA, colorB) {
        const { width, height } = sizeRef.current;
        const x = normX * width;
        const y = normY * height;

        spawnParticlesInternal(
          x,
          y,
          isCrit ? 22 : 9,
          isCrit ? '#fef08a' : colorA,
          isCrit ? '#f97316' : colorB,
          isCrit ? 1.4 : 1.0
        );

        // Ring pulse
        const rIdx = rCursorRef.current;
        rCursorRef.current = (rIdx + 1) % MAX_RINGS;
        const ring = ringsRef.current[rIdx];
        ring.active = true;
        ring.x = x;
        ring.y = y;
        ring.radius = 12;
        ring.maxRadius = isCrit ? 115 : 64;
        ring.maxLife = isCrit ? 0.42 : 0.26;
        ring.life = ring.maxLife;
        ring.color = isCrit ? '#fde047' : colorA;

        // Floating damage/chip text
        const lIdx = lCursorRef.current;
        lCursorRef.current = (lIdx + 1) % MAX_LABELS;
        const lbl = labelsRef.current[lIdx];
        lbl.active = true;
        lbl.x = x + (Math.random() - 0.5) * 34;
        lbl.y = y - 10;
        lbl.vy = isCrit ? -115 : -82;
        lbl.maxLife = isCrit ? 1.1 : 0.85;
        lbl.life = lbl.maxLife;
        lbl.text = label;
        lbl.isCrit = isCrit;
      },
      spawnBurst(normX, normY, colorA, colorB, count = 28) {
        const { width, height } = sizeRef.current;
        spawnParticlesInternal(normX * width, normY * height, count, colorA, colorB, 1.5);
      },
    }));

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const updateSize = () => {
        const rect = canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = Math.max(10, Math.floor(rect.width));
        const h = Math.max(10, Math.floor(rect.height));
        sizeRef.current = { width: w, height: h };
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };

      updateSize();
      const ro = new ResizeObserver(updateSize);
      ro.observe(canvas);

      let rafId = 0;
      let lastTime = performance.now();
      let ambientTimer = 0;

      const render = (now: number) => {
        const rawDt = (now - lastTime) / 1000;
        lastTime = now;
        const dt = Math.min(Math.max(rawDt, 0), 0.05);

        const { width, height } = sizeRef.current;
        ctx.clearRect(0, 0, width, height);

        // Gentle ambient crumbs during Fever Mode
        if (isFeverRef.current) {
          ambientTimer += dt;
          if (ambientTimer > 0.09) {
            ambientTimer = 0;
            spawnParticlesInternal(
              Math.random() * width,
              height * 0.25 + Math.random() * height * 0.5,
              2,
              '#fde047',
              ambientColorRef.current,
              0.55
            );
          }
        }

        // 1. Shockwave rings
        const rings = ringsRef.current;
        for (let i = 0; i < MAX_RINGS; i++) {
          const r = rings[i];
          if (!r.active) continue;
          r.life -= dt;
          if (r.life <= 0) {
            r.active = false;
            continue;
          }
          const t = 1 - r.life / r.maxLife;
          const radius = r.radius + (r.maxRadius - r.radius) * (1 - Math.pow(1 - t, 3));
          ctx.save();
          ctx.globalAlpha = (1 - t) * 0.72;
          ctx.strokeStyle = r.color;
          ctx.lineWidth = 4 * (1 - t) + 1;
          ctx.beginPath();
          ctx.arc(r.x, r.y, radius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // 2. Pooled particles
        const particles = particlesRef.current;
        for (let i = 0; i < MAX_PARTICLES; i++) {
          const p = particles[i];
          if (!p.active) continue;
          p.life -= dt;
          if (p.life <= 0) {
            p.active = false;
            continue;
          }
          p.vy += 460 * dt; // gravity
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.rot += p.vRot * dt;

          const alpha = Math.min(1, (p.life / p.maxLife) * 1.4);
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = p.color;
          ctx.strokeStyle = '#1a1008';
          ctx.lineWidth = 1.6;

          if (p.shape === 0) {
            ctx.beginPath();
            ctx.ellipse(0, 0, p.size, p.size * 0.65, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          } else if (p.shape === 1) {
            ctx.beginPath();
            ctx.moveTo(0, -p.size);
            ctx.lineTo(p.size * 0.7, 0);
            ctx.lineTo(0, p.size);
            ctx.lineTo(-p.size * 0.7, 0);
            ctx.closePath();
            ctx.fill();
          } else {
            ctx.fillRect(-p.size * 0.5, -p.size * 0.5, p.size, p.size);
            ctx.strokeRect(-p.size * 0.5, -p.size * 0.5, p.size, p.size);
          }
          ctx.restore();
        }

        // 3. Floating numbers
        const labels = labelsRef.current;
        for (let i = 0; i < MAX_LABELS; i++) {
          const l = labels[i];
          if (!l.active) continue;
          l.life -= dt;
          if (l.life <= 0) {
            l.active = false;
            continue;
          }
          l.y += l.vy * dt;
          l.vy *= 0.96;
          const alpha = Math.min(1, (l.life / l.maxLife) * 1.6);

          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.font = l.isCrit
            ? '800 24px "Bricolage Grotesque", sans-serif'
            : '800 17px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.lineWidth = l.isCrit ? 5 : 4;
          ctx.strokeStyle = '#180f08';
          ctx.fillStyle = l.isCrit ? '#fde047' : '#fff8ed';
          ctx.strokeText(l.text, l.x, l.y);
          ctx.fillText(l.text, l.x, l.y);
          ctx.restore();
        }

        rafId = requestAnimationFrame(render);
      };

      rafId = requestAnimationFrame(render);
      return () => {
        cancelAnimationFrame(rafId);
        ro.disconnect();
      };
    }, []);

    return (
      <canvas
        ref={canvasRef}
        data-testid="particle-canvas"
        className={`pointer-events-none absolute inset-0 w-full h-full ${className}`}
      />
    );
  }
);

ParticleCanvas.displayName = 'ParticleCanvas';
