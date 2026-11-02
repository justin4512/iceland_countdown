import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Line, OrbitControls, Stars } from '@react-three/drei';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { ITINERARY } from '../data/itinerary';
import { BOUNDS, SEA, heightAt, project } from './geo';

export interface SceneProps {
  dark: boolean;
  mode: 'island' | 'globe';
  /** trip day to highlight (0 = none) */
  focusDay: number;
}

export default function Scene3D({ dark, mode, focusDay }: SceneProps) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: mode === 'island' ? [0, 3.6, 8.2] : [0, 1.4, 12.5], fov: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      key={mode}
    >
      <fog attach="fog" args={[dark ? '#050b1a' : '#dfe9f4', 9, 22]} />
      <ambientLight intensity={dark ? 0.35 : 0.9} />
      <directionalLight position={[4, 6, 3]} intensity={dark ? 0.9 : 1.6} color={dark ? '#b9d4ff' : '#fff6ea'} />
      <pointLight position={[0, 2.5, -2]} intensity={dark ? 3 : 0.6} color="#3dffb0" distance={8} />
      {dark && <Stars radius={40} depth={20} count={2500} factor={2.5} fade speed={0.4} />}
      {mode === 'island' ? <IslandScene dark={dark} focusDay={focusDay} /> : <GlobeScene dark={dark} />}
      <Snow dark={dark} />
      <FitToAspect />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate
        autoRotateSpeed={mode === 'island' ? 0.35 : 0.6}
        // aim below the model so it sits in the top part of the screen, above the cards
        target={mode === 'island' ? [0, -1.5, 0] : [0, -0.9, 0]}
        minPolarAngle={0.45}
        maxPolarAngle={1.2}
      />
    </Canvas>
  );
}

/** Zoom out on portrait screens so the whole model stays in frame */
function FitToAspect() {
  const { camera, size } = useThree();
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.zoom = Math.min(1, size.width / size.height / 1.3);
    cam.updateProjectionMatrix();
  }, [camera, size.width, size.height]);
  return null;
}

/* ---------------- Island ---------------- */

function IslandScene({ dark, focusDay }: { dark: boolean; focusDay: number }) {
  return (
    <group position={[0.2, -0.2, 0]} scale={0.78}>
      <Terrain dark={dark} />
      <Water dark={dark} />
      <Route focusDay={focusDay} dark={dark} />
      <Aurora dark={dark} />
    </group>
  );
}

function Terrain({ dark }: { dark: boolean }) {
  const geom = useMemo(() => {
    const w = BOUNDS.maxX - BOUNDS.minX;
    const d = BOUNDS.maxZ - BOUNDS.minZ;
    const g = new THREE.PlaneGeometry(w, d, 120, 84);
    g.rotateX(-Math.PI / 2);
    g.translate((BOUNDS.minX + BOUNDS.maxX) / 2, 0, (BOUNDS.minZ + BOUNDS.maxZ) / 2);
    const pos = g.attributes.position;
    const ice: number[] = [];
    for (let i = 0; i < pos.count; i++) {
      const r = heightAt(pos.getX(i), pos.getZ(i));
      pos.setY(i, r.h);
      ice.push(r.ice);
    }
    const flat = g.toNonIndexed();
    flat.computeVertexNormals();
    // colour per face (flat low-poly look)
    const p = flat.attributes.position;
    const colors = new Float32Array(p.count * 3);
    const rock = new THREE.Color(dark ? '#2a3546' : '#5d6b7d');
    const snow = new THREE.Color(dark ? '#cfe0f5' : '#ffffff');
    const glacier = new THREE.Color(dark ? '#d8f0ff' : '#e6f6ff');
    const moss = new THREE.Color(dark ? '#3c5a52' : '#7e9b8c');
    const tmp = new THREE.Color();
    for (let f = 0; f < p.count; f += 3) {
      const h = (p.getY(f) + p.getY(f + 1) + p.getY(f + 2)) / 3;
      const cx = (p.getX(f) + p.getX(f + 1) + p.getX(f + 2)) / 3;
      const cz = (p.getZ(f) + p.getZ(f + 1) + p.getZ(f + 2)) / 3;
      const iceAmt = heightAt(cx, cz).ice;
      if (h < 0.06) tmp.copy(moss);
      else if (h < 0.13) tmp.copy(rock).lerp(snow, (h - 0.06) / 0.07);
      else tmp.copy(snow);
      if (iceAmt > 0.15) tmp.lerp(glacier, Math.min(0.8, iceAmt));
      tmp.offsetHSL(0, 0, (Math.random() - 0.5) * 0.04);
      for (let k = 0; k < 3; k++) colors.set([tmp.r, tmp.g, tmp.b], (f + k) * 3);
    }
    flat.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    void ice;
    return flat;
  }, [dark]);

  return (
    <mesh geometry={geom}>
      <meshStandardMaterial vertexColors flatShading roughness={0.75} metalness={0.05} />
    </mesh>
  );
}

