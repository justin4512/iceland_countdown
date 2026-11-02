import { useCachedJson } from '../lib/hooks';
import s from '../styles/ui.module.css';
import { Card } from './Card';

const WEATHER_URL =
  'https://api.open-meteo.com/v1/forecast?latitude=64.1466&longitude=-21.9426' +
  '&current=temperature_2m,apparent_temperature,wind_speed_10m,wind_gusts_10m,weather_code' +
  '&daily=sunrise,sunset,daylight_duration&timezone=Atlantic%2FReykjavik&wind_speed_unit=ms&forecast_days=1';
const RATE_URL = 'https://open.er-api.com/v6/latest/ISK';
const KP_URL = 'https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json';

interface Weather {
  current: {
    temperature_2m: number;
    apparent_temperature: number;
    wind_speed_10m: number;
    wind_gusts_10m: number;
    weather_code: number;
  };
  daily: { sunrise: string[]; sunset: string[]; daylight_duration: number[] };
}
interface Rate {
  rates: Record<string, number>;
  time_last_update_utc?: string;
}
type KpRow = { time_tag: string; Kp: number } | string[];

// Offline fallbacks — rough March averages, shown only when every fetch failed and nothing is cached.
const FALLBACK = { temp: 0, feels: -6, wind: 8, daylight: 10.8 * 3600, sunrise: '08:00', sunset: '19:00', rate: 0.25, kp: 2 };

const WMO: Record<number, [string, string]> = {
  0: ['☀️', '晴'], 1: ['🌤', '大致晴'], 2: ['⛅', '多雲'], 3: ['☁️', '陰'], 45: ['🌫', '霧'], 48: ['🌫', '霧凇'],
  51: ['🌦', '毛毛雨'], 53: ['🌦', '毛毛雨'], 55: ['🌧', '毛毛雨'], 56: ['🧊', '凍雨'], 57: ['🧊', '凍雨'],
  61: ['🌧', '小雨'], 63: ['🌧', '雨'], 65: ['🌧', '大雨'], 66: ['🧊', '凍雨'], 67: ['🧊', '凍雨'],
  71: ['🌨', '小雪'], 73: ['🌨', '雪'], 75: ['❄️', '大雪'], 77: ['🌨', '霰'], 80: ['🌦', '陣雨'],
  81: ['🌧', '陣雨'], 82: ['⛈', '強陣雨'], 85: ['🌨', '陣雪'], 86: ['❄️', '強陣雪'], 95: ['⛈', '雷雨'],
  96: ['⛈', '雷雨冰雹'], 99: ['⛈', '雷雨冰雹'],
};

function windLabel(ms: number) {
  if (ms >= 20) return { text: '車門會被吹飛', tone: s.bad };
  if (ms >= 15) return { text: '開門要兩手', tone: s.bad };
  if (ms >= 10) return { text: '風很有個性', tone: s.meh };
  return { text: '溫柔的冰島風', tone: s.good };
}

function kpLabel(kp: number) {
  if (kp >= 5) return { text: '磁暴！衝了', tone: s.good };
  if (kp >= 3) return { text: '晴天有機會', tone: s.good };
  if (kp >= 2) return { text: '北部可以等等看', tone: s.meh };
  return { text: '極光在休假', tone: s.bad };
}

const hhmm = (iso?: string) => (iso ? iso.slice(11, 16) : '--:--');

