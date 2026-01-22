
import { Difficulty } from './types';

export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 720;

export const FRUIT_TYPES = [
  { name: 'Apple', color: '#ff4d4d', secondaryColor: '#ff9999', radius: 35, points: 10 },
  { name: 'Banana', color: '#ffe135', secondaryColor: '#fff4a3', radius: 30, points: 15 },
  { name: 'Orange', color: '#ffa500', secondaryColor: '#ffcc66', radius: 35, points: 10 },
  { name: 'Watermelon', color: '#2e8b57', secondaryColor: '#ff4d4d', radius: 55, points: 25 },
  { name: 'Pineapple', color: '#ffd700', secondaryColor: '#8b4513', radius: 45, points: 20 },
];

export const BOMB_COLOR = '#333333';
export const BOMB_RADIUS = 40;

export const DIFFICULTY_SETTINGS = {
  [Difficulty.EASY]: {
    spawnRate: 1500,
    speedMultiplier: 0.7,
    bombChance: 0.1,
  },
  [Difficulty.MEDIUM]: {
    spawnRate: 1100,
    speedMultiplier: 1.0,
    bombChance: 0.2,
  },
  [Difficulty.HARD]: {
    spawnRate: 800,
    speedMultiplier: 1.3,
    bombChance: 0.35,
  },
};

export const GRAVITY = 0.12;
export const BLADE_SPEED = 12;
