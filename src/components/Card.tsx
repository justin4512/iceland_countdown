import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import type { PointerEvent, ReactNode } from 'react';
import s from '../styles/ui.module.css';

interface Props {
  title?: string;
  kicker?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
  delay?: number;
}

const canTilt = () =>
  matchMedia('(pointer: fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Soft-3D card: raised surface, follows the pointer with a gentle tilt and a moving sheen. */
export function Card({ title, kicker, action, className = '', children, delay = 0 }: Props) {
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [5, -5]), { stiffness: 160, damping: 18 });
  const ry = useSpring(useTransform(mx, [0, 1], [-6, 6]), { stiffness: 160, damping: 18 });
  const sheenX = useTransform(mx, (v) => `${v * 100}%`);
  const sheenY = useTransform(my, (v) => `${v * 100}%`);

  const onMove = (e: PointerEvent<HTMLElement>) => {
    if (!canTilt()) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };
  const onLeave = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  return (
    <motion.section
      className={`${s.card} ${className}`}
      style={{ rotateX: rx, rotateY: ry, ['--sx' as string]: sheenX, ['--sy' as string]: sheenY }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      initial={{ opacity: 0, y: 28, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 120, damping: 18, delay }}
    >
      <div className={s.sheen} aria-hidden />
      {(title || action) && (
        <header className={s.cardHead}>
          <div>
            {kicker && <p className={s.kicker}>{kicker}</p>}
            {title && <h2 className={s.cardTitle}>{title}</h2>}
          </div>
          {action}
        </header>
      )}
      {children}
    </motion.section>
  );
}

/** SVG ring gauge */
export function Ring({
  value,
  size = 120,
  stroke = 10,
  label,
  sub,
  tone = 'accent',
}: {
  value: number;
  size?: number;
  stroke?: number;
  label: ReactNode;
  sub?: ReactNode;
  tone?: 'accent' | 'warn' | 'gold';
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  const id = `g-${tone}`;
  return (
    <div className={s.ring} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={tone === 'warn' ? 'var(--warn)' : tone === 'gold' ? 'var(--gold)' : 'var(--accent)'} />
            <stop offset="100%" stopColor="var(--accent-2)" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} className={s.ringTrack} strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - v) }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className={s.ringArc}
        />
      </svg>
      <div className={s.ringLabel}>
        <strong>{label}</strong>
        {sub && <span>{sub}</span>}
      </div>
    </div>
  );
}
