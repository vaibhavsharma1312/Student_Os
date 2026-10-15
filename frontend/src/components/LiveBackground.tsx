import { useEffect, useRef } from 'react';

type Node3 = { x: number; y: number; z: number; s: number };
type Proj = { px: number; py: number; z: number; k: number };

/** Animated 3D network globe drawn on a canvas. Decorative only. */
export function LiveBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, raf = 0, mx = 0, my = 0, tx = 0, ty = 0;
    // Globe centre in canvas pixels; locked to the sign-in card's real centre on wide screens
    let gcx = 0, gcy = 0;

    // Points spread evenly over a sphere (Fibonacci lattice)
    const N = 150;
    const nodes: Node3[] = [];
    for (let i = 0; i < N; i++) {
      const k = i + 0.5, phi = Math.acos(1 - (2 * k) / N), th = Math.PI * (1 + Math.sqrt(5)) * k;
      nodes.push({ x: Math.cos(th) * Math.sin(phi), y: Math.sin(th) * Math.sin(phi), z: Math.cos(phi), s: 0.8 + Math.random() * 1.6 });
    }
    // Connect close neighbours
    const edges: [number, number][] = [];
    const adj: number[][] = Array.from({ length: N }, () => []);
    for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
      const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y, dz = nodes[i].z - nodes[j].z;
      if (dx * dx + dy * dy + dz * dz < 0.4 * 0.4) { edges.push([i, j]); adj[i].push(j); adj[j].push(i); }
    }
    // Pulses travelling along the network
    const pulses = Array.from({ length: 9 }, () => {
      const from = Math.floor(Math.random() * N);
      return { from, to: adj[from][0] ?? from, t: Math.random(), v: 0.006 + Math.random() * 0.008 };
    });
    // Background stars
    const stars = Array.from({ length: 90 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.2 + 0.2, v: 0.00002 + Math.random() * 0.00006, p: Math.random() * 6.28 }));
    const proj: Proj[] = nodes.map(() => ({ px: 0, py: 0, z: 0, k: 1 }));

    function resize() {
      if (!canvas || !ctx) return;
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr); canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      locate();
    }
    function locate() {
      if (!canvas) return;
      const card = document.querySelector('.auth-card');
      const c = canvas.getBoundingClientRect();
      if (w > 980 && card) {
        const r = card.getBoundingClientRect();
        gcx = r.left - c.left + r.width / 2; gcy = r.top - c.top + r.height / 2;
      } else { gcx = w / 2; gcy = h / 2; }
    }
    function onMove(e: PointerEvent) { tx = e.clientX / Math.max(w, 1) - 0.5; ty = e.clientY / Math.max(h, 1) - 0.5; }

    function frame(time: number) {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      mx += (tx - mx) * 0.05; my += (ty - my) * 0.05;
      const wide = w > 980;
      const cx = gcx, cy = gcy, R = Math.min(w, h) * (wide ? 0.37 : 0.42);
      const ay = time * 0.00014 + mx * 0.7, ax = -0.35 + my * 0.35;
      const cY = Math.cos(ay), sY = Math.sin(ay), cX = Math.cos(ax), sX = Math.sin(ax);

      // soft breathing glow behind the globe + expanding radar rings
      const breathe = 0.5 + 0.5 * Math.sin(time * 0.0013);
      const glow = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R * (1.35 + 0.08 * breathe));
      glow.addColorStop(0, `rgba(68,227,189,${0.10 + 0.07 * breathe})`);
      glow.addColorStop(1, 'rgba(68,227,189,0)');
      ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(cx, cy, R * 1.5, 0, 6.283); ctx.fill();
      for (let i = 0; i < 2; i++) {
        const ph = ((time * 0.00022) + i * 0.5) % 1;
        ctx.strokeStyle = `rgba(68,227,189,${0.22 * (1 - ph)})`; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(cx, cy, R * (1 + ph * 0.75), 0, 6.283); ctx.stroke();
      }
      ctx.lineWidth = 1;
      // stars
      for (const s of stars) {
        s.y -= s.v * 16; if (s.y < 0) s.y = 1;
        const a = 0.25 + 0.35 * Math.sin(time * 0.001 + s.p);
        ctx.fillStyle = `rgba(190,255,240,${Math.max(a, 0.05)})`;
        ctx.beginPath(); ctx.arc(s.x * w, s.y * h, s.r, 0, 6.283); ctx.fill();
      }
      // project nodes
      for (let i = 0; i < N; i++) {
        const n = nodes[i];
        const x1 = n.x * cY + n.z * sY, z1 = -n.x * sY + n.z * cY;
        const y2 = n.y * cX - z1 * sX, z2 = n.y * sX + z1 * cX;
        const k = 1 / (1 - z2 * 0.35);
        const p = proj[i]; p.px = cx + x1 * R * k; p.py = cy + y2 * R * k; p.z = z2; p.k = k;
      }
      // orbit rings
      ctx.lineWidth = 1;
      for (let r = 0; r < 2; r++) {
        const rx = R * (1.3 + r * 0.28), ry = rx * 0.3, tilt = (r ? -0.5 : 0.35) + mx * 0.2;
        ctx.strokeStyle = `rgba(68,227,189,${r ? 0.1 : 0.16})`;
        ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, tilt, 0, 6.283); ctx.stroke();
        const a = time * (r ? -0.0003 : 0.0004), ox = Math.cos(a) * rx, oy = Math.sin(a) * ry;
        const dx = cx + ox * Math.cos(tilt) - oy * Math.sin(tilt), dy = cy + ox * Math.sin(tilt) + oy * Math.cos(tilt);
        ctx.fillStyle = '#dcf47b'; ctx.beginPath(); ctx.arc(dx, dy, 3, 0, 6.283); ctx.fill();
        ctx.fillStyle = 'rgba(220,244,123,.18)'; ctx.beginPath(); ctx.arc(dx, dy, 9, 0, 6.283); ctx.fill();
      }
      // edges
      for (const [i, j] of edges) {
        const a = proj[i], b = proj[j], d = (a.z + b.z) / 2;
        ctx.strokeStyle = `rgba(68,227,189,${0.04 + 0.22 * (d + 1) / 2})`;
        ctx.beginPath(); ctx.moveTo(a.px, a.py); ctx.lineTo(b.px, b.py); ctx.stroke();
      }
      // nodes
      for (let i = 0; i < N; i++) {
        const p = proj[i], depth = (p.z + 1) / 2, r = nodes[i].s * p.k;
        ctx.fillStyle = `rgba(68,227,189,${0.1 + 0.18 * depth})`; ctx.beginPath(); ctx.arc(p.px, p.py, r * 3, 0, 6.283); ctx.fill();
        ctx.fillStyle = `rgba(150,255,225,${0.35 + 0.65 * depth})`; ctx.beginPath(); ctx.arc(p.px, p.py, r, 0, 6.283); ctx.fill();
      }
      // pulses
      for (const q of pulses) {
        q.t += q.v;
        if (q.t >= 1) {
          q.t = 0; const prev = q.from; q.from = q.to; const nb = adj[q.from].filter(n => n !== prev);
          const pool = nb.length ? nb : adj[q.from]; q.to = pool[Math.floor(Math.random() * pool.length)] ?? q.from;
        }
        const a = proj[q.from], b = proj[q.to], x = a.px + (b.px - a.px) * q.t, y = a.py + (b.py - a.py) * q.t, al = 0.4 + 0.6 * ((a.z + 1) / 2);
        ctx.fillStyle = `rgba(220,244,123,${0.25 * al})`; ctx.beginPath(); ctx.arc(x, y, 8, 0, 6.283); ctx.fill();
        ctx.fillStyle = `rgba(235,255,170,${al})`; ctx.beginPath(); ctx.arc(x, y, 2.4, 0, 6.283); ctx.fill();
      }
      if (!reduceMotion) raf = requestAnimationFrame(frame);
    }

    resize(); window.addEventListener('resize', resize);
    const card = document.querySelector('.auth-card');
    const ro = typeof ResizeObserver !== 'undefined' && card ? new ResizeObserver(locate) : null;
    if (ro && card) ro.observe(card);
    const settle = window.setTimeout(locate, 300); window.addEventListener('pointermove', onMove);
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); ro?.disconnect(); window.clearTimeout(settle); window.removeEventListener('resize', resize); window.removeEventListener('pointermove', onMove); };
  }, []);

  return <canvas ref={ref} className="live-bg" aria-hidden="true" />;
}
