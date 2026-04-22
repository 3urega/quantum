"use client";

import { Line } from "@react-three/drei";
import { useMemo } from "react";
import { type BellBlochState, blochVectorUnit } from "./blochMath";

const AXIS_LEN = 1.1;
const VECTOR_LEN = 0.88;
const ORBIT = 0.9;

type UnitProps = {
  position: [number, number, number];
  theta: number;
  phi: number;
  vectorOpacity: number;
};

function BlochUnit({ position, theta, phi, vectorOpacity }: UnitProps) {
  const [vx, vy, vz] = useMemo(
    () => blochVectorUnit(theta, phi).map((c) => c * VECTOR_LEN) as [number, number, number],
    [theta, phi],
  );

  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[1, 48, 48]} />
        <meshStandardMaterial
          color="#27272a"
          wireframe
          transparent
          opacity={0.45}
        />
      </mesh>
      <Line
        points={[
          [-AXIS_LEN, 0, 0],
          [AXIS_LEN, 0, 0],
        ]}
        color="#f43f5e"
        lineWidth={1}
        opacity={0.6}
        transparent
      />
      <Line
        points={[
          [0, -AXIS_LEN, 0],
          [0, AXIS_LEN, 0],
        ]}
        color="#22c55e"
        lineWidth={1}
        opacity={0.6}
        transparent
      />
      <Line
        points={[
          [0, 0, -AXIS_LEN],
          [0, 0, AXIS_LEN],
        ]}
        color="#3b82f6"
        lineWidth={1}
        opacity={0.6}
        transparent
      />
      <Line
        points={[
          [0, 0, 0],
          [vx, vy, vz],
        ]}
        color="#22d3ee"
        lineWidth={2.5}
        opacity={vectorOpacity}
        transparent
      />
    </group>
  );
}

type Props = {
  state: BellBlochState;
};

export function BlochSceneContent({ state }: Props) {
  const op = state.entangled ? 0.45 : 1;

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[2.5, 3, 2]} intensity={0.9} />
      <BlochUnit
        position={[-ORBIT, 0, 0]}
        theta={state.q0.theta}
        phi={state.q0.phi}
        vectorOpacity={op}
      />
      <BlochUnit
        position={[ORBIT, 0, 0]}
        theta={state.q1.theta}
        phi={state.q1.phi}
        vectorOpacity={op}
      />
      {state.entangled ? (
        <Line
          points={[
            [-ORBIT, 0, 0],
            [ORBIT, 0, 0],
          ]}
          color="#f59e0b"
          lineWidth={1.5}
          opacity={0.5}
          transparent
        />
      ) : null}
    </>
  );
}
