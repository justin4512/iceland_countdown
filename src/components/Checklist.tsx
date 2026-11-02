import { motion } from 'framer-motion';
import { useState } from 'react';
import { CHECKLIST } from '../data/checklist';
import { useLocalState } from '../lib/hooks';
import type { ChecklistGroup } from '../types';
import s from '../styles/ui.module.css';
import { Card, Ring } from './Card';
import { Icon } from './Icon';

const GROUP_LABEL: Record<ChecklistGroup, string> = {
  docs: '證件與預約',
  money: '金錢與保險',
  car: '租車與行車',
  wear: '穿著',
  warm: '避寒裝備',
  tech: '電子產品',
  health: '藥品保養',
  misc: '其他',
};

type View = 'todo' | 'buy' | 'all';

export function Checklist({ daysLeft, tripStarted }: { daysLeft: number; tripStarted: boolean }) {
  const [done, setDone] = useLocalState<Record<string, boolean>>('checklist:v1', {});
  const [view, setView] = useState<View>('todo');
  const total = CHECKLIST.length;
  const count = CHECKLIST.filter((i) => done[i.id]).length;
  const overdue = CHECKLIST.filter((i) => !done[i.id] && !tripStarted && daysLeft <= i.dueDaysBefore);

  const items = CHECKLIST.filter((i) =>
    view === 'all' ? true : view === 'buy' ? i.buy : !done[i.id],
  ).sort((a, b) => Number(!!done[a.id]) - Number(!!done[b.id]) || b.dueDaysBefore - a.dueDaysBefore);

  const groups = (Object.keys(GROUP_LABEL) as ChecklistGroup[])
    .map((g) => ({ g, list: items.filter((i) => i.group === g) }))
    .filter((x) => x.list.length);

  return (
    <Card kicker="PREFLIGHT CHECK" title="行前準備清單" className={s.checklist} delay={0.2}>
      <div className={s.checkTop}>
        <Ring value={count / total} size={112} stroke={10} label={`${count}/${total}`} sub="已完成" />
        <div className={s.checkStats}>
          <p>
            <b className={overdue.length ? s.warnText : ''}>{overdue.length}</b> 項已到建議期限
          </p>
          <p>
            <b>{CHECKLIST.filter((i) => i.buy && !done[i.id]).length}</b> 樣東西還沒買
          </p>
          <div className={s.seg} role="tablist" aria-label="清單篩選">
            {(
              [
                ['todo', '待辦'],
                ['buy', '採購'],
                ['all', '全部'],
              ] as const
            ).map(([k, label]) => (
              <button key={k} role="tab" aria-selected={view === k} className={view === k ? s.segOn : ''} onClick={() => setView(k)}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className={s.checkScroll}>
        {groups.map(({ g, list }) => (
          <div key={g} className={s.checkGroup}>
            <h3>{GROUP_LABEL[g]}</h3>
            <ul>
              {list.map((i) => {
                const isDone = !!done[i.id];
                const late = !isDone && !tripStarted && daysLeft <= i.dueDaysBefore;
                return (
                  <motion.li key={i.id} layout className={`${s.checkItem} ${isDone ? s.isDone : ''} ${late ? s.isLate : ''}`}>
                    <button
                      className={s.checkBox}
                      role="checkbox"
                      aria-checked={isDone}
                      aria-label={i.title}
                      onClick={() => setDone((d) => ({ ...d, [i.id]: !d[i.id] }))}
                    >
                      {isDone && <Icon name="check" size={14} />}
                    </button>
                    <div className={s.checkText}>
                      <span>
                        {i.title}
                        {i.buy && <em className={s.buyTag}>要買</em>}
                      </span>
                      {i.note && <small>{i.note}</small>}
                    </div>
                    <span className={s.due} title="建議完成時間">
                      {late ? '⚠ ' : ''}T-{i.dueDaysBefore}
                    </span>
                  </motion.li>
                );
              })}
            </ul>
          </div>
        ))}
        {!groups.length && <p className={s.empty}>全部完成！你現在唯一要準備的是行李箱的空間。</p>}
      </div>
    </Card>
  );
}
