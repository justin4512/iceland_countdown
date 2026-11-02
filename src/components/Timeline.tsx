import { motion } from 'framer-motion';
import { useState } from 'react';
import { ITINERARY, MAP_SITE_URL, TOTAL_KM } from '../data/itinerary';
import s from '../styles/ui.module.css';
import { Icon } from './Icon';

const MAX_KM = Math.max(...ITINERARY.map((d) => d.km));

export function Timeline({ currentDay, onHover }: { currentDay: number; onHover: (day: number) => void }) {
  const [sel, setSel] = useState(currentDay || 1);
  const d = ITINERARY[sel - 1];
  // Rendered inside the quote card, below the daily quote
  return (
    <section className={s.timeline} aria-label="環島航線圖">
      <header className={s.cardHead}>
        <div>
          <p className={s.kicker}>ROUTE · 15 天 · 約 {TOTAL_KM.toLocaleString()} km</p>
          <h2 className={s.cardTitle}>環島航線圖</h2>
        </div>
        {MAP_SITE_URL && (
          <a className={s.linkBtn} href={MAP_SITE_URL} target="_blank" rel="noreferrer">
            <Icon name="map" size={16} /> 互動地圖
          </a>
        )}
      </header>
      <div className={s.bars} role="tablist" aria-label="選擇行程日">
        {ITINERARY.map((x) => (
          <button
            key={x.day}
            role="tab"
            aria-selected={sel === x.day}
            aria-label={`Day ${x.day} ${x.title}`}
            className={`${s.bar} ${sel === x.day ? s.barOn : ''} ${currentDay === x.day ? s.barNow : ''}`}
            onClick={() => setSel(x.day)}
            onPointerEnter={() => onHover(x.day)}
            onPointerLeave={() => onHover(0)}
            onFocus={() => onHover(x.day)}
            onBlur={() => onHover(0)}
          >
            <motion.i
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(8, (x.km / MAX_KM) * 100)}%` }}
              transition={{ delay: 0.3 + x.day * 0.04, type: 'spring', stiffness: 120, damping: 16 }}
              data-long={x.km > 340 || undefined}
            />
            <span>{x.day}</span>
          </button>
        ))}
      </div>
      <motion.div key={sel} className={s.dayDetail} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
        <p className={s.dayHead}>
          <b>
            Day {d.day} · {d.date.slice(5).replace('-', '/')}
          </b>{' '}
          {d.title}
        </p>
        <p className={s.dayStops}>{d.stops.map((x) => x.name).join(' → ')}</p>
        <p className={s.dayMeta}>
          {d.km} km · 住 {d.stay}
          {d.km > 340 && <span className={s.warnText}> · 長途日，早點出發</span>}
        </p>
      </motion.div>
    </section>
  );
}