function Water({ dark }: { dark: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.y = SEA + 0.04 + Math.sin(clock.elapsedTime * 0.6) * 0.004;
  });
  return (
    <mesh ref={ref} rotation-x={-Math.PI / 2}>
      <circleGeometry args={[40, 64]} />
      <meshStandardMaterial
        color={dark ? '#0a1a33' : '#9cc3e6'}
        roughness={0.25}
        metalness={0.6}
      />
    </mesh>
  );
}

function Route({ focusDay, dark }: { focusDay: number; dark: boolean }) {
  const lineRef = useRef<{ material: { dashOffset: number } } | null>(null);
  const { points, markers } = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const mk: { p: THREE.Vector3; day: number }[] = [];
    for (const d of ITINERARY) {
      for (const s of d.stops) {
        const [x, z] = project(s.lon, s.lat);
        const v = new THREE.Vector3(x, Math.max(heightAt(x, z).h, 0) + 0.06, z);
        pts.push(v);
        mk.push({ p: v, day: d.day });
      }
    }
    // smooth the path a bit
    const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal', 0.3);
    return { points: curve.getPoints(pts.length * 8), markers: mk };
  }, []);

  useFrame((_, dt) => {
    if (lineRef.current) lineRef.current.material.dashOffset -= dt * 0.25;
  });

  const color = dark ? '#3dffd0' : '#0a84ff';
  return (
    <group>
      <Line points={points} color={color} lineWidth={1.2} transparent opacity={0.35} />
      <Line
        ref={lineRef as never}
        points={points}
        color={color}
        lineWidth={2.4}
        dashed
        dashSize={0.18}
        gapSize={0.22}
        transparent
        opacity={0.95}
      />
      {markers.map((m, i) => (
        <Marker key={i} position={m.p} active={focusDay === m.day} color={color} />
      ))}
    </group>
  );
}

function Marker({ position, active, color }: { position: THREE.Vector3; active: boolean; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const s = active ? 1.6 + Math.sin(clock.elapsedTime * 4) * 0.5 : 1;
    ref.current.scale.setScalar(s);
  });
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[active ? 0.05 : 0.03, 12, 12]} />
      <meshBasicMaterial color={active ? '#ffd166' : color} toneMapped={false} />
    </mesh>
  );
}

/* ---------------- Aurora ---------------- */

