export function ReserveVolumes({ progress = 0 }) {
  return (
    <mesh position={[0, 0.35, -1 + progress * 0.2]}>
      <boxGeometry args={[1.8, 0.2, 0.4]} />
      <meshStandardMaterial color="#F4C542" transparent opacity={0.4} />
    </mesh>
  );
}
