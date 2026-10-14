# Asset provenance

## Original 0.3.0 assets

- `icon.png`: original generated launcher artwork created for Leonidas. It is promotional/launcher art; the in-game heroes are separate real-time procedural models.
- `src/visuals/`: original procedural 3D characters, equipment, monsters, scenery and transform animations written for this project. No franchise models, textures or animation files are used.
- `src/components/GearIcon.tsx`: original SVG paths for the sixteen equipment slots.
- `audio/*.wav`: original deterministic ambient composition and synthesized effects produced by `scripts/generate-audio.py`. No external recordings, samples or third-party compositions are used; there are no third-party music royalties.

## Legacy 0.2.0 icon sources

The files below are retained for provenance/history; 0.3.0's new 3D scenes and gear icons do not use them.

- **Crossed Swords**, **Wolf Head**, **Ghost** and **Crowned Skull** by **Lorc** (http://lorcblog.blogspot.com), from https://game-icons.net, licensed under **CC BY 3.0**: https://creativecommons.org/licenses/by/3.0/.
- Source: https://github.com/game-icons/icons/blob/82d948812bfe3f269ef8f731dcdb07b08160edc4/lorc/crossed-swords.svg
- Original SVGs are retained in this directory. `src/art.ts` contains the rendering copy with its black background removed and white recolored to gold. Attribution also appears in the game footer.
- Scrolling forest, layout, story and gameplay are original work for this project. No art, names, code or audio from Rogue Legend or World of Warcraft is included.

Add future asset sources and licenses here before including them in builds. Dependencies retain their respective licenses.

Additional sources at the same pinned commit: `lorc/wolf-head.svg`, `lorc/ghost.svg`, `lorc/crowned-skull.svg`. All are by Lorc under CC BY 3.0, with the same rendering modifications.