const auroraVert = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 p = position;
    p.z += sin(p.x * 1.3 + uTime * 0.35) * 0.35 + sin(p.x * 3.1 - uTime * 0.6) * 0.08;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const auroraFrag = /* glsl */ `
  uniform float uTime;
  uniform float uStrength;
  uniform vec3 uLow;
  uniform vec3 uHigh;
  varying vec2 vUv;
  float h(float n) { return fract(sin(n) * 43758.5453); }
  float n1(float x) { float i = floor(x); float f = fract(x); return mix(h(i), h(i + 1.0), smoothstep(0.0, 1.0, f)); }
  void main() {
    float rays = n1(vUv.x * 40.0 + uTime * 0.8) * 0.6 + n1(vUv.x * 9.0 - uTime * 0.3) * 0.4;
    float base = smoothstep(0.0, 0.12, vUv.y);
    float top = 1.0 - smoothstep(0.25, 1.0, vUv.y);
    float sides = smoothstep(0.0, 0.15, vUv.x) * smoothstep(1.0, 0.85, vUv.x);
    float a = base * top * sides * (0.35 + rays * 0.9) * uStrength;
    vec3 col = mix(uLow, uHigh, smoothstep(0.15, 0.9, vUv.y));
    gl_FragColor = vec4(col * (0.6 + rays), a);
  }
`;

function Aurora({ dark }: { dark: boolean }) {
  const ribbons = [
    { pos: [0, 1.6, -3.2] as const, rot: 0.08, w: 11, hgt: 2.4, seed: 0 },
    { pos: [0.8, 2.0, -4.2] as const, rot: -0.12, w: 13, hgt: 2.8, seed: 2.7 },
    { pos: [-1.2, 1.3, -2.4] as const, rot: 0.2, w: 7, hgt: 1.6, seed: 5.1 },
  ];
  return (
    <group>
      {ribbons.map((r, i) => (
        <AuroraRibbon key={i} {...r} dark={dark} />
      ))}
    </group>
  );
}

function AuroraRibbon({
  pos,
  rot,
  w,
  hgt,
  seed,
  dark,
}: {
  pos: readonly [number, number, number];
  rot: number;
  w: number;
  hgt: number;
  seed: number;
  dark: boolean;
}) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: seed },
      uStrength: { value: dark ? 1.5 : 0.7 },
      uLow: { value: new THREE.Color(dark ? '#29ffa5' : '#12c48b') },
      uHigh: { value: new THREE.Color(dark ? '#a46bff' : '#8a5cff') },
    }),
    [seed, dark],
  );
  useFrame((_, dt) => {
    if (mat.current) mat.current.uniforms.uTime.value += dt;
  });
  return (
    <mesh position={pos as unknown as THREE.Vector3Tuple} rotation={[0, rot, 0]}>
      <planeGeometry args={[w, hgt, 96, 1]} />
      <shaderMaterial
        ref={mat}
        vertexShader={auroraVert}
        fragmentShader={auroraFrag}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={dark ? THREE.AdditiveBlending : THREE.NormalBlending}
      />
    </mesh>
  );
}

/* ---------------- Snow ---------------- */

