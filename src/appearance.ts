export const SKIN_TONES = [
  "#f4cba6",
  "#dca77c",
  "#b77e57",
  "#895739",
  "#604333",
];
export const HAIR_COLORS = [
  "#493124",
  "#d3a659",
  "#f0e5d1",
  "#a24e43",
  "#536b9f",
  "#9471b8",
];
export const ACCENT_COLORS = [
  "#68c6b0",
  "#84acdf",
  "#c29bec",
  "#e9b969",
  "#d77f9c",
  "#94bd75",
];
export const HAIR_STYLES = ["Short", "Swept", "Twin tails", "Spiky"];
export type Appearance = {
  skin: number;
  hair: number;
  style: number;
  accent: number;
  face: number;
};
export const defaultAppearance = (): Appearance => ({
  skin: 0,
  hair: 0,
  style: 1,
  accent: 0,
  face: 0,
});
export const validAppearance = (a: any): a is Appearance =>
  a &&
  [a.skin, a.hair, a.style, a.accent, a.face].every(Number.isInteger) &&
  a.skin >= 0 &&
  a.skin < SKIN_TONES.length &&
  a.hair >= 0 &&
  a.hair < HAIR_COLORS.length &&
  a.style >= 0 &&
  a.style < HAIR_STYLES.length &&
  a.accent >= 0 &&
  a.accent < ACCENT_COLORS.length &&
  a.face >= 0 &&
  a.face < 3;
