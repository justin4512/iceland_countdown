import { useEffect, useRef } from 'react';
import { ITINERARY } from '../data/itinerary';
import { click } from '../lib/sound';
import { DEPART, QUOTE_START, daysHome, phaseAt, remaining, tripDay } from '../lib/time';
import s from '../styles/ui.module.css';
import { Card, Ring } from './Card';

const pad = (n: number, w = 2) => String(n).padStart(w, '0');

function FlipUnit({ value, label }: { value: string; label: string }) {
  return (
    <div className={s.flipUnit}>
      <div className={s.flipTile}>
        {/* keyed remount replays the CSS flip-in; no exit element to leak */}
        <span key={value} className={s.flipValue}>
          {value}
        </span>
        <i className={s.flipHinge} aria-hidden />
      </div>
      <span className={s.flipLabel}>{label}</span>
    </div>
  );
}

export function Countdown({ now, sound }: { now: number; sound: boolean }) {
  const phase = phaseAt(now);
  const r = remaining(now);
  const lastSec = useRef(r.seconds);

  useEffect(() => {
    if (sound && r.seconds !== lastSec.current) click();
    lastSec.current = r.seconds;
  }, [r.seconds, sound]);

  if (phase === 'trip') {
    const day = tripDay(now);
    const today = ITINERARY[day - 1];
    return (
      <Card kicker="TRIP IN PROGRESS" title="旅程進行中" className={s.hero}>
        <div className={s.heroBody}>
          <Ring value={day / 15} size={168} stroke={14} label={day ? `Day ${day}` : '飛行中'} sub="/ 15" />
          <div className={s.heroText}>
            {today ? (
              <>
                <p className={s.heroBig}>{today.title}</p>
                <p className={s.heroSub}>
                  {today.stops.map((x) => x.name).join(' → ')} · {today.km} km · 今晚住 {today.stay}
                </p>
              </>
            ) : (
              <p className={s.heroBig}>正在飛往冰島，睡一下，極光在等你。</p>
            )}
          </div>
        </div>
      </Card>
    );
  }

  if (phase === 'after') {
    const n = daysHome(now);
    return (
      <Card kicker="MEMORY MODE" title="回憶模式" className={s.hero}>
        <div className={s.heroBody}>
          <Ring value={Math.min(1, n / 30)} size={168} stroke={14} label={n} sub="天" tone="gold" />
          <div className={s.heroText}>
            <p className={s.heroBig}>已回國 {n} 天</p>
            <p className={s.heroSub}>身體在台灣，靈魂還卡在冰島的某個加油站。</p>
          </div>
        </div>
      </Card>
    );
  }

  const start = Date.parse(`${QUOTE_START}T00:00:00+08:00`);
  const progress = (now - start) / (DEPART - start);
  return (
    <Card kicker="T-MINUS · 桃園起飛 2027/2/28 23:00" title="距離出發冰島還有" className={s.hero}>
      <div className={s.heroBody}>
        <div className={s.flipRow} role="timer" aria-label={`還有 ${r.days} 天 ${r.hours} 小時 ${r.minutes} 分`}>
          <FlipUnit value={pad(r.days, 3)} label="DAYS 天" />
          <FlipUnit value={pad(r.hours)} label="HRS 時" />
          <FlipUnit value={pad(r.minutes)} label="MIN 分" />
          <FlipUnit value={pad(r.seconds)} label="SEC 秒" />
        </div>
        <Ring value={progress} size={128} stroke={11} label={`${Math.round(progress * 100)}%`} sub="時間進度" />
      </div>
    </Card>
  );
}
