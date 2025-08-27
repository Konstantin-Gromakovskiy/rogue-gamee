# Roguelike

## Description

A lightweight 2D turn-based roguelike written in vanilla JavaScript, rendered directly in the DOM.
The game procedurally generates a small dungeon made of rooms and corridors, places the player,
enemies, and items (health potions and a sword), and resolves actions in turns: first the player
acts, then enemies respond. Rendering follows the assignment requirement.

The focus is on core roguelike mechanics:
- Procedural map with rooms connected by corridors
- Grid-based movement and adjacency-based combat
- Simple greedy enemy AI that approaches the player
- Minimal UI with health bars and item icons

## Technologies

- **HTML**, **CSS** (no frameworks)
- **JavaScript (Vanilla)**

## Installation and Running

1. Clone the repository:
   ```bash
   git clone https://github.com/konstantin/rogalic.git
   cd rogalic
   ```

2. Run (choose any option):
   - Open `index.html` in a modern browser (Chrome/Firefox/Edge/Safari)

## Project Structure

```
rogalic/
├── assets/
│   ├── icons/
│   └── images/              # tile sprites (tile-*.png)
├── index.html               # root page, .field container
├── style.css                # styles for the field, tiles, and health bars
├── utils.js                 # utilities (randomInt, etc.)
├── render.js                # rendering: clear .field and add .tile + .health
├── game.js                  # game logic and input handling
└── README.md
```

## Features (Game Mechanics)

- 40×24 field. Generates 5–8 rooms (sizes 3–8) connected by corridors
- Turn order: player moves with WASD, then enemies move automatically
- Enemy AI: greedy approach along the axis with the largest distance; attacks on contact/adjacency
- Attack: Space hits all adjacent enemies; enemies retaliate with total damage in the same turn
- Rendering per assignment:

## Gameplay

- Explore the generated dungeon rooms and corridors.
- Collect health potions to restore HP and a sword to increase attack.
- Move to approach or kite enemies; attack with Space to damage adjacent foes.
- Enemies greedily move toward you and strike when adjacent or stepping onto your tile.
- Win by defeating all enemies; lose if your HP drops to zero.

## Controls

- Movement: `W / A / S / D`
- Attack: `Space`

Enjoy the game!
