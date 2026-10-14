import { classFor, type SpellEffect } from "../content.ts";
import type { State } from "../engine.ts";
export type SoundKey =
  | SpellEffect
  | "bow"
  | "heavy"
  | "fists"
  | "shield"
  | "victory";
/** Pure mapping keeps game logic and audio playback independent and testable. */
export function soundProfile(s: State): {
  key: SoundKey;
  rate: number;
  volume: number;
} {
  if (s.combat.kind === "kill" && s.wave === 1)
    return { key: "victory", rate: 1, volume: 0.3 };
  if (
    s.combat.kind === "spell" &&
    s.combat.effect === "steel" &&
    s.combat.shield > 0 &&
    s.combat.amount === 0
  )
    return { key: "shield", rate: 0.95, volume: 0.3 };
  const weapon = s.gear.weapon?.weaponStyle ?? classFor(s.classId).weapon;
  const key: SoundKey =
    s.combat.effect !== "steel"
      ? s.combat.effect
      : weapon === "bow"
        ? "bow"
        : ["hammer", "axe"].includes(weapon)
          ? "heavy"
          : weapon === "fists"
            ? "fists"
            : "steel";
  // The same school still varies with the ability's identity, without random playback jitter.
  const hash = [...(s.combat.label || s.classId)].reduce(
    (n, c) => n + c.charCodeAt(0),
    0,
  );
  return {
    key,
    rate: s.combat.kind === "spell" ? 0.88 + (hash % 7) * 0.04 : 1,
    volume: s.combat.kind === "spell" ? 0.29 : 0.22,
  };
}