export function LivePanel({ now }: { now: number }) {
  const w = useCachedJson<Weather>('weather', WEATHER_URL, 15 * 60_000);
  const rate = useCachedJson<Rate>('rate', RATE_URL, 6 * 3600_000);
  const kp = useCachedJson<KpRow[]>('kp', KP_URL, 30 * 60_000);

  const rvk = new Intl.DateTimeFormat('zh-TW', {
    timeZone: 'Atlantic/Reykjavik',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(now);
  const rvkDate = new Intl.DateTimeFormat('zh-TW', { timeZone: 'Atlantic/Reykjavik', month: 'numeric', day: 'numeric', weekday: 'short' }).format(now);

  const cur = w.data?.current;
  const temp = cur?.temperature_2m ?? FALLBACK.temp;
  const feels = cur?.apparent_temperature ?? FALLBACK.feels;
  const wind = cur?.wind_speed_10m ?? FALLBACK.wind;
  const gust = cur?.wind_gusts_10m;
  const [icon, desc] = WMO[cur?.weather_code ?? 3] ?? ['🌡', '—'];
  const daylight = w.data?.daily.daylight_duration[0] ?? FALLBACK.daylight;
  const sunrise = w.data ? hhmm(w.data.daily.sunrise[0]) : FALLBACK.sunrise;
  const sunset = w.data ? hhmm(w.data.daily.sunset[0]) : FALLBACK.sunset;

  const twd = rate.data?.rates.TWD ?? FALLBACK.rate;

  const rows = (kp.data ?? []).filter((r) => !Array.isArray(r) || r[0] !== 'time_tag');
  const kpVals = rows.map((r) => (Array.isArray(r) ? Number(r[1]) : r.Kp)).filter((v) => !Number.isNaN(v));
  const kpNow = kpVals.length ? kpVals[kpVals.length - 1] : FALLBACK.kp;
  const kpRecent = kpVals.slice(-16);

  const wl = windLabel(wind);
  const kl = kpLabel(kpNow);
  const offline = (!w.data && w.offline) || (!rate.data && rate.offline) || (!kp.data && kp.offline);

  return (
    <Card kicker="LIVE · REYKJAVÍK" title="冰島即時面板" className={s.live} delay={0.15}>
      <div className={s.liveGrid}>
        <div className={`${s.tile} ${s.tileClock}`}>
          <span className={s.tileLabel}>雷克雅維克時間（UTC+0）</span>
          <strong className={s.mono}>{rvk}</strong>
          <small>{rvkDate} · 比台灣慢 8 小時</small>
        </div>
        <div className={s.tile}>
          <span className={s.tileLabel}>天氣</span>
          <strong>
            {icon} {temp.toFixed(1)}°C
          </strong>
          <small>
            {desc} · 體感 {feels.toFixed(0)}°C
          </small>
        </div>
        <div className={s.tile}>
          <span className={s.tileLabel}>風速</span>
          <strong>
            {wind.toFixed(1)} <em>m/s</em>
          </strong>
          <small className={wl.tone}>
            {wl.text}
            {gust != null && ` · 陣風 ${gust.toFixed(0)}`}
          </small>
        </div>
        <div className={s.tile}>
          <span className={s.tileLabel}>日照</span>
          <strong>
            {(daylight / 3600).toFixed(1)} <em>小時</em>
          </strong>
          <small>
            ☀ {sunrise} → {sunset}
          </small>
          <div className={s.daybar} aria-hidden>
            <i style={{ width: `${(daylight / 86400) * 100}%` }} />
          </div>
        </div>
        <div className={s.tile}>
          <span className={s.tileLabel}>匯率</span>
          <strong>
            1000 ISK ≈ {(twd * 1000).toFixed(0)} <em>TWD</em>
          </strong>
          <small>一份熱狗大概要你一個便當錢</small>
        </div>
        <div className={s.tile}>
          <span className={s.tileLabel}>Kp 極光指數（NOAA）</span>
          <strong>{kpNow.toFixed(1)}</strong>
          <small className={kl.tone}>{kl.text}</small>
          <div className={s.kpBars} aria-label="近 48 小時 Kp">
            {kpRecent.map((v, i) => (
              <i key={i} style={{ height: `${Math.max(6, (v / 9) * 100)}%` }} data-hot={v >= 4 || undefined} />
            ))}
          </div>
        </div>
      </div>
      <p className={s.liveFoot}>
        {offline ? '⚠ 部分資料離線中，顯示的是快取或三月平均值。' : '資料：Open-Meteo · ExchangeRate-API · NOAA SWPC'}
      </p>
    </Card>
  );
}
