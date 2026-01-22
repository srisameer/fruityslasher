
export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

export enum GameStatus {
  IDLE = 'IDLE',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAMEOVER = 'GAMEOVER'
}

export interface Fruit {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  type: string;
  color: string;
  isSliced: boolean;
  isBomb: boolean;
  points: number;
  rotation: number;
  rotationSpeed: number;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
  size: number;
}

export interface Blade {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  isSlicing: boolean;
  sliceCooldown: number;
}
