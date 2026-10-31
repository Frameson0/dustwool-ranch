# Dustwool Ranch

A semi-idle colony builder that runs entirely in the browser.

Play: visit the GitHub Pages URL of this repository, or open `game.html` locally.
Progress is saved in the browser's local storage. The game can be installed as an app (PWA).

## Versions

The version is shown in the in-game menu and set in `src/js/005-config.js` (`VERSION`).

- `1.0.x`: small updates and fixes
- `1.x`: bigger updates

The build writes the version into the service worker cache name, so installed apps pick up new releases.

## Source layout

The game is authored as modules in `src/` and built into one self-contained HTML file.

| Path | What lives there |
| --- | --- |
| `src/head.html`, `src/body.html` | Page head and the HUD/panel markup |
| `src/css/*.css` | Styles, applied in file-name order |
| `src/js/005-config.js` | `VERSION` and `BAL`, the balance knobs (research cost, build cost, sell prices, XP, raid patience …) |
| `src/js/010-constants-defs.js` | Data tables: items, recipes, research, plots, wings, lanes, biomes, traits |
| `src/js/015-balance.js` | Applies `BAL` to the data tables once at start-up; eras |
| `src/js/020…090` | Utilities, state, geometry, pathfinding, pawns, storage, jobs (incl. bills and input racks) |
| `src/js/065-looks-loadouts.js` | Colonist outfits, hats, colours and loadout presets |
| `src/js/100…150` | Animals, events, trade, building, relocation, new game and saves |
| `src/js/170-defense-raids.js` | Raids, raid tactics, mechanoids, guard placement, combat, main tick |
| `src/js/175-fire.js` | Fire: spreading, damage, firefighting, lightning |
| `src/js/180…220` | Drawing: sprites, art helpers, terrain, plot layer, render loop, icons |
| `src/js/230-ui.js`, `240-actions.js` | Panels, tabs and every button action |
| `src/js/250…300` | Map input, bosses and legacy, expeditions, storyteller events, audio, main loop |

JavaScript files are concatenated in file-name order into a single script, so new modules slot in by number.

## Build

```
python3 tools/build.py --check
```

This writes `game.html` (standalone) and `index.html` (with PWA manifest and service worker), and with `--check` runs a syntax check through Node.
