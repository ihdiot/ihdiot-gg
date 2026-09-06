(() => {
  const stage = document.getElementById("stage");
  const track = document.getElementById("hub");
  const word = document.getElementById("wordmark-block");
  const pill = document.getElementById("doors");
  const ghost = document.querySelector(".nav-ghost");
  const subtitle = document.querySelector(".subtitle");
  const racing = document.querySelector(".racing");
  const hint = document.getElementById("scroll-hint");
  const neon = document.querySelector(".layer-neon");
  const wall = document.querySelector(".layer-wall");
  const desk = document.querySelector(".layer-desk");
  const fg = document.querySelector(".layer-fg");
  const doors = [...document.querySelectorAll(".door")];
  const wallPlates = [...document.querySelectorAll(".layer-wall .plate")];
  const deskPlates = [...document.querySelectorAll(".layer-desk .plate")];
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (t) => t * t * (3 - 2 * t);
  const span = (p, a, b) => smooth(clamp((p - a) / (b - a), 0, 1));

  const keyframes = [
    { p: 0.0, x: 50, y: 36, s: 1.0, sticky: 0 },
    { p: 0.22, x: 50, y: 33, s: 0.96, sticky: 0 },
    { p: 0.48, x: 11, y: 7.2, s: 0.38, sticky: 1 },
    { p: 0.78, x: 50, y: 15.5, s: 0.7, sticky: 0 },
    { p: 1.0, x: 50, y: 15.2, s: 0.72, sticky: 0 },
  ];

  const mixKeys = (p) => {
    let i = 0;
    while (i < keyframes.length - 2 && p > keyframes[i + 1].p) i += 1;
    const a = keyframes[i];
    const b = keyframes[i + 1];
    const t = span(p, a.p, b.p);
    return {
      x: lerp(a.x, b.x, t),
      y: lerp(a.y, b.y, t),
      s: lerp(a.s, b.s, t),
      sticky: lerp(a.sticky, b.sticky, t),
    };
  };

  const setPlates = (nodes, weights) => {
    const total = weights.reduce((s, v) => s + v, 0) || 1;
    nodes.forEach((node, i) => {
      const o = weights[i] / total;
      node.style.opacity = o.toFixed(4);
      node.classList.toggle("is-on", o > 0.04);
    });
  };

  const apply = (p) => {
    const k = mixKeys(p);
    const origin = k.sticky > 0.5 ? "left center" : "center center";
    const tx = k.sticky > 0.35 ? 0 : -50;
    word.style.transformOrigin = origin;
    word.style.left = `${k.x}%`;
    word.style.top = `${k.y}%`;
    word.style.transform = `translate(${tx}%, -50%) scale(${k.s})`;
    word.style.textAlign = k.sticky > 0.45 ? "left" : "center";
    const mark = word.querySelector(".wordmark");
    if (mark) mark.style.textIndent = k.sticky > 0.45 ? "0" : "";

    const sub = span(p, 0.14, 0.26) * (1 - span(p, 0.4, 0.52));
    const race = span(p, 0.2, 0.3) * (1 - span(p, 0.38, 0.5));
    subtitle.style.opacity = sub.toFixed(3);
    racing.style.opacity = race.toFixed(3);

    const ghostOut = 1 - span(p, 0.66, 0.8);
    ghost.style.opacity = ghostOut.toFixed(3);
    ghost.style.pointerEvents = ghostOut > 0.2 ? "auto" : "none";

    const pillIn = span(p, 0.7, 0.84);
    pill.style.opacity = pillIn.toFixed(3);
    pill.style.transform = `translateX(-50%) translateY(${lerp(14, 0, pillIn)}px)`;
    pill.style.pointerEvents = pillIn > 0.35 ? "auto" : "none";

    doors.forEach((door, i) => {
      const lit = span(p, 0.78 + i * 0.035, 0.86 + i * 0.03);
      door.classList.toggle("is-lit", lit > 0.72);
      door.style.opacity = lerp(0.28, 1, Math.max(pillIn * 0.45, lit)).toFixed(3);
    });

    const w0 = 1 - span(p, 0.1, 0.28);
    const w1 = span(p, 0.12, 0.28) * (1 - span(p, 0.4, 0.56));
    const w2 = span(p, 0.42, 0.56) * (1 - span(p, 0.66, 0.82));
    const w3 = span(p, 0.68, 0.86);
    const weights = [w0, w1, w2, w3];
    setPlates(wallPlates, weights);
    setPlates(deskPlates, weights);

    wall.style.transform = `translate3d(0, ${p * -28}px, 0) scale(${1.02 + p * 0.03})`;
    neon.style.transform = `translate3d(${Math.sin(p * 2.2) * 10}px, ${p * -62}px, 0)`;
    desk.style.transform = `translate3d(0, ${p * -78}px, 0) scale(${1.02 + p * 0.08})`;
    fg.style.transform = `translate3d(0, ${p * 120}px, 0) scale(${1.02 + p * 0.12})`;

    if (hint) hint.style.opacity = (1 - span(p, 0.02, 0.12)).toFixed(3);
    stage.dataset.frame = w3 > 0.55 ? "s4" : w2 > 0.45 ? "s3" : w1 > 0.45 ? "s2" : "s1";
  };

  const progress = () => {
    const max = Math.max(1, track.offsetHeight - innerHeight);
    return clamp(scrollY / max, 0, 1);
  };

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      apply(reduced ? 1 : progress());
      ticking = false;
    });
  };

  if (reduced) {
    apply(1);
  } else {
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    apply(progress());
  }
})();
