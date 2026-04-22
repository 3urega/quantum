"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { BlochSceneContent } from "./BlochScene";
import type { BellBlochState } from "./blochMath";

type Props = {
  state: BellBlochState;
};

export function BlochSphereCanvas({ state }: Props) {
  return (
    <div
      className="w-full h-[300px] rounded-lg overflow-hidden border border-zinc-300/80 dark:border-zinc-700 bg-zinc-950"
      role="img"
      aria-label="Vista 3D de las esferas de Bloch; arrastra para orbitar el modelo."
    >
      <Canvas
        camera={{ position: [0, 1.2, 4.2], fov: 42 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
        style={{ width: "100%", height: "100%" }}
        onCreated={({ gl }) => {
          gl.setClearColor("#0a0a0b", 1);
        }}
      >
        <BlochSceneContent state={state} />
        <OrbitControls
          enableZoom={false}
          enableDamping
          makeDefault
          maxPolarAngle={Math.PI * 0.9}
          minPolarAngle={0.08}
        />
      </Canvas>
    </div>
  );
}
