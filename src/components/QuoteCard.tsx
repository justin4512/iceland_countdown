import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState, type ReactNode } from 'react';
import { SPOTS } from '../data/spots';
import { CATEGORY_LABEL, quoteFor, unlockedQuotes } from '../lib/quotes';
import type { Quote } from '../types';
import s from '../styles/ui.module.css';
import { Card } from './Card';
import { Icon } from './Icon';

const asset = (p: string) => `${import.meta.env.BASE_URL}${p}`;

export function SpotPhoto({ spotId }: { spotId?: string }) {
  const spot = SPOTS.find((x) => x.id === spotId);
  if (!spot?.photo) return null;
  const p = spot.photo;
  return (
    <figure className={s.photo}>
      <img src={asset(p.file)} alt={`${spot.name}（${spot.nameEn}）`} loading="lazy" />
      <figcaption>
        <strong>{spot.name}</strong> · {spot.blurb}
        <span className={s.credit}>
          📷 {p.author} ·{' '}
          <a href={p.licenseUrl} target="_blank" rel="noreferrer">
            {p.license}
          </a>{' '}
          ·{' '}
          <a href={p.sourceUrl} target="_blank" rel="noreferrer">
            出處
          </a>
        </span>
      </figcaption>
    </figure>
  );
}

function shareText(q: Quote) {
  return `🧊 冰島倒數｜${q.date}\n${q.joke}\n💡 ${q.tip}\n${location.href.split('?')[0]}`;
}

export function QuoteCard({
  today,
  onOpenHistory,
  children,
}: {
  today: string;
  onOpenHistory: () => void;
  /** extra section pinned to the bottom of the card (the route chart) */
  children?: ReactNode;
}) {
  const unlocked = useMemo(() => unlockedQuotes(today), [today]);
  const [offset, setOffset] = useState(0);
  const [toast, setToast] = useState('');
  const q = offset === 0 ? quoteFor(today) : unlocked[offset];

  const share = async () => {
    const text = shareText(q);
    try {
      if (navigator.share) {
        await navigator.share({ title: '冰島每日幹話', text });
        return;
      }
      await navigator.clipboard.writeText(text);
      setToast('已複製，快去群組洗版');
    } catch {
      setToast('分享取消了，幹話留著自己笑');
    }
    setTimeout(() => setToast(''), 2200);
  };

  return (
    <Card
      kicker={`DAILY 幹話 · ${q.date}${offset ? '（舊的）' : '（今天）'}`}
      title="今日冰島幹話"
      className={s.quote}
      delay={0.1}
      action={
        <div className={s.btnRow}>
          <button
            className={s.iconBtn}
            onClick={() => setOffset((o) => Math.min(o + 1, Math.max(0, unlocked.length - 1)))}
            disabled={offset >= unlocked.length - 1}
            aria-label="前一天的幹話"
          >
            <Icon name="left" />
          </button>
          <button className={s.iconBtn} onClick={() => setOffset((o) => Math.max(0, o - 1))} disabled={offset === 0} aria-label="後一天的幹話">
            <Icon name="right" />
          </button>
          <button className={s.iconBtn} onClick={onOpenHistory} aria-label="幹話歷史">
            <Icon name="history" />
          </button>
          <button className={s.iconBtn} onClick={share} aria-label="分享這句幹話">
            <Icon name="share" />
          </button>
        </div>
      }
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={q.date + offset}
          initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -10, filter: 'blur(6px)' }}
          transition={{ duration: 0.4 }}
          className={s.quoteBody}
          // text and photo sit side by side on wide screens so the card stays as tall as the live panel
          data-photo={SPOTS.some((x) => x.id === q.spotId && x.photo) || undefined}
        >
          <div>
            <span className={`${s.chip} ${s[`cat_${q.category}`]}`}>#{CATEGORY_LABEL[q.category]}</span>
            <blockquote className={s.joke}>「{q.joke}」</blockquote>
            <p className={s.tip}>
              <span aria-hidden>💡</span> {q.tip}
            </p>
          </div>
          <SpotPhoto spotId={q.spotId} />
        </motion.div>
      </AnimatePresence>
      <p className={s.toast} role="status" aria-live="polite">
        {toast}
      </p>
      {children}
    </Card>
  );
}

export function HistoryDrawer({ today, open, onClose }: { today: string; open: boolean; onClose: () => void }) {
  const list = useMemo(() => unlockedQuotes(today), [today]);
  const [filter, setFilter] = useState<string>('all');
  const shown = filter === 'all' ? list : list.filter((q) => q.category === filter);
  return (
    <AnimatePresence>
      {open && (
        <motion.div className={s.drawerBackdrop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.aside
            className={s.drawer}
            role="dialog"
            aria-modal="true"
            aria-label="幹話歷史"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 220, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            <header className={s.cardHead}>
              <div>
                <p className={s.kicker}>ARCHIVE · 已解鎖 {list.length} 句</p>
                <h2 className={s.cardTitle}>幹話歷史</h2>
              </div>
              <button className={s.iconBtn} onClick={onClose} aria-label="關閉" autoFocus>
                <Icon name="close" />
              </button>
            </header>
            <div className={s.filterRow}>
              {['all', ...Object.keys(CATEGORY_LABEL)].map((k) => (
                <button key={k} className={`${s.pill} ${filter === k ? s.pillOn : ''}`} onClick={() => setFilter(k)}>
                  {k === 'all' ? '全部' : CATEGORY_LABEL[k as keyof typeof CATEGORY_LABEL]}
                </button>
              ))}
            </div>
            <ol className={s.historyList}>
              {shown.map((q) => (
                <li key={q.date}>
                  <time>{q.date.slice(5).replace('-', '/')}</time>
                  <div>
                    <p className={s.histJoke}>{q.joke}</p>
                    <p className={s.histTip}>💡 {q.tip}</p>
                  </div>
                </li>
              ))}
              {!shown.length && <li className={s.empty}>這個分類還沒解鎖，明天再來。</li>}
            </ol>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
