/**
 * Game Configuration Data
 * Centralized configuration for game parameters.
 * Edit this file to adjust game behavior.
 */
const CONFIG_DATA = {
  "game": {
    "countdown": 30,
    "ballSpawnInterval": 2.0,
    "width": 420,
    "height": 580
  },
  "paddle": {
    "width": 84,
    "height": 14,
    "color": "#1e88e5",
    "yOffset": 21
  },
  "walls": {
    "elasticity": 0.85,
    "color": "#90caf9",
    "width": 4
  },
  "physics": {
    "gravity": 800
  },
  "ball": {
    "radius": 50,
    "initialSpeed": 450,
    "maxSpeed": 750,
    "color": "#0d47a1",
    "trailAlpha": 0.3
  },
  "ballTypes": [
    {
      "id": "normal",
      "bounceCount": 0,
      "activeDuration": 5.0,
      "spawnRate": 0.5,
      "points": 10,
      "radius": 20,
      "color": "#0d47a1",
      "initialSpeed": 450,
      "spawnPeak": {
        "startRemaining": 25,
        "endRemaining": 15,
        "multiplier": 2
      }
    },
    {
      "id": "fast",
      "bounceCount": 0,
      "activeDuration": 8.0,
      "spawnRate": 0.1,
      "points": 5,
      "radius": 16,
      "color": "#e53935",
      "initialSpeed": 650,
      "spawnPeak": {
        "startRemaining": 20,
        "endRemaining": 10,
        "multiplier": 2
      }
    },
    {
      "id": "slow",
      "bounceCount": 0,
      "activeDuration": 10.0,
      "spawnRate": 0.1,
      "points": 20,
      "radius": 22,
      "color": "#43a047",
      "initialSpeed": 300,
      "spawnPeak": {
        "startRemaining": 12,
        "endRemaining": 3,
        "multiplier": 2
      }
    },
    {
      "id": "duration",
      "bounceCount": 0,
      "activeDuration": 12.0,
      "spawnRate": 0.1,
      "points": 15,
      "radius": 28,
      "color": "#fdd835",
      "initialSpeed": 400,
      "spawnPeak": {
        "startRemaining": 18,
        "endRemaining": 6,
        "multiplier": 2
      }
    }
  ]
};