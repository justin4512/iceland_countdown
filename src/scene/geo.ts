// Rough Iceland coastline (lon, lat), clockwise from Reykjanes. Low-poly on purpose.
export const COAST: [number, number][] = [
  [-22.7, 63.82], [-22.0, 63.84], [-21.2, 63.86], [-20.6, 63.75], [-19.9, 63.55], [-19.0, 63.4],
  [-18.2, 63.48], [-17.5, 63.7], [-16.6, 63.8], [-16.0, 64.0], [-15.3, 64.25], [-14.6, 64.4],
  [-14.2, 64.7], [-13.6, 65.05], [-13.6, 65.4], [-14.4, 65.75], [-14.8, 66.0], [-15.5, 66.15],
  [-16.0, 66.5], [-16.6, 66.2], [-17.4, 66.05], [-18.0, 66.12], [-18.5, 66.18], [-19.0, 66.1],
  [-19.6, 65.75], [-20.3, 66.1], [-21.0, 65.95], [-21.5, 66.2], [-22.0, 66.45], [-22.8, 66.42],
  [-23.6, 66.2], [-24.4, 65.6], [-23.6, 65.45], [-22.4, 65.35], [-22.0, 65.12], [-22.6, 65.05],
  [-23.1, 64.95], [-23.95, 64.85], [-23.4, 64.74], [-22.4, 64.76], [-22.0, 64.5], [-22.4, 64.22],
  [-21.9, 64.15], [-22.05, 64.03], [-22.7, 63.95],
];

const S = 1.6;
const COS = Math.cos((65 * Math.PI) / 180);

/** lon/lat → scene x/z (y is up) */
export function project(lon: number, lat: number): [number, number] {
  return [(lon + 18.7) * COS * S, -(lat - 65) * S];
}

const POLY = COAST.map(([lon, lat]) => project(lon, lat));

function inside(x: number, z: number): boolean {
  let hit = false;
  for (let i = 0, j = POLY.length - 1; i < POLY.length; j = i++) {
    const [xi, zi] = POLY[i];
    const [xj, zj] = POLY[j];
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) hit = !hit;
  }
  return hit;
}

function edgeDist(x: number, z: number): number {
  let best = Infinity;
  for (let i = 0, j = POLY.length - 1; i < POLY.length; j = i++) {
    const [ax, az] = POLY[j];
    const [bx, bz] = POLY[i];
    const dx = bx - ax;
    const dz = bz - az;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz)));
    best = Math.min(best, Math.hypot(x - (ax + t * dx), z - (az + t * dz)));
  }
  return best;
}

const hash = (x: number, z: number) => {
  const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453;
  return s - Math.floor(s);
};

function noise(x: number, z: number): number {
  const xi = Math.floor(x);
  const zi = Math.floor(z);
  const xf = x - xi;
  const zf = z - zi;
  const u = xf * xf * (3 - 2 * xf);
  const v = zf * zf * (3 - 2 * zf);
  const a = hash(xi, zi);
  const b = hash(xi + 1, zi);
  const c = hash(xi, zi + 1);
  const d = hash(xi + 1, zi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

const fbm = (x: number, z: number) => noise(x, z) * 0.6 + noise(x * 2.3, z * 2.3) * 0.28 + noise(x * 5.1, z * 5.1) * 0.12;

// Ice caps: Vatnajökull, Langjökull, Hofsjökull, Mýrdalsjökull
const CAPS = [
  { c: project(-16.8, 64.42), r: 0.75, h: 0.16 },
  { c: project(-20.1, 64.62), r: 0.32, h: 0.1 },
  { c: project(-18.8, 64.8), r: 0.3, h: 0.1 },
  { c: project(-19.1, 63.65), r: 0.25, h: 0.1 },
];

export const SEA = -0.06;

/** Terrain height at a scene point. Also returns whether it is ice cap. */
export function heightAt(x: number, z: number): { h: number; ice: number } {
  if (!inside(x, z)) return { h: SEA - 0.3, ice: 0 };
  const e = Math.min(1, edgeDist(x, z) / 0.45);
  const edge = e * e * (3 - 2 * e);
  let h = 0.03 + edge * (0.08 + fbm(x * 1.6 + 3, z * 1.6) * 0.32);
  let ice = 0;
  for (const cap of CAPS) {
    const d = Math.hypot(x - cap.c[0], z - cap.c[1]) / cap.r;
    if (d < 1) {
      const k = 1 - d * d;
      h += cap.h * Math.sqrt(k) * edge * (0.8 + fbm(x * 4, z * 4) * 0.4);
      ice = Math.max(ice, k);
    }
  }
  return { h, ice };
}

export const BOUNDS = { minX: -4.0, maxX: 3.6, minZ: -2.6, maxZ: 2.7 };
