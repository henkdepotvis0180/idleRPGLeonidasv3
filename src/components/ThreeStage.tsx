import React, { type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
export function ThreeStage({
  children,
  lowPower = false,
}: {
  children: ReactNode;
  lowPower?: boolean;
}) {
  return (
    <Canvas
      camera={{ position: [0, 2.05, 6.8], fov: 35 }}
      dpr={lowPower ? 1 : [1, 1.5]}
      gl={{ antialias: !lowPower, alpha: false, preserveDrawingBuffer: true }}
    >
      {children}
    </Canvas>
  );
}
