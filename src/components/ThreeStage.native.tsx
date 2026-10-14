import React, { useEffect, useRef, type ReactNode } from "react";
import { Canvas, useThree } from "@react-three/fiber/native";
/** Schedule after each completed draw, leaving time for native input and layout.
 * Keeping the context alive while a panel is open avoids destroying a busy Expo GL view. */
function FrameDriver({ enabled, fps }: { enabled: boolean; fps: number }) {
  const advance = useThree((s) => s.advance),
    elapsed = useRef(0);
  useEffect(() => {
    if (!enabled) return;
    let disposed = false,
      timer: ReturnType<typeof setTimeout>,
      previous = performance.now();
    const draw = () => {
      if (disposed) return;
      const now = performance.now();
      elapsed.current += (now - previous) / 1000;
      previous = now;
      advance(elapsed.current, false);
      timer = setTimeout(draw, 1000 / fps);
    };
    timer = setTimeout(draw, 1000 / fps);
    return () => {
      disposed = true;
      clearTimeout(timer);
    };
  }, [advance, enabled, fps]);
  return null;
}
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
      camera={{ position: [0, 2.05, 6.8], fov: 35 }}
      frameloop="never"
      gl={{ antialias: !lowPower, alpha: false }}
    >
      <FrameDriver enabled={rendering} fps={lowPower ? 20 : 30} />
      {children}
    </Canvas>
  );
}
