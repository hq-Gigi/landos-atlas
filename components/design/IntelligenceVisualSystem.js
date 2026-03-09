import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei/core/Float';
import { Line } from '@react-three/drei/core/Line';
import { OrbitControls } from '@react-three/drei/core/OrbitControls';
import { Stars } from '@react-three/drei/core/Stars';
import { Text } from '@react-three/drei/core/Text';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import Lenis from 'lenis';
import * as THREE from 'three';

function ParcelExtrusion({ parcels }) {
  const meshRef = useRef();

  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.15;
  });

  return (
    <group ref={meshRef} position={[0, -0.8, 0]}>
      {parcels.map((parcel, index) => {
        const x = (index % 5) - 2;
        const z = Math.floor(index / 5) - 2;
        const h = 0.2 + parcel.score / 80;
        return (
          <mesh key={parcel.id} position={[x * 0.65, h / 2, z * 0.65]}>
            <boxGeometry args={[0.45, h, 0.45]} />
            <meshStandardMaterial color={new THREE.Color(`hsl(${180 + parcel.score}, 82%, 58%)`)} metalness={0.45} roughness={0.18} />
          </mesh>
        );
      })}
    </group>
  );
}

function ScenarioGenerationField() {
  const routes = useMemo(() => [
    [[-2, -0.2, -1], [-1.2, 0.6, -0.2], [-0.2, 0.2, 0.5], [0.9, 0.8, 0.9], [2, 0.3, 1.4]],
    [[-2, 0.6, 1.1], [-1.1, 0.4, 0.5], [0.1, 0.95, 0.2], [1.1, 0.5, -0.3], [2, 0.7, -1]],
    [[-1.7, -0.4, 1.5], [-0.5, 0.2, 0.8], [0.6, -0.1, 0.1], [1.8, 0.4, -0.6]]
  ], []);

  return (
    <group>
      {routes.map((points, idx) => (
        <Line key={idx} points={points} color={idx === 1 ? '#f4c542' : '#4fd1ff'} lineWidth={1.5} transparent opacity={0.85} />
      ))}
      <Float speed={1.8} rotationIntensity={0.4} floatIntensity={1.2}>
        <mesh>
          <icosahedronGeometry args={[0.55, 1]} />
          <meshStandardMaterial color="#6ee7ff" emissive="#0f6b93" metalness={0.55} roughness={0.3} />
        </mesh>
      </Float>
    </group>
  );
}

function RevenueRing() {
  const ref = useRef();
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.45;
  });
  return (
    <mesh ref={ref}>
      <torusGeometry args={[1.2, 0.16, 18, 80]} />
      <meshStandardMaterial color="#4fd1ff" emissive="#0d5c85" metalness={0.7} roughness={0.22} />
    </mesh>
  );
}

function CostLayer() {
  const ref = useRef();
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.x += delta * 0.2;
  });
  return (
    <mesh ref={ref} rotation={[Math.PI / 2.4, 0, 0]}>
      <cylinderGeometry args={[0.82, 0.82, 0.25, 40, 1, true]} />
      <meshStandardMaterial color="#fb7185" wireframe transparent opacity={0.8} />
    </mesh>
  );
}

function MarginCore() {
  return (
    <Float speed={2.1} floatIntensity={1.5}>
      <mesh>
        <octahedronGeometry args={[0.45, 1]} />
        <meshStandardMaterial color="#f4c542" emissive="#8f6b12" metalness={0.5} roughness={0.22} />
      </mesh>
    </Float>
  );
}

function FinancialCoreScene() {
  return (
    <group>
      <RevenueRing />
      <CostLayer />
      <MarginCore />
    </group>
  );
}

function CollaborationGraph() {
  const nodes = useMemo(
    () => [
      { id: 'Developer', pos: [-1.4, 0.8, 0], color: '#4fd1ff' },
      { id: 'Planner', pos: [0, 1.2, -0.4], color: '#22d3ee' },
      { id: 'Investor', pos: [1.4, 0.6, 0.1], color: '#f4c542' },
      { id: 'Regulator', pos: [-0.8, -0.6, 0.5], color: '#93c5fd' },
      { id: 'Infra', pos: [0.8, -0.8, -0.3], color: '#fda4af' }
    ],
    []
  );

  const edges = [
    [0, 1], [1, 2], [0, 3], [2, 4], [3, 4], [1, 4]
  ];

  return (
    <group>
      {edges.map(([a, b], idx) => (
        <Line key={idx} points={[nodes[a].pos, nodes[b].pos]} color="#8dd8ff" transparent opacity={0.65} lineWidth={1} />
      ))}
      {nodes.map((node) => (
        <Float key={node.id} speed={2} floatIntensity={0.8}>
          <group position={node.pos}>
            <mesh>
              <sphereGeometry args={[0.16, 18, 18]} />
              <meshStandardMaterial color={node.color} emissive={node.color} emissiveIntensity={0.2} />
            </mesh>
            <Text position={[0, 0.28, 0]} fontSize={0.09} color="#dff5ff" anchorX="center" anchorY="middle">
              {node.id}
            </Text>
          </group>
        </Float>
      ))}
    </group>
  );
}

