export function RoadLayer({ progress = 0 }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
      <planeGeometry args={[3.2, 0.3 + progress * 0.3]} />
      <meshStandardMaterial color="#4FD1FF" emissive="#4FD1FF" emissiveIntensity={0.25} />
    </mesh>
  );
}
