// Synthesised audio (no files): wind ambience + a soft flip click.
let ctx: AudioContext | null = null;
let wind: { src: AudioBufferSourceNode; gain: GainNode; lfo: OscillatorNode } | null = null;

function audio(): AudioContext {
  ctx ??= new AudioContext();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

export function startWind() {
  if (wind) return;
  const a = audio();
  const len = a.sampleRate * 4;
  const buf = a.createBuffer(1, len, a.sampleRate);
  const data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    // brown-ish noise
    last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
    data[i] = last * 3.5;
  }
  const src = a.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  const filter = a.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 500;
  const lfo = a.createOscillator();
  lfo.frequency.value = 0.08;
  const lfoGain = a.createGain();
  lfoGain.gain.value = 300;
  lfo.connect(lfoGain).connect(filter.frequency);
  const gain = a.createGain();
  gain.gain.value = 0;
  gain.gain.linearRampToValueAtTime(0.35, a.currentTime + 2);
  src.connect(filter).connect(gain).connect(a.destination);
  src.start();
  lfo.start();
  wind = { src, gain, lfo };
}

export function stopWind() {
  if (!wind || !ctx) return;
  const w = wind;
  wind = null;
  w.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
  setTimeout(() => {
    w.src.stop();
    w.lfo.stop();
  }, 700);
}

export function click() {
  if (!ctx) return;
  const a = ctx;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = 'square';
  osc.frequency.value = 1800;
  g.gain.setValueAtTime(0.04, a.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + 0.04);
  osc.connect(g).connect(a.destination);
  osc.start();
  osc.stop(a.currentTime + 0.05);
}
