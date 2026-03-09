import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei/core/Line';
import { Float } from '@react-three/drei/core/Float';
import { OrbitControls } from '@react-three/drei/core/OrbitControls';

function MapTerrain() {
  const ref = useRef();
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.z += delta * 0.03;
  });

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2.1, 0, 0]} position={[0, -0.55, 0]}>
      <planeGeometry args={[6, 6, 42, 42]} />
      <meshStandardMaterial color="#10243a" wireframe opacity={0.58} transparent />
    </mesh>
  );
}

function ParcelsAndRoads() {
  const parcelBoxes = useMemo(
    () => Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: (i % 5) - 2,
      z: Math.floor(i / 5) - 2,
      h: 0.08 + ((i % 4) * 0.03)
    })),
    []
  );

  const roadLines = [
    [[-2.3, -0.3, -2.3], [2.3, -0.3, 2.3]],
    [[-2.3, -0.3, 2.3], [2.3, -0.3, -2.3]],
    [[-2.3, -0.3, 0], [2.3, -0.3, 0]],
    [[0, -0.3, -2.3], [0, -0.3, 2.3]]
  ];

  return (
    <group>
      {parcelBoxes.map((parcel) => (
        <mesh key={parcel.id} position={[parcel.x * 0.75, parcel.h / 2 - 0.45, parcel.z * 0.75]}>
          <boxGeometry args={[0.5, parcel.h, 0.5]} />
          <meshStandardMaterial color="#36c9ff" emissive="#0f6d8f" emissiveIntensity={0.2} />
        </mesh>
      ))}
      {roadLines.map((pts, idx) => (
        <Line key={idx} points={pts} color={idx < 2 ? '#f4c542' : '#5be9ff'} lineWidth={2} transparent opacity={0.9} />
      ))}
    </group>
  );
}

function ZoningHalo() {
  return (
    <Float speed={1.4} floatIntensity={0.5}>
      <mesh position={[0, 0.45, 0]}>
        <ringGeometry args={[1.35, 1.7, 72]} />
        <meshBasicMaterial color="#4fd1ff" transparent opacity={0.55} />
      </mesh>
    </Float>
  );
}

export default function LandCommandMap({ className = '', autoRotate = true }) {
  return (
    <div className={className}>
      <Canvas camera={{ position: [0, 2.8, 4.6], fov: 44 }}>
        <ambientLight intensity={0.62} />
        <pointLight position={[2, 3, 2]} intensity={30} />
        <pointLight position={[-3, 1, -1]} intensity={20} color="#22d3ee" />
        <MapTerrain />
        <ParcelsAndRoads />
        <ZoningHalo />
        <OrbitControls enableZoom={false} autoRotate={autoRotate} autoRotateSpeed={0.42} />
      </Canvas>
    </div>
  );
}