function Snow({ dark }: { dark: boolean }) {
  const COUNT = 900;
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 12;
      arr[i * 3 + 1] = Math.random() * 6 - 1;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return arr;
  }, []);
  useFrame(({ clock }, dt) => {
    const p = ref.current?.geometry.attributes.position;
    if (!p) return;
    const t = clock.elapsedTime;
    for (let i = 0; i < COUNT; i++) {
      let y = p.getY(i) - dt * (0.18 + (i % 7) * 0.03);
      if (y < -1) y = 5;
      p.setY(i, y);
      p.setX(i, p.getX(i) + Math.sin(t * 0.5 + i) * dt * 0.08);
    }
    p.needsUpdate = true;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color={dark ? '#e8f4ff' : '#ffffff'}
        transparent
        opacity={dark ? 0.75 : 0.95}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

/* ---------------- Globe (takeoff mode) ---------------- */

const R = 2;
function latLon(lat: number, lon: number, r = R) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
}

const TPE = { lat: 25.08, lon: 121.23 };
const KEF = { lat: 63.99, lon: -22.6 };

function GlobeScene({ dark }: { dark: boolean }) {
  const group = useRef<THREE.Group>(null);
  const plane = useRef<THREE.Mesh>(null);

  const arc = useMemo(() => {
    const a = latLon(TPE.lat, TPE.lon);
    const b = latLon(KEF.lat, KEF.lon);
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 120; i++) {
      const t = i / 120;
      const v = a.clone().lerp(b, t).normalize();
      // slerp-ish then lift
      const lift = 1 + Math.sin(Math.PI * t) * 0.28;
      const s = new THREE.Vector3().copy(a).normalize();
      const e = new THREE.Vector3().copy(b).normalize();
      const ang = s.angleTo(e);
      const q = new THREE.Vector3()
        .copy(s)
        .multiplyScalar(Math.sin((1 - t) * ang) / Math.sin(ang))
        .add(e.clone().multiplyScalar(Math.sin(t * ang) / Math.sin(ang)));
      void v;
      pts.push(q.multiplyScalar(R * lift));
    }
    return new THREE.CatmullRomCurve3(pts);
  }, []);

  const dots = useMemo(() => {
    const N = 2600;
    const arr = new Float32Array(N * 3);
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const th = golden * i;
      arr.set([Math.cos(th) * r * R * 1.002, y * R * 1.002, Math.sin(th) * r * R * 1.002], i * 3);
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    const t = (clock.elapsedTime % 7) / 7;
    if (plane.current) {
      const p = arc.getPointAt(t);
      plane.current.position.copy(p);
      plane.current.lookAt(arc.getPointAt(Math.min(1, t + 0.01)));
    }
  });

  // Face the arc's midpoint toward the camera on start
  const mid = arc.getPointAt(0.5);
  const yaw = Math.atan2(mid.x, mid.z);

  const accent = dark ? '#3dffd0' : '#0a84ff';
  return (
    <group ref={group} rotation={[0.35, -yaw, 0]}>
      <mesh>
        <sphereGeometry args={[R, 64, 48]} />
        <meshStandardMaterial color={dark ? '#0b1730' : '#cfe0f2'} roughness={0.6} metalness={0.2} />
      </mesh>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dots, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.018} color={dark ? '#5d7fb8' : '#7d98bd'} transparent opacity={0.8} />
      </points>
      <mesh>
        <sphereGeometry args={[R * 1.08, 48, 32]} />
        <meshBasicMaterial color={accent} transparent opacity={dark ? 0.06 : 0.08} side={THREE.BackSide} />
      </mesh>
      <Line points={arc.getPoints(160)} color={accent} lineWidth={2.5} />
      <mesh ref={plane}>
        <coneGeometry args={[0.05, 0.16, 12]} />
        <meshBasicMaterial color="#ffd166" toneMapped={false} />
      </mesh>
      {[TPE, KEF].map((c, i) => (
        <mesh key={i} position={latLon(c.lat, c.lon, R * 1.01)}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshBasicMaterial color={i ? '#3dffd0' : '#ff7a59'} toneMapped={false} />
        </mesh>
      ))}
      <AuroraOval dark={dark} />
    </group>
  );
}

function AuroraOval({ dark }: { dark: boolean }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uStrength: { value: dark ? 1 : 0.6 },
      uLow: { value: new THREE.Color('#29ffa5') },
      uHigh: { value: new THREE.Color('#a46bff') },
    }),
    [dark],
  );
  useFrame((_, dt) => {
    if (mat.current) mat.current.uniforms.uTime.value += dt;
  });
  // ring at ~67°N
  const y = R * Math.cos(((90 - 67) * Math.PI) / 180);
  const r = R * Math.sin(((90 - 67) * Math.PI) / 180);
  return (
    <mesh position={[0, y + 0.05, 0]}>
      <cylinderGeometry args={[r * 1.12, r, 0.5, 96, 1, true]} />
      <shaderMaterial
        ref={mat}
        vertexShader={/* glsl */ `
          varying vec2 vUv;
          void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
        `}
        fragmentShader={auroraFrag}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}
