import { Canvas } from '@react-three/fiber';
import { ParcelPrism } from './scene-objects/ParcelPrism';
import { RoadLayer } from './scene-objects/RoadLayer';
import { PlotCells } from './scene-objects/PlotCells';
import { ReserveVolumes } from './scene-objects/ReserveVolumes';

export default function AtlasExperienceScene({ progress = 0 }) {
  return (
    <Canvas camera={{ position: [0, 2.7, 6], fov: 42 }}>
      <ambientLight intensity={0.55} />
      <directionalLight intensity={1.2} position={[2, 4, 3]} />
      <ParcelPrism progress={progress} />
      <RoadLayer progress={progress} />
      <PlotCells progress={progress} />
      <ReserveVolumes progress={progress} />
    </Canvas>
  );
}
