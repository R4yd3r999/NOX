import { useEffect, useRef } from "react";

const PARTICLE_COUNT_DESKTOP = 70;
const PARTICLE_COUNT_MOBILE = 34;
const PARTICLE_COUNT_NATIVE = 16;
const LINK_DIST = 130;
const FRAME_INTERVAL = 1000 / 30; // cap at ~30fps, plenty smooth for slow drifting dots

export default function ParticleBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const isNative = window.Capacitor?.isNativePlatform?.() === true;

    let width, height, dpr;
    let particles = [];
    let raf;
    let running = true;
    let lastFrame = 0;

    function resize() {
      // On the native Android WebView a full-resolution (up to 2x) canvas
      // redrawn every frame is expensive; 1x is visually fine for this
      // subtle background effect and cuts fill-rate ~4x on high-density screens.
      dpr = isNative ? 1 : Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = isNative
        ? PARTICLE_COUNT_NATIVE
        : width < 720
          ? PARTICLE_COUNT_MOBILE
          : PARTICLE_COUNT_DESKTOP;
      particles = Array.from({ length: count }, () => spawn());
    }

    function spawn() {
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: Math.random() * 1.6 + 0.6,
        alpha: Math.random() * 0.5 + 0.25,
      };
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DIST) {
            ctx.strokeStyle = `rgba(216, 30, 44, ${
              0.14 * (1 - dist / LINK_DIST)
            })`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Note: no ctx.shadowBlur/shadowColor here on purpose — a soft
      // shadow recomputed per particle, per frame, is by far the most
      // expensive thing this loop can do on Android's canvas renderer.
      // The glow is instead baked in with a two-pass fill (soft outer +
      // solid core), which costs almost nothing in comparison.
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 45, 58, ${p.alpha * 0.25})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 45, 58, ${p.alpha})`;
        ctx.fill();
      }
    }

    function step(timestamp = 0) {
      if (!running) return;
      raf = requestAnimationFrame(step);

      // Frame-rate cap: skip work instead of redrawing at the display's
      // full refresh rate. This is the second big win on Android — the
      // effect is barely-moving dots, it doesn't need 60fps.
      if (timestamp - lastFrame < FRAME_INTERVAL) return;
      lastFrame = timestamp;

      draw();
    }

    resize();
    window.addEventListener("resize", resize);

    if (!reduceMotion) {
      step();
    } else {
      // Dibuja un frame estático, sin animar
      running = false;
      draw();
    }

    function handleVisibility() {
      const shouldRun = document.visibilityState === "visible" && !reduceMotion;
      if (shouldRun && !running) {
        running = true;
        step();
      } else if (!shouldRun) {
        running = false;
      }
    }
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} className="particle-canvas" aria-hidden="true" />;
}
