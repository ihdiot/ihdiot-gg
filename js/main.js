/* IHDIOT — FIXED1 photo + real CSS niche lights. Pin +=100% (~200vh). */
(() => {
  const html = document.documentElement;
  const hero = document.querySelector(".hero");
  const stage = document.querySelector(".hero-stage");
  const rail = document.querySelector("[data-rail]");
  const doors = [...document.querySelectorAll(".doors .door")];
  const niches = [...document.querySelectorAll(".niche")];
  const reduced = html.classList.contains("static");
  const motionOK = html.classList.contains("motion") && window.gsap && window.ScrollTrigger;

  const NICHES = [
    { left: 0.247, w: 0.084 },
    { left: 0.380, w: 0.100 },
    { left: 0.520, w: 0.100 },
    { left: 0.669, w: 0.084 },
  ];
  const NICHE_TOP = 0.082;
  const NICHE_H = 0.27;
  const IMG_W = 1536;
  const IMG_H = 1024;
  const POS_X = 0.5;
  const POS_Y = 0.28;
  const SPAN_L = 0.215;
  const SPAN_R = 0.790;

  const year = document.querySelector("#year");
  if (year) year.textContent = new Date().getFullYear();

  document.querySelectorAll(".door[href^='#']").forEach((door) => {
    door.addEventListener("click", (event) => {
      const href = door.getAttribute("href");
      const target = href && document.querySelector(href);
      if (!target) return;
      event.preventDefault();
      const prev = html.style.scrollBehavior;
      html.style.scrollBehavior = "auto";
      if (window.ScrollTrigger) {
        ScrollTrigger.getAll().forEach((st) => {
          if (st.trigger === hero && st.isActive) st.scroll(st.end + 2);
        });
        ScrollTrigger.update();
      }
      requestAnimationFrame(() => {
        const y = Math.round(target.getBoundingClientRect().top + window.scrollY);
        window.scrollTo({ top: Math.max(0, y), behavior: "instant" });
        html.style.scrollBehavior = prev;
        history.replaceState(null, "", href);
      });
    });
  });

  document.querySelectorAll("[data-waitlist]").forEach((button) => {
    button.addEventListener("click", () => {
      const feedback = button.parentElement.querySelector(".feedback");
      if (feedback) feedback.textContent = "Noted. The waitlist goes live with the first build.";
      button.textContent = "You are on the radar →";
      button.disabled = true;
    });
  });

  function coverBox(cw, ch) {
    const coverScale = Math.max(cw / IMG_W, ch / IMG_H);
    const nicheScale = cw / (IMG_W * (SPAN_R - SPAN_L));
    const scale = cw < 760 ? Math.min(coverScale, nicheScale) : coverScale;
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
    const n = NICHES[i];
    return {
      x: box.x + box.w * (n.left + n.w / 2),
      y: box.y + box.h * (NICHE_TOP + NICHE_H - 0.012),
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

  const cue = hero.querySelector(".scroll-cue");
  const veil = hero.querySelector(".veil");
  const photo = hero.querySelector("[data-depth='photo']");

  gsap.set(niches, { "--lit": 0 });
  gsap.set(doors, { "--lit": 0 });
  gsap.set(veil, { opacity: 1 });

  const doorLayer = hero.querySelector(".doors");
  document.body.appendChild(doorLayer);
  doorLayer.classList.add("is-floating");

  placeDoorsAtNiches();

  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: hero,
      start: "top top",
      end: "+=100%",
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      scrub: 0.4,
      invalidateOnRefresh: true,
      onUpdate(self) {
        const docked = self.progress >= 0.92;
        document.body.classList.toggle("doors-docked", docked);
        if (rail) rail.classList.toggle("is-on", docked || document.body.classList.contains("past-hero"));
      },
    },
  });

  function lightDoor(index, at) {
    tl.to(niches[index], { "--lit": 1, duration: 16, ease: "power1.out" }, at);
    tl.to(doors[index], { "--lit": 1, duration: 16, ease: "power1.out" }, at);
  }

  // Scroll A 0–32: Talky, then YouTube. Mid A (16) = Talky only.
  lightDoor(0, 0);
  lightDoor(1, 16);
  tl.to(veil, { opacity: 0.72, duration: 32 }, 0);
  tl.to(cue, { autoAlpha: 0, duration: 8 }, 2);

  // Scroll B 32–64: Discord, then Coach. Mid B (48) = first three; end = all four.
  lightDoor(2, 32);
  lightDoor(3, 48);
  tl.to(veil, { opacity: 0.22, duration: 32 }, 32);

  // Scroll C 64–100: tiny photo translate + dock doors to the top rail.
  tl.to(photo, { y: -16, scale: 1.015, duration: 36, ease: "power1.inOut" }, 64);
  tl.to(".scene", { y: -14, duration: 36, ease: "power1.inOut" }, 64);
  tl.to(veil, { opacity: 0.16, duration: 36 }, 64);

  doors.forEach((door, i) => {
    tl.to(
      door,
      {
        left: () => railPoint(i).x,
        top: () => railPoint(i).y,
        duration: 36,
        ease: "power2.inOut",
      },
      64
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
      if (progress < 0.64) {
        const p = nichePoint(i, box);
        gsap.set(door, { left: p.x, top: p.y });
      } else {
        const p = railPoint(i);
        gsap.set(door, { left: p.x, top: p.y });
      }
    });
  });

  const plate = hero.querySelector(".room-photo");
  const reveal = () => gsap.fromTo(".room", { opacity: 0 }, { opacity: 1, duration: 0.45, ease: "power2.out" });
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

  const beats = {
    open: 0,
    "a-mid": 0.16,
    "a-end": 0.32,
    "b-mid": 0.48,
    "b-end": 0.64,
    "c-dock": 0.97,
  };
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
