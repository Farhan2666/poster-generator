'use client';

import { useEffect, useState } from 'react';

const THEMES = [
  { name: 'coquette', colors: ['#ff6b9d', '#c084fc', '#f472b6'], orbs: ['#ff6b9d', '#c084fc', '#f472b6'] },
  { name: 'aurora', colors: ['#00e5ff', '#7c4dff', '#00bcd4'], orbs: ['#00e5ff', '#7c4dff', '#00bcd4'] },
  { name: 'sunset', colors: ['#ff6b35', '#f7c948', '#e74c3c'], orbs: ['#ff6b35', '#f7c948', '#e74c3c'] },
  { name: 'forest', colors: ['#2dda7a', '#1a8fe3', '#4ade80'], orbs: ['#2dda7a', '#1a8fe3', '#4ade80'] },
  { name: 'lavender', colors: ['#c4b5fd', '#a78bfa', '#8b5cf6'], orbs: ['#c4b5fd', '#a78bfa', '#8b5cf6'] },
  { name: 'peach', colors: ['#fbbf24', '#fb923c', '#f472b6'], orbs: ['#fbbf24', '#fb923c', '#f472b6'] },
  { name: 'ocean', colors: ['#06b6d4', '#3b82f6', '#6366f1'], orbs: ['#06b6d4', '#3b82f6', '#6366f1'] },
  { name: 'berry', colors: ['#ec4899', '#8b5cf6', '#d946ef'], orbs: ['#ec4899', '#8b5cf6', '#d946ef'] },
];

const PARTICLES = ['✦', '♥', '✧', '⋆', '○', '◇', '☆', '♡', '✶', '⊹', '·'];

export default function AnimatedBackground() {
  const [themeIndex, setThemeIndex] = useState(0);
  const currentTheme = THEMES[themeIndex];

  useEffect(() => {
    const interval = setInterval(() => {
      setThemeIndex(prev => (prev + 1) % THEMES.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    char: PARTICLES[i % PARTICLES.length],
    left: `${Math.random() * 100}%`,
    size: `${10 + Math.random() * 12}px`,
    delay: `${Math.random() * 15}s`,
    duration: `${12 + Math.random() * 10}s`,
  }));

  return (
    <>
      {/* Orbs */}
      <div className="animated-bg">
        {currentTheme.orbs.map((color, i) => (
          <div
            key={i}
            className="orb"
            style={{ background: color }}
          />
        ))}
      </div>

      {/* Floating Particles */}
      <div className="particles-container">
        {particles.map(p => (
          <span
            key={p.id}
            className="particle"
            style={{
              left: p.left,
              fontSize: p.size,
              animationDelay: p.delay,
              animationDuration: p.duration,
              color: currentTheme.colors[p.id % currentTheme.colors.length],
            }}
          >
            {p.char}
          </span>
        ))}
      </div>

      {/* Subtle grid overlay */}
      <div
        className="fixed inset-0 z-[-1] opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />
    </>
  );
}
