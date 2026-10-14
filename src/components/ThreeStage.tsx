import React, { type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
export function ThreeStage({
  children,
  lowPower = false,
  rendering = true,
}: {
  children: ReactNode;
  lowPower?: boolean;
  rendering?: boolean;
}) {
  return (
    <Canvas
      frameloop={rendering ? "always" : "never"}
      camera={{ position: [0, 2.05, 6.8], fov: 35 }}
      dpr={lowPower ? 1 : [1, 1.5]}
      gl={{ antialias: !lowPower, alpha: false, preserveDrawingBuffer: true }}
    >
      {children}
    </Canvas>
  );
}
