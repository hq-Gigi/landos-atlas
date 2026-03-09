export function PlotCells({ progress = 0 }) {
  const spread = 0.5 * progress;
  return (
    <group>
      {[-1, 0, 1].map((x) => (
        <mesh key={x} position={[x * (0.7 + spread), 0.2, 0]}>
          <boxGeometry args={[0.45, 0.25, 0.8]} />
          <meshStandardMaterial color="#EAF6FF" transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
}
