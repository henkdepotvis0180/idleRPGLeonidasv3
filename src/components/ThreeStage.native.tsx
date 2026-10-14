import React, { type ReactNode } from "react";
import { Canvas } from "@react-three/fiber/native";
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
      gl={{ antialias: !lowPower, alpha: false }}
    >
      {children}
    </Canvas>
  );
}
