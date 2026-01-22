
import React, { useRef, useEffect } from 'react';
import { GameStatus, Difficulty, Fruit, Particle, Blade } from '../types';
import { 
  CANVAS_WIDTH, 
  CANVAS_HEIGHT, 
  FRUIT_TYPES, 
  DIFFICULTY_SETTINGS, 
  GRAVITY, 
  BLADE_SPEED,
  BOMB_COLOR,
  BOMB_RADIUS
} from '../constants';

interface GameCanvasProps {
  status: GameStatus;
  difficulty: Difficulty;
  lives: number;
  isInfiniteLife: boolean;
  onScoreUpdate: (points: number) => void;
  onLifeLost: () => void;
  onGameOver: (score: number) => void;
  keysPressed: Set<string>;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ 
  status, 
  difficulty, 
  lives, 
  isInfiniteLife,
  onScoreUpdate, 
  onLifeLost, 
  onGameOver,
  keysPressed
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);
  
  const fruitsRef = useRef<Fruit[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const bladeRef = useRef<Blade & { trail: {x: number, y: number}[] }>({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT / 2,
    targetX: CANVAS_WIDTH / 2,
    targetY: CANVAS_HEIGHT / 2,
    isSlicing: false,
    sliceCooldown: 0,
    trail: []
  });

  const lastSpawnRef = useRef<number>(0);
  const scoreRef = useRef<number>(0);
  const bgGradientRef = useRef<any | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = (canvas as any).getContext('2d');
    if (!ctx) return;

    // Fixed: Cast canvas and event to any to access standard DOM properties in this environment
    const handleMouseMove = (e: MouseEvent) => {
      const rect = (canvas as any).getBoundingClientRect();
      const scaleX = CANVAS_WIDTH / rect.width;
      const scaleY = CANVAS_HEIGHT / rect.height;
      bladeRef.current.x = ((e as any).clientX - rect.left) * scaleX;
      bladeRef.current.y = ((e as any).clientY - rect.top) * scaleY;
    };

    const handleMouseDown = () => { bladeRef.current.isSlicing = true; };
    const handleMouseUp = () => { bladeRef.current.isSlicing = false; };

    // Fixed: Cast canvas and event to any to access standard DOM properties in this environment
    const handleTouchMove = (e: TouchEvent) => {
      (e as any).preventDefault();
      const rect = (canvas as any).getBoundingClientRect();
      const scaleX = CANVAS_WIDTH / rect.width;
      const scaleY = CANVAS_HEIGHT / rect.height;
      const touch = (e as any).touches[0];
      bladeRef.current.x = (touch.clientX - rect.left) * scaleX;
      bladeRef.current.y = (touch.clientY - rect.top) * scaleY;
      bladeRef.current.isSlicing = true;
    };

    const handleTouchEnd = () => { bladeRef.current.isSlicing = false; };

    // Fixed: Cast canvas and window to any to access addEventListener in this environment
    (canvas as any).addEventListener('mousemove', handleMouseMove);
    (canvas as any).addEventListener('mousedown', handleMouseDown);
    (window as any).addEventListener('mouseup', handleMouseUp);
    (canvas as any).addEventListener('touchstart', handleMouseDown, { passive: false });
    (canvas as any).addEventListener('touchmove', handleTouchMove, { passive: false });
    (canvas as any).addEventListener('touchend', handleTouchEnd);

    if (status === GameStatus.PLAYING) {
      fruitsRef.current = [];
      particlesRef.current = [];
      scoreRef.current = 0;
      bladeRef.current.trail = [];
      lastSpawnRef.current = Date.now();
    }

    const animate = () => {
      if (status !== GameStatus.PLAYING) {
        requestRef.current = requestAnimationFrame(animate);
        return;
      }
      update(ctx);
      render(ctx);
      requestRef.current = requestAnimationFrame(animate);
    };

    const update = (ctx: any) => {
      const settings = DIFFICULTY_SETTINGS[difficulty];

      // Keyboard support fallback
      if (keysPressed.has('ArrowLeft') || keysPressed.has('KeyA')) bladeRef.current.x -= BLADE_SPEED;
      if (keysPressed.has('ArrowRight') || keysPressed.has('KeyD')) bladeRef.current.x += BLADE_SPEED;
      if (keysPressed.has('ArrowUp') || keysPressed.has('KeyW')) bladeRef.current.y -= BLADE_SPEED;
      if (keysPressed.has('ArrowDown') || keysPressed.has('KeyS')) bladeRef.current.y += BLADE_SPEED;
      if (keysPressed.has('Space') || keysPressed.has('Enter')) bladeRef.current.isSlicing = true;

      bladeRef.current.x = Math.max(20, Math.min(CANVAS_WIDTH - 20, bladeRef.current.x));
      bladeRef.current.y = Math.max(20, Math.min(CANVAS_HEIGHT - 20, bladeRef.current.y));

      // Trail update
      bladeRef.current.trail.push({ x: bladeRef.current.x, y: bladeRef.current.y });
      if (bladeRef.current.trail.length > 10) bladeRef.current.trail.shift();

      if (Date.now() - lastSpawnRef.current > settings.spawnRate) {
        spawnFruit();
        lastSpawnRef.current = Date.now();
      }

      fruitsRef.current.forEach((fruit, index) => {
        fruit.x += fruit.vx * settings.speedMultiplier;
        fruit.y += fruit.vy * settings.speedMultiplier;
        fruit.vy += GRAVITY;
        fruit.rotation += fruit.rotationSpeed;

        if (bladeRef.current.isSlicing && !fruit.isSliced) {
          const dx = fruit.x - bladeRef.current.x;
          const dy = fruit.y - bladeRef.current.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < fruit.radius + 30) {
            fruit.isSliced = true;
            if (fruit.isBomb) {
              onLifeLost();
              createExplosion(fruit.x, fruit.y, '#ffffff');
              if (!isInfiniteLife && lives <= 1) onGameOver(scoreRef.current);
            } else {
              scoreRef.current += fruit.points;
              onScoreUpdate(fruit.points);
              const metadata = FRUIT_TYPES.find(f => f.name === fruit.type);
              createSplash(fruit.x, fruit.y, metadata?.secondaryColor || fruit.color);
            }
          }
        }

        if (fruit.y > CANVAS_HEIGHT + 100) {
          if (!fruit.isSliced && !fruit.isBomb) {
            onLifeLost();
            if (!isInfiniteLife && lives <= 1) onGameOver(scoreRef.current);
          }
          fruitsRef.current.splice(index, 1);
        }
      });

      particlesRef.current.forEach((p, index) => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.1; p.life -= 0.02;
        if (p.life <= 0) particlesRef.current.splice(index, 1);
      });
    };

    const drawDetailedFruit = (ctx: any, fruit: Fruit) => {
      const type = fruit.type;
      const r = fruit.radius;
      const metadata = FRUIT_TYPES.find(f => f.name === type);
      const color = metadata?.color || fruit.color;
      const sColor = metadata?.secondaryColor || '#ffffff';

      ctx.save();
      ctx.translate(fruit.x, fruit.y);
      ctx.rotate(fruit.rotation);

      if (fruit.isSliced) {
        // Sliced representation
        ctx.fillStyle = sColor;
        // Top half
        ctx.beginPath();
        ctx.arc(0, -10, r, Math.PI, 0);
        ctx.lineTo(r, -10); ctx.lineTo(-r, -10);
        ctx.fill();
        ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.stroke();
        // Bottom half
        ctx.beginPath();
        ctx.arc(0, 10, r, 0, Math.PI);
        ctx.lineTo(-r, 10); ctx.lineTo(r, 10);
        ctx.fill();
        ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.stroke();
      } else {
        if (fruit.isBomb) {
          ctx.fillStyle = BOMB_COLOR;
          ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#ff4d4d';
          ctx.beginPath(); ctx.arc(r * 0.4, -r * 0.4, 8, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 4;
          ctx.beginPath(); ctx.moveTo(0, -r); ctx.quadraticCurveTo(10, -r - 20, 20, -r - 10); ctx.stroke();
        } else {
          ctx.shadowBlur = 10; ctx.shadowColor = 'rgba(0,0,0,0.3)';
          switch (type) {
            case 'Apple':
              ctx.fillStyle = color;
              ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
              // Stem
              ctx.fillStyle = '#5d4037';
              ctx.fillRect(-2, -r - 5, 4, 10);
              // Leaf
              ctx.fillStyle = '#4caf50';
              ctx.beginPath(); ctx.ellipse(5, -r - 5, 8, 4, Math.PI / 4, 0, Math.PI * 2); ctx.fill();
              break;
            case 'Banana':
              ctx.fillStyle = color;
              ctx.beginPath();
              ctx.arc(0, 0, r * 1.5, Math.PI * 0.1, Math.PI * 0.9);
              ctx.lineWidth = r / 2; ctx.strokeStyle = color; ctx.lineCap = 'round'; ctx.stroke();
              break;
            case 'Orange':
              ctx.fillStyle = color;
              ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
              // Pitting
              ctx.fillStyle = 'rgba(0,0,0,0.1)';
              for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                ctx.beginPath(); ctx.arc(Math.cos(angle) * r * 0.6, Math.sin(angle) * r * 0.6, 2, 0, Math.PI * 2); ctx.fill();
              }
              break;
            case 'Watermelon':
              ctx.fillStyle = color;
              ctx.beginPath(); ctx.ellipse(0, 0, r, r * 0.8, 0, 0, Math.PI * 2); ctx.fill();
              // Stripes
              ctx.strokeStyle = '#1b5e20'; ctx.lineWidth = 5; ctx.setLineDash([10, 5]);
              ctx.beginPath(); ctx.ellipse(0, 0, r * 0.7, r * 0.6, 0, 0, Math.PI * 2); ctx.stroke();
              ctx.setLineDash([]);
              break;
            case 'Pineapple':
              ctx.fillStyle = color;
              ctx.beginPath(); ctx.ellipse(0, 0, r * 0.8, r, 0, 0, Math.PI * 2); ctx.fill();
              // Scales
              ctx.strokeStyle = sColor; ctx.lineWidth = 1;
              for (let i = -2; i <= 2; i++) {
                ctx.beginPath(); ctx.moveTo(-r, i * r * 0.4); ctx.lineTo(r, i * r * 0.4); ctx.stroke();
              }
              // Leaves
              ctx.fillStyle = '#2e7d32';
              ctx.beginPath(); ctx.moveTo(-15, -r); ctx.lineTo(0, -r - 25); ctx.lineTo(15, -r); ctx.fill();
              break;
            default:
              ctx.fillStyle = color;
              ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
          }
        }
      }
      ctx.restore();
    };

    const render = (ctx: any) => {
      if (!bgGradientRef.current) {
        const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
        gradient.addColorStop(0, '#1e293b'); gradient.addColorStop(1, '#0f172a');
        bgGradientRef.current = gradient;
      }
      ctx.fillStyle = bgGradientRef.current!;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      particlesRef.current.forEach(p => {
        ctx.fillStyle = p.color; ctx.globalAlpha = p.life;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      fruitsRef.current.forEach(fruit => drawDetailedFruit(ctx, fruit));

      // Blade Trail
      if (bladeRef.current.trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(bladeRef.current.trail[0].x, bladeRef.current.trail[0].y);
        for (let i = 1; i < bladeRef.current.trail.length; i++) {
          ctx.lineTo(bladeRef.current.trail[i].x, bladeRef.current.trail[i].y);
        }
        ctx.strokeStyle = bladeRef.current.isSlicing ? '#00ffff' : 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.stroke();
      }

      // Blade point
      ctx.save();
      if (bladeRef.current.isSlicing) {
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 8; ctx.lineCap = 'round';
        ctx.shadowBlur = 20; ctx.shadowColor = '#00ffff';
        ctx.beginPath(); ctx.arc(bladeRef.current.x, bladeRef.current.y, 40, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.fillStyle = '#f8fafc'; ctx.strokeStyle = '#0ea5e9'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(bladeRef.current.x, bladeRef.current.y, 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.restore();
    };

    const spawnFruit = () => {
      const isBomb = Math.random() < DIFFICULTY_SETTINGS[difficulty].bombChance;
      const fruitType = FRUIT_TYPES[Math.floor(Math.random() * FRUIT_TYPES.length)];
      const x = 150 + Math.random() * (CANVAS_WIDTH - 300);
      const vx = (Math.random() - 0.5) * 4;
      const vy = -(9 + Math.random() * 3);
      fruitsRef.current.push({
        id: Math.random().toString(), x, y: CANVAS_HEIGHT + 50, vx, vy,
        radius: isBomb ? BOMB_RADIUS : fruitType.radius,
        type: fruitType.name, color: isBomb ? BOMB_COLOR : fruitType.color,
        isSliced: false, isBomb, points: fruitType.points,
        rotation: Math.random() * Math.PI * 2, rotationSpeed: (Math.random() - 0.5) * 0.1
      });
    };

    const createSplash = (x: number, y: number, color: string) => {
      for (let i = 0; i < 20; i++) {
        particlesRef.current.push({
          id: Math.random().toString(), x, y,
          vx: (Math.random() - 0.5) * 14, vy: (Math.random() - 0.5) * 14,
          color, life: 1.0, size: 2 + Math.random() * 6
        });
      }
    };

    const createExplosion = (x: number, y: number, color: string) => {
      for (let i = 0; i < 50; i++) {
        particlesRef.current.push({
          id: Math.random().toString(), x, y,
          vx: (Math.random() - 0.5) * 25, vy: (Math.random() - 0.5) * 25,
          color: i % 2 === 0 ? '#ff0000' : '#ffffff', life: 1.5, size: 4 + Math.random() * 12
        });
      }
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(requestRef.current!);
      // Fixed: Cast canvas and window to any to access removeEventListener in this environment
      (canvas as any).removeEventListener('mousemove', handleMouseMove);
      (canvas as any).removeEventListener('mousedown', handleMouseDown);
      (window as any).removeEventListener('mouseup', handleMouseUp);
      (canvas as any).removeEventListener('touchstart', handleMouseDown);
      (canvas as any).removeEventListener('touchmove', handleTouchMove);
      (canvas as any).removeEventListener('touchend', handleTouchEnd);
    };
  }, [status, difficulty, lives, isInfiniteLife, onScoreUpdate, onLifeLost, onGameOver, keysPressed]);

  return (
    <canvas 
      ref={canvasRef} 
      width={CANVAS_WIDTH} 
      height={CANVAS_HEIGHT} 
      className="w-full h-full object-contain cursor-crosshair"
    />
  );
};

export default GameCanvas;