function PlanetarySignals() {
  const points = [
    [0.9, 0.35, -0.22],
    [-0.86, 0.4, 0.28],
    [0.24, -0.95, 0.1],
    [-0.12, 0.86, -0.5],
    [0.62, -0.2, 0.75]
  ];

  return (
    <group>
      <mesh>
        <sphereGeometry args={[1.1, 40, 40]} />
        <meshStandardMaterial color="#0f2b43" metalness={0.2} roughness={0.65} wireframe />
      </mesh>
      {points.map((point, idx) => (
        <mesh key={idx} position={point.map((v) => v * 1.1)}>
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshBasicMaterial color="#4fd1ff" />
        </mesh>
      ))}
      <Stars radius={14} depth={30} count={1200} factor={1.8} saturation={0.8} fade speed={0.7} />
    </group>
  );
}

function SceneShell({ children, camera = [0, 1.6, 4.2] }) {
  return (
    <Canvas camera={{ position: camera, fov: 52 }}>
      <ambientLight intensity={0.55} />
      <pointLight position={[3, 3, 4]} intensity={28} />
      <pointLight position={[-3, -2, 2]} intensity={16} color="#22d3ee" />
      {children}
      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.55} />
    </Canvas>
  );
}

const views = [
  { key: 'parcel', title: 'Parcel intelligence field', copy: '3D parcel extrusion prioritizes topology and score dominance to expose actionable opportunity in seconds.', scene: <SceneShell><ParcelExtrusion parcels={[{ id: 1, score: 72 }, { id: 2, score: 65 }, { id: 3, score: 89 }, { id: 4, score: 58 }, { id: 5, score: 78 }, { id: 6, score: 86 }, { id: 7, score: 61 }, { id: 8, score: 95 }, { id: 9, score: 69 }, { id: 10, score: 83 }, { id: 11, score: 62 }, { id: 12, score: 74 }, { id: 13, score: 91 }, { id: 14, score: 57 }, { id: 15, score: 80 }]} /></SceneShell> },
  { key: 'scenario', title: 'Scenario generation engine', copy: 'Deterministic pathways animate planning alternatives while preserving confidence context and delivery inevitability.', scene: <SceneShell><ScenarioGenerationField /></SceneShell> },
  { key: 'financial', title: 'Financial core visualization', copy: 'RevenueRing, CostLayer, and MarginCore synchronize feasibility signals into one executive object.', scene: <SceneShell><FinancialCoreScene /></SceneShell> },
  { key: 'collab', title: 'Collaboration network graph', copy: 'Stakeholder nodes and interaction vectors reveal coordination velocity across execution-critical actors.', scene: <SceneShell><CollaborationGraph /></SceneShell> },
  { key: 'planetary', title: 'Global land signal map', copy: 'Planetary signal mesh tracks concurrent active parcels and strategic portfolio command worldwide.', scene: <SceneShell camera={[0, 0.8, 3.8]}><PlanetarySignals /></SceneShell> }
];

export default function IntelligenceVisualSystem() {
  const rootRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const lenis = new Lenis({ duration: 1.05, smoothWheel: true });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    const context = gsap.context(() => {
      gsap.utils.toArray('.intel-panel').forEach((panel) => {
        gsap.fromTo(panel, { opacity: 0, y: 80 }, {
          opacity: 1,
          y: 0,
          duration: 1.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: panel,
            start: 'top 78%'
          }
        });
      });
    }, rootRef);

    return () => {
      context.revert();
      lenis.destroy();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <section ref={rootRef} className="mt-8 space-y-8">
      {views.map((view, index) => (
        <motion.article
          key={view.key}
          className="intel-panel overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-[#071321] via-[#08192a] to-[#03070f]"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.18 }}
          transition={{ duration: 0.7, delay: index * 0.04 }}
        >
          <div className="grid gap-0 lg:grid-cols-[1fr_1.25fr]">
            <div className="p-6 lg:p-8">
              <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/80">intelligence view {String(index + 1).padStart(2, '0')}</p>
              <h3 className="mt-4 text-2xl font-semibold leading-tight lg:text-3xl">{view.title}</h3>
              <p className="mt-4 text-sm text-[#b7d2e9] lg:text-base">{view.copy}</p>
            </div>
            <div className="h-[320px] lg:h-[360px]">{view.scene}</div>
          </div>
        </motion.article>
      ))}
    </section>
  );
}
