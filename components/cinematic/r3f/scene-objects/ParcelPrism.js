export function ParcelPrism({ progress = 0 }) {
  return (
    <mesh position={[0, progress * 0.4, 0]}>
      <boxGeometry args={[2.2, 0.4 + progress * 0.5, 2.2]} />
      <meshStandardMaterial color="#1397FF" transparent opacity={0.35 + progress * 0.2} />
    </mesh>
  );
}
