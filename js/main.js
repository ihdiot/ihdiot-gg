/* IHDIOT — N2b room. One photo, five plates, one scrubbed timeline. */
(() => {
  const html = document.documentElement;
  const hero = document.querySelector(".hero");
  const motionOK = html.classList.contains("motion") && window.gsap && window.ScrollTrigger;

  if (!motionOK) {
    // Reduced motion, or GSAP missing: static S4 composition, doors still work.
    html.classList.remove("motion");
    html.classList.add("static");
  } else {
    buildRoom();
  }

  // Site bar appears once the room has scrolled away.
  const bar = document.querySelector(".site-bar");
  if (bar && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      ([entry]) => document.body.classList.toggle("past-hero", !entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0, rootMargin: "-1px 0px 0px 0px" }
    );
    io.observe(hero);
  }

  document.querySelectorAll("[data-waitlist]").forEach((button) => {
    button.addEventListener("click", () => {
      const feedback = button.parentElement.querySelector(".feedback");
      if (feedback) feedback.textContent = "Noted. The waitlist goes live with the first build.";
      button.textContent = "You are on the radar →";
      button.disabled = true;
    });
  });

  const year = document.querySelector("#year");
  if (year) year.textContent = new Date().getFullYear();

  // ------------------------------------------------------------------
  function buildRoom() {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });

    const plates = gsap.utils.toArray(".plate");
    const heroType = hero.querySelector(".hero-type");
    const wordmark = hero.querySelector(".wordmark");
    const tagline = hero.querySelector(".tagline");
    const rule = hero.querySelector(".rule");
    const heroNav = hero.querySelector(".hero-nav");
    const doors = hero.querySelector(".doors");
    const doorLinks = gsap.utils.toArray(".door");
    const cue = hero.querySelector(".scroll-cue");

    // Dolly travel for a plate with rate 1.0, as a fraction of the viewport height.
    const TRAVEL = 0.16;
    const ZOOM = 0.14;

    gsap.set([doors, tagline], { autoAlpha: 0 });
    gsap.set(rule, { scaleX: 0 });

    // 0–100 timeline units == 0–100% of the pinned scroll (about 3.6 screens).
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: hero,
        start: "top top",
        end: "+=360%",
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        scrub: 0.7,
        invalidateOnRefresh: true,
      },
    });

    // S1 → S3: every plate dollies at its own rate. S4 is the ease-out at the end.
    plates.forEach((plate) => {
      const rate = parseFloat(plate.dataset.rate);
      tl.to(
        plate,
        {
          y: () => -hero.clientHeight * TRAVEL * rate,
          scale: 1 + ZOOM * rate,
          ease: "power1.inOut",
          duration: 84,
        },
        0
      );
    });

    // S1 enter: the cue steps aside as soon as you move.
    tl.to(cue, { autoAlpha: 0, duration: 8 }, 3);

    // S2 depth: subtitle and rule surface under the wordmark.
    tl.to(tagline, { autoAlpha: 1, duration: 14, ease: "power2.out" }, 16);
    tl.fromTo(tagline, { y: 14 }, { y: 0, duration: 14, ease: "power2.out" }, 16);
    tl.to(rule, { scaleX: 1, duration: 12, ease: "power2.out" }, 22);

    // S3 doors: wordmark docks higher, top nav hands off to the four soft pills.
    tl.to(heroType, { y: () => -hero.clientHeight * 0.1, duration: 22, ease: "power2.inOut" }, 42);
    tl.to(wordmark, { scale: 0.84, duration: 22, ease: "power2.inOut" }, 42);
    tl.to(heroNav, { autoAlpha: 0, y: -12, duration: 10, ease: "power1.in" }, 44);
    tl.fromTo(doors, { y: 30 }, { autoAlpha: 1, y: 0, duration: 16, ease: "power2.out" }, 52);
    tl.fromTo(doorLinks, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 9, stagger: 2.5, ease: "power2.out" }, 55);

    // S4 settle: foreground dims a touch, then everything holds for the last stretch.
    tl.to(".plate--fg", { opacity: 0.86, duration: 18, ease: "power1.inOut" }, 66);
    tl.to({}, { duration: 16 }, 84);

    // Load-in: the room fades up once the wall plate has decoded.
    const wall = hero.querySelector(".plate--wall img");
    const reveal = () => gsap.fromTo(".room", { opacity: 0 }, { opacity: 1, duration: 1.1, ease: "power2.out" });
    if (wall.complete) reveal();
    else wall.addEventListener("load", reveal, { once: true });
  }
})();
