/** Turn complete gameplay modules on/off here, then rebuild the APK. */
export const MODULES = {
  shop: true,
  dailyQuests: true,
  offlineRewards: true,
  roguelike: true,
} as const;
export const RULES = {
  encountersPerRun: 10,
  blessingWaves: [3, 6, 9],
  bagSize: 12,
  maxBags: 4,
  bagPrice: 150,
  lootChance: 0.25,
  bossRewardMultiplier: 2,
  storyGold: 60,
  storyXpPerChapter: 50,
  offlineCapSeconds: 8 * 3600,
  offlineKillSeconds: 30,
} as const;
