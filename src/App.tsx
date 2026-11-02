import { Suspense, lazy, useEffect, useState } from 'react';
import { Checklist } from './components/Checklist';
import { Countdown } from './components/Countdown';
import { Icon } from './components/Icon';
import { LivePanel } from './components/LivePanel';
import { HistoryDrawer, QuoteCard } from './components/QuoteCard';
import { Timeline } from './components/Timeline';
import { canRun3D, useLocalState, useMediaQuery, useNow } from './lib/hooks';
import { startWind, stopWind } from './lib/sound';
import { daysLeft, phaseAt, taipeiDate, tripDay } from './lib/time';
import s from './styles/ui.module.css';

const Scene3D = lazy(() => import('./scene/Scene3D'));

export default function App() {
  const now = useNow(1000);
  const dark = useMediaQuery('(prefers-color-scheme: dark)');
  const [use3D, setUse3D] = useLocalState('pref:3d', canRun3D());
  const [sound, setSound] = useLocalState('pref:sound', false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [hoverDay, setHoverDay] = useState(0);

  const phase = phaseAt(now);
  const left = daysLeft(now);
  const today = taipeiDate(now);
  const currentDay = phase === 'trip' ? tripDay(now) : 0;
  const mode = phase === 'countdown' && left <= 7 ? 'globe' : 'island';

  // Browsers only allow audio after a user gesture; the toggle click is that gesture.
  useEffect(() => {
    if (sound) startWind();
    else stopWind();
  }, [sound]);

  return (
    <>
      {use3D ? (
        <div className={s.stage} aria-hidden>
          <Suspense fallback={<div className={s.stageFallback} />}>
            <Scene3D dark={dark} mode={mode} focusDay={hoverDay || currentDay} />
          </Suspense>
        </div>
      ) : (
        <div className={s.stageFallback} aria-hidden />
      )}

      <div className={s.shell}>
        <header className={s.topbar}>
          <div className={s.brand}>
            <span className={s.dot} aria-hidden />
            冰島倒數儀表板
            <small>ICELAND · WINTER RING ROAD · 2027</small>
          </div>
          <div className={s.btnRow}>
            <button
              className={s.iconBtn}
              aria-pressed={use3D}
              aria-label={use3D ? '關閉 3D 場景' : '開啟 3D 場景'}
              title={use3D ? '關閉 3D' : '開啟 3D'}
              onClick={() => setUse3D((v) => !v)}
            >
              <Icon name="cube" />
            </button>
            <button
              className={s.iconBtn}
              aria-pressed={sound}
              aria-label={sound ? '關閉音效' : '開啟音效（風聲與翻牌聲）'}
              title={sound ? '關閉音效' : '開啟音效'}
              onClick={() => setSound((v) => !v)}
            >
              <Icon name={sound ? 'sound' : 'mute'} />
            </button>
          </div>
        </header>

        <div className={s.spacer3d} />
        {use3D && <p className={s.mode3d}>{mode === 'globe' ? '— 起飛模式 · TPE ✈ KEF —' : '— 拖曳旋轉 · 發光線是 15 天環島路線 —'}</p>}

        <main className={s.grid}>
          <Countdown now={now} sound={sound} />
          <QuoteCard today={today} onOpenHistory={() => setHistoryOpen(true)} />
          <LivePanel now={now} />
          <Checklist daysLeft={left} tripStarted={phase !== 'countdown'} />
          <Timeline currentDay={currentDay} onHover={setHoverDay} />
        </main>

        <footer className={s.footer}>
          每天台北時間 00:00 解鎖一句新幹話 · 清單只存在你這台裝置
          <br />
          景點照片來自 Wikimedia Commons，作者與授權見各照片說明及{' '}
          <a href="https://github.com/justin4512/iceland-countdown/blob/main/CREDITS.md" target="_blank" rel="noreferrer">
            CREDITS
          </a>
        </footer>
      </div>

      <HistoryDrawer today={today} open={historyOpen} onClose={() => setHistoryOpen(false)} />
    </>
  );
}
