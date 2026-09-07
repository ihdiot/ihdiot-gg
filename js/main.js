/* IHDIOT — FIXED1 niches. Short pin (~220vh). Scroll A/B lights, Scroll C dock. */
(() => {
  const html = document.documentElement;
  const hero = document.querySelector(".hero");
  const stage = document.querySelector(".hero-stage");
  const rail = document.querySelector("[data-rail]");
  const doors = [...document.querySelectorAll(".doors .door")];
  const niches = [...document.querySelectorAll(".niche")];
  const reduced = html.classList.contains("static");
  const motionOK = html.classList.contains("motion") && window.gsap && window.ScrollTrigger;

  const NICHE_LEFT = [0.255, 0.4, 0.545, 0.672];
  const NICHE_W = 0.078;
  const NICHE_TOP = 0.102;
  const NICHE_H = 0.255;
  const IMG_W = 1536;
  const IMG_H = 1024;
  const POS_X = 0.5;
  const POS_Y = 0.32;

  const year = document.querySelector("#year");
  if (year) year.textContent = new Date().getFullYear();

  document.querySelectorAll("[data-waitlist]").forEach((button) => {
    button.addEventListener("click", () => {
      const feedback = button.parentElement.querySelector(".feedback");
      if (feedback) feedback.textContent = "Noted. The waitlist goes live with the first build.";
      button.textContent = "You are on the radar →";
      button.disabled = true;
    });
  });

  function coverBox(cw, ch) {
    const scale = Math.max(cw / IMG_W, ch / IMG_H);
    const w = IMG_W * scale;
    const h = IMG_H * scale;
    return { x: (cw - w) * POS_X, y: (ch - h) * POS_Y, w, h, scale };
  }

  function sceneBox() {
    const host = stage || hero;
    const r = host.getBoundingClientRect();
    return coverBox(r.width, r.height);
  }

  function applySceneVars() {
    const box = sceneBox();
    hero.style.setProperty("--scene-x", `${box.x}px`);
    hero.style.setProperty("--scene-y", `${box.y}px`);
    hero.style.setProperty("--scene-w", `${box.w}px`);
    hero.style.setProperty("--scene-h", `${box.h}px`);
    return box;
  }

  function nichePoint(i, box) {
    return {
      x: box.x + box.w * (NICHE_LEFT[i] + NICHE_W / 2),
      y: box.y + box.h * (NICHE_TOP + NICHE_H - 0.018),
    };
  }

  function railPoint(i) {
    const narrow = innerWidth < 720;
    const pad = narrow ? 10 : 20;
    const groupW = narrow ? innerWidth - pad * 2 : Math.min(innerWidth * 0.58, 560);
    const left = narrow ? pad : innerWidth - pad - groupW;
    return {
      x: left + (groupW * (i + 0.5)) / 4,
      y: narrow ? 16 : 18,
    };
  }

  function placeDoorsAtNiches() {
    const box = applySceneVars();
    doors.forEach((door, i) => {
      const p = nichePoint(i, box);
      door.style.left = `${p.x}px`;
      door.style.top = `${p.y}px`;
    });
    return box;
  }

  if (!motionOK) {
    html.classList.remove("motion");
    html.classList.add("static");
    placeDoorsAtNiches();
    if (rail) rail.classList.add("is-on");
    addEventListener("resize", placeDoorsAtNiches);
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  const beams = gsap.utils.toArray(".beam");
  const pools = gsap.utils.toArray(".pool");
  const cue = hero.querySelector(".scroll-cue");
  const wordmark = hero.querySelector(".wordmark");
  const veil = hero.querySelector(".veil");
  const layers = {
    wall: hero.querySelector("[data-depth='wall']"),
    neon: hero.querySelector("[data-depth='neon']"),
    desk: hero.querySelector("[data-depth='desk']"),
    mid: hero.querySelector("[data-depth='mid']"),
    fg: hero.querySelector("[data-depth='fg']"),
  };

  gsap.set(beams, { opacity: 0 });
  gsap.set(pools, { opacity: 0 });
  gsap.set(doors, { "--lit": 0 });
  gsap.set(wordmark, { opacity: 0.08 });
  gsap.set(veil, { opacity: 1 });

  const doorLayer = hero.querySelector(".doors");
  // Pin applies a transform, which would trap position:fixed. Live on <body> instead.
  document.body.appendChild(doorLayer);
  doorLayer.classList.add("is-floating");

  placeDoorsAtNiches();

  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: hero,
      start: "top top",
      end: "+=120%",
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      scrub: 0.45,
      invalidateOnRefresh: true,
      onUpdate(self) {
        const docked = self.progress >= 0.93;
        document.body.classList.toggle("doors-docked", docked);
        if (rail) rail.classList.toggle("is-on", docked || document.body.classList.contains("past-hero"));
      },
    },
  });

  function lightPair(index, at) {
    tl.to(beams[index], { opacity: 1, duration: 18, ease: "power1.out" }, at);
    tl.to(pools[index], { opacity: 1, duration: 18, ease: "power1.out" }, at);
    tl.to(doors[index], { "--lit": 1, duration: 18, ease: "power1.out" }, at);
  }

  // Scroll A 0–36: Talky then YouTube. Halfway A (18) = Talky only.
  lightPair(0, 0);
  lightPair(1, 18);
  tl.to(wordmark, { opacity: 0.55, duration: 36 }, 0);
  tl.to(veil, { opacity: 0.62, duration: 36 }, 0);
  tl.to(cue, { autoAlpha: 0, duration: 10 }, 2);

  // Scroll B 36–72: Discord then Coach.
  lightPair(2, 36);
  lightPair(3, 54);
  tl.to(wordmark, { opacity: 1, duration: 36 }, 36);
  tl.to(veil, { opacity: 0.18, duration: 36 }, 36);
  tl.to(".layer-neon", { opacity: 0.7, duration: 36 }, 36);

  // Scroll C 72–100: restrained depth + dock words to the top rail.
  tl.to(layers.wall, { y: -14, scale: 1.02, duration: 28, ease: "power1.inOut" }, 72);
  tl.to(layers.neon, { y: -22, duration: 28, ease: "power1.inOut" }, 72);
  tl.to(layers.desk, { y: -28, duration: 28, ease: "power1.inOut" }, 72);
  tl.to(layers.mid, { y: -34, duration: 28, ease: "power1.inOut" }, 72);
  tl.to(layers.fg, { y: -48, duration: 28, ease: "power1.inOut" }, 72);
  tl.to(wordmark, { y: -18, duration: 28, ease: "power1.inOut" }, 72);
  tl.to(".niches", { y: -16, duration: 28, ease: "power1.inOut" }, 72);

  doors.forEach((door, i) => {
    tl.to(
      door,
      {
        left: () => railPoint(i).x,
        top: () => railPoint(i).y,
        duration: 28,
        ease: "power2.inOut",
      },
      72
    );
  });

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      ([entry]) => {
        const past = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        document.body.classList.toggle("past-hero", past);
        if (rail) rail.classList.toggle("is-on", past || document.body.classList.contains("doors-docked"));
      },
      { threshold: 0, rootMargin: "-1px 0px 0px 0px" }
    );
    io.observe(hero);
  }

  let resizeTimer;
  addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      applySceneVars();
      ScrollTrigger.refresh();
    }, 80);
  });

  ScrollTrigger.addEventListener("refreshInit", () => {
    const box = applySceneVars();
    const st = tl.scrollTrigger;
    const progress = st ? st.progress : 0;
    doors.forEach((door, i) => {
      if (progress < 0.72) {
        const p = nichePoint(i, box);
        gsap.set(door, { left: p.x, top: p.y });
      } else {
        const p = railPoint(i);
        gsap.set(door, { left: p.x, top: p.y });
      }
    });
  });

  const plate = hero.querySelector(".layer-wall img");
  const reveal = () => gsap.fromTo(".room", { opacity: 0 }, { opacity: 1, duration: 0.55, ease: "power2.out" });
  if (plate && plate.complete) reveal();
  else if (plate) plate.addEventListener("load", reveal, { once: true });

  function goToProgress(p) {
    const st = tl.scrollTrigger;
    if (!st) return false;
    ScrollTrigger.refresh();
    const span = st.end - st.start;
    if (!(span > 40)) return false;
    const y = st.start + span * Math.max(0, Math.min(1, p));
    window.scrollTo(0, y);
    st.scroll(y);
    ScrollTrigger.update();
    html.dataset.progress = String(Math.round(st.progress * 100));
    return true;
  }

  window.__heroGo = goToProgress;
  window.__heroProgress = () => (tl.scrollTrigger ? tl.scrollTrigger.progress : 0);

  const beats = { open: 0, "a-mid": 0.18, "a-end": 0.36, "b-end": 0.72, "c-dock": 0.97 };
  const wanted = new URLSearchParams(location.search).get("beat");
  if (wanted in beats) {
    const start = () => {
      let n = 0;
      const tick = () => {
        if (goToProgress(beats[wanted]) || n++ > 40) {
          html.dataset.beat = wanted;
          return;
        }
        setTimeout(tick, 50);
      };
      tick();
    };
    if (document.readyState === "complete") setTimeout(start, 80);
    else addEventListener("load", () => setTimeout(start, 80), { once: true });
  }
})();
