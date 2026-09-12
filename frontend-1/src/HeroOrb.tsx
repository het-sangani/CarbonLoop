// Hero Orb — large 3D-inspired sphere for the landing hero
// Semi-metallic, muted green/teal tint, soft upper-left lighting, no glow.

export default function HeroOrb({ size = 320 }: { size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.30; // sphere radius — 60% of half-width, leaving 40% clearance each side

  // Orbit ring radii — tilted ellipse
  const orbRx = r * 1.55;
  const orbRy = r * 0.42;

  // Particle positions (polar, relative to orbit, slightly randomised)
  const particles: { angle: number; dist: number; opacity: number; radius: number; delay: number }[] = [
    { angle: 28,  dist: 1.02, opacity: 0.18, radius: 2.2, delay: 0    },
    { angle: 65,  dist: 0.98, opacity: 0.13, radius: 1.6, delay: 1.2  },
    { angle: 112, dist: 1.04, opacity: 0.20, radius: 2.5, delay: 0.7  },
    { angle: 155, dist: 0.96, opacity: 0.12, radius: 1.4, delay: 2.1  },
    { angle: 200, dist: 1.03, opacity: 0.16, radius: 1.9, delay: 0.4  },
    { angle: 248, dist: 0.99, opacity: 0.10, radius: 1.3, delay: 1.8  },
    { angle: 305, dist: 1.05, opacity: 0.14, radius: 2.0, delay: 0.9  },
  ];

  // Convert angle on ellipse to x/y coords
  function ellipsePoint(angleDeg: number, scaleR: number) {
    const a = (angleDeg * Math.PI) / 180;
    return {
      x: cx + orbRx * scaleR * Math.cos(a),
      y: cy + orbRy * scaleR * Math.sin(a),
    };
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-label="CarbonLoop orb"
      role="img"
      style={{ overflow: "visible" }}
    >
      <defs>
        {/* Main sphere fill — upper-left light source */}
        <radialGradient id="hero-sphere-base" cx="34%" cy="30%" r="65%">
          <stop offset="0%"   stopColor="#3DB89E" stopOpacity="0.82" />
          <stop offset="38%"  stopColor="#2A8A78" stopOpacity="0.70" />
          <stop offset="72%"  stopColor="#1A6158" stopOpacity="0.60" />
          <stop offset="100%" stopColor="#0F3D2E" stopOpacity="0.52" />
        </radialGradient>

        {/* Metallic sheen layer — offset from main gradient */}
        <radialGradient id="hero-sphere-sheen" cx="28%" cy="25%" r="50%">
          <stop offset="0%"   stopColor="rgba(220,240,235,0.28)" />
          <stop offset="45%"  stopColor="rgba(180,220,210,0.08)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>

        {/* Subtle secondary bounce light — lower right */}
        <radialGradient id="hero-sphere-bounce" cx="78%" cy="75%" r="45%">
          <stop offset="0%"   stopColor="rgba(46,158,138,0.14)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>

        {/* Rim darkening — gives depth */}
        <radialGradient id="hero-sphere-rim" cx="50%" cy="50%" r="50%">
          <stop offset="62%"  stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(10,30,22,0.38)" />
        </radialGradient>

        {/* Very small specular highlight — sharp, offset upper-left */}
        <radialGradient id="hero-sphere-specular" cx="36%" cy="29%" r="22%">
          <stop offset="0%"   stopColor="rgba(240,255,250,0.55)" />
          <stop offset="60%"  stopColor="rgba(240,255,250,0.10)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>

        {/* Soft shadow beneath sphere */}
        <radialGradient id="hero-shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="rgba(15,61,46,0.12)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>

        {/* Orbit ring fade — dashes fade toward bottom */}
        <linearGradient id="orbit-fade-v" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#2E9E8A" stopOpacity="0.50" />
          <stop offset="50%"  stopColor="#2E9E8A" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#2E9E8A" stopOpacity="0.12" />
        </linearGradient>
      </defs>

      {/* ── Grounding shadow (very subtle ellipse below sphere) */}
      <ellipse
        cx={cx}
        cy={cy + r * 1.05}
        rx={r * 0.85}
        ry={r * 0.16}
        fill="url(#hero-shadow)"
        opacity="0.6"
      />

      {/* ── Orbit ring — back half (behind sphere, more faded) */}
      <ellipse
        cx={cx}
        cy={cy}
        rx={orbRx}
        ry={orbRy}
        fill="none"
        stroke="url(#orbit-fade-v)"
        strokeWidth="0.8"
        strokeDasharray="5 3.5"
        style={{
          animation: "orb-spin 22s linear infinite",
          transformOrigin: `${cx}px ${cy}px`,
        }}
      />

      {/* ── Sphere layers (back to front) */}
      {/* Base color */}
      <circle cx={cx} cy={cy} r={r} fill="url(#hero-sphere-base)" />
      {/* Metallic sheen */}
      <circle cx={cx} cy={cy} r={r} fill="url(#hero-sphere-sheen)" />
      {/* Bounce light */}
      <circle cx={cx} cy={cy} r={r} fill="url(#hero-sphere-bounce)" />
      {/* Rim darkening */}
      <circle cx={cx} cy={cy} r={r} fill="url(#hero-sphere-rim)" />
      {/* Specular highlight */}
      <circle cx={cx} cy={cy} r={r} fill="url(#hero-sphere-specular)" />

      {/* Very thin internal equator line — adds solidity */}
      <ellipse
        cx={cx}
        cy={cy}
        rx={r * 0.96}
        ry={r * 0.26}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="0.7"
      />

      {/* ── Orbit ring — front half (clip to lower half of canvas so it appears in front) */}
      <ellipse
        cx={cx}
        cy={cy}
        rx={orbRx}
        ry={orbRy}
        fill="none"
        stroke="#2E9E8A"
        strokeWidth="0.85"
        strokeDasharray="5 3.5"
        strokeDashoffset="8.5"
        strokeOpacity="0.55"
        clipPath={`inset(${cy}px 0 0 0)`}
        style={{
          animation: "orb-spin 22s linear infinite",
          transformOrigin: `${cx}px ${cy}px`,
        }}
      />

      {/* ── Drifting CO₂ particles */}
      {particles.map((p, i) => {
        const pt = ellipsePoint(p.angle, p.dist);
        return (
          <circle
            key={i}
            cx={pt.x}
            cy={pt.y}
            r={p.radius}
            fill="#2E9E8A"
            opacity={p.opacity}
            style={{
              animation: `particle-drift-${i % 3} ${5 + i * 0.8}s ease-in-out infinite`,
              animationDelay: `${p.delay}s`,
              transformOrigin: `${pt.x}px ${pt.y}px`,
            }}
          />
        );
      })}
    </svg>
  );
}
