(() => {
  const html = document.documentElement;
  const stage = document.querySelector(".stage");
  const motionOK = html.classList.contains("motion") && window.gsap && window.ScrollTrigger;

  if (!motionOK) {
    html.classList.remove("motion");
    html.classList.add("static");
  } else {
    buildRoom();
  }

  const bar = document.querySelector(".site-bar");
  if (bar && stage && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      ([entry]) => {
        document.body.classList.toggle(
          "past-hero",
          !entry.isIntersecting && entry.boundingClientRect.top < 0
        );
      },
      { threshold: 0, rootMargin: "-1px 0px 0px 0px" }
    );
    io.observe(stage);
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

  function buildRoom() {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });

    const wordmark = stage.querySelector(".wordmark");
    const cue = stage.querySelector(".scroll-cue");
    const doors = stage.querySelector(".doors");
    const rope = stage.querySelector(".neon-rope");
    const layers = gsap.utils.toArray(".layer");
    const typeLayer = stage.querySelector(".type-layer");

    const len = rope && rope.getTotalLength ? rope.getTotalLength() : 980;
    if (rope) {
      rope.style.strokeDasharray = `${len}`;
      rope.style.strokeDashoffset = `${len}`;
    }

    gsap.set(wordmark, { xPercent: -50, yPercent: -50, left: "50%", top: "46%", width: "min(86vw, 920px)" });
    gsap.set([".chapter-line", ".obj", doors], { autoAlpha: 0 });
    gsap.set(".layer-bg, .layer-desk, .layer-chair, .layer-neon, .layer-fg", { autoAlpha: 0 });
    gsap.set(".door-fill", { scaleY: 0, transformOrigin: "50% 100%" });

    gsap.utils.toArray(".obj .draw").forEach((el) => {
      let length = 180;
      try {
        length = el.getTotalLength();
      } catch (err) {
        length = 180;
      }
      gsap.set(el, { strokeDasharray: length, strokeDashoffset: length });
    });

    const breath = gsap.to(wordmark, {
      scale: 1.028,
      duration: 2.8,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
    });

    const TRAVEL = 0.2;

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: stage,
        start: "top top",
        end: "+=560%",
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        scrub: 0.65,
        invalidateOnRefresh: true,
        onUpdate(self) {
          stage.classList.toggle("has-scrolled", self.progress > 0.012);
          stage.classList.toggle("is-docked", self.progress > 0.86);
          if (self.progress < 0.012) {
            if (breath.paused()) breath.restart();
          } else if (!breath.paused()) {
            breath.pause();
            gsap.set(wordmark, { scale: 1 });
          }
        },
        onLeave() {
          document.body.classList.add("past-hero");
        },
        onEnterBack() {
          document.body.classList.remove("past-hero");
        },
      },
    });

    layers.forEach((layer) => {
      const rate = parseFloat(layer.dataset.rate) || 0.4;
      const shift = layer.querySelector(".shift");
      if (!shift) return;
      tl.to(
        shift,
        {
          y: () => -stage.clientHeight * TRAVEL * rate,
          duration: 100,
          ease: "none",
        },
        0
      );
    });

    tl.to(typeLayer, { y: () => -stage.clientHeight * 0.08, duration: 100, ease: "none" }, 0);

    // 0–10 ENTER: hold black; breathe dies as soon as progress leaves 0
    tl.to(cue, { autoAlpha: 0, duration: 6 }, 3);
    tl.to(wordmark, { scale: 1, duration: 4 }, 2);

    // 10–24 UNSEAL: room fades slower than mid objects
    tl.to(".layer-chair", { autoAlpha: 1, duration: 10, ease: "power1.out" }, 10);
    tl.to(".layer-desk", { autoAlpha: 1, duration: 12, ease: "power1.out" }, 12);
    tl.to(".layer-bg", { autoAlpha: 1, duration: 16, ease: "power1.out" }, 11);
    tl.to(".layer-fg", { autoAlpha: 0.95, duration: 10, ease: "power1.out" }, 14);

    // 18–30 NEON IGNITE
    tl.to(".layer-neon", { autoAlpha: 1, duration: 4 }, 18);
    if (rope) {
      tl.to(rope, { strokeDashoffset: 0, duration: 12, ease: "power1.out" }, 18);
    }

    // mark recedes during chapter strips, then returns for the trophies
    tl.to(wordmark, { autoAlpha: 0.22, duration: 6 }, 28);
    tl.to(wordmark, { autoAlpha: 1, duration: 5 }, 66);

    // 30–42 CH 01 Cross Car
    tl.to(".obj-car", { autoAlpha: 1, duration: 4, ease: "power1.out" }, 30);
    tl.to(".obj-car .draw", { strokeDashoffset: 0, duration: 8, stagger: 0.12, ease: "power1.out" }, 30);
    tl.fromTo(".line-car", { y: 22 }, { autoAlpha: 1, y: 0, duration: 4, ease: "power2.out" }, 32);
    tl.to(".line-car", { autoAlpha: 0, y: -16, duration: 3, ease: "power1.in" }, 40);
    tl.to(".obj-car", { autoAlpha: 0, y: -20, filter: "blur(6px)", duration: 3 }, 40);

    // 42–54 CH 02 War Dogs
    tl.to(".obj-helmet", { autoAlpha: 1, duration: 4, ease: "power1.out" }, 42);
    tl.to(".obj-helmet .draw", { strokeDashoffset: 0, duration: 8, stagger: 0.12, ease: "power1.out" }, 42);
    tl.fromTo(".line-dogs", { y: 22 }, { autoAlpha: 1, y: 0, duration: 4, ease: "power2.out" }, 44);
    tl.to(".line-dogs", { autoAlpha: 0, y: -16, duration: 3, ease: "power1.in" }, 52);
    tl.to(".obj-helmet", { autoAlpha: 0, y: -20, filter: "blur(6px)", duration: 3 }, 52);

    // 54–66 CH 03 Talky
    tl.to(".obj-mic", { autoAlpha: 1, duration: 4, ease: "power1.out" }, 54);
    tl.to(".obj-mic .draw", { strokeDashoffset: 0, duration: 8, stagger: 0.12, ease: "power1.out" }, 54);
    tl.fromTo(".line-talky", { y: 22 }, { autoAlpha: 1, y: 0, duration: 4, ease: "power2.out" }, 56);
    tl.to(".line-talky", { autoAlpha: 0, y: -16, duration: 3, ease: "power1.in" }, 64);
    tl.to(".obj-mic", { autoAlpha: 0, y: -20, filter: "blur(6px)", duration: 3 }, 64);

    // 66–70 pedestals appear dim
    tl.to(doors, { autoAlpha: 1, duration: 5, ease: "power1.out" }, 66);
    tl.fromTo(doors, { y: 24 }, { y: 0, duration: 5, ease: "power2.out" }, 66);

    // 70–86 trophy lights L→R: Talky half, YouTube; Discord half, Coach
    tl.to(".door-talky .door-fill", { scaleY: 0.5, duration: 4, ease: "power1.out" }, 70);
    tl.to(".door-talky .door-fill", { scaleY: 1, duration: 4, ease: "power1.out" }, 74);
    tl.to(".door-youtube .door-fill", { scaleY: 1, duration: 5, ease: "power1.out" }, 74);
    tl.to(".door-discord .door-fill", { scaleY: 0.5, duration: 4, ease: "power1.out" }, 78);
    tl.to(".door-discord .door-fill", { scaleY: 1, duration: 4, ease: "power1.out" }, 82);
    tl.to(".door-coach .door-fill", { scaleY: 1, duration: 5, ease: "power1.out" }, 82);

    // 86–96 DOCK: mark to corner, pedestals become the top rail
    tl.to(
      wordmark,
      {
        left: () => (innerWidth < 720 ? 12 : 22),
        top: () => (innerWidth < 720 ? 14 : 18),
        xPercent: 0,
        yPercent: 0,
        y: 0,
        width: () => (innerWidth < 720 ? 98 : 136),
        duration: 10,
        ease: "power2.inOut",
      },
      86
    );
    tl.to(
      doors,
      {
        top: 0,
        bottom: "auto",
        height: 54,
        y: 0,
        justifyContent: "flex-end",
        alignItems: "center",
        gap: 10,
        paddingRight: 16,
        duration: 10,
        ease: "power2.inOut",
      },
      86
    );
    tl.to(".door-stem", { height: 2, width: "100%", duration: 8, ease: "power2.inOut" }, 86);
    tl.to(".door-plinth", { autoAlpha: 0, height: 0, margin: 0, duration: 6 }, 86);
    tl.to(".door-name", { fontSize: "0.78rem", letterSpacing: "0.16em", duration: 8 }, 86);
    tl.to(".door-fill", { scaleY: 1, duration: 1 }, 86);

    // 96–100 hold
    tl.to({}, { duration: 4 }, 96);

    const beats = { enter: 0, unseal: 0.16, neon: 0.26, chapter: 0.36, doors: 0.73, dock: 0.94 };
    const wanted = new URLSearchParams(location.search).get("beat");
    if (wanted != null && beats[wanted] != null) {
      const seek = () => {
        const st = ScrollTrigger.getAll()[0];
        if (!st) return;
        window.scrollTo(0, st.start + (st.end - st.start) * beats[wanted]);
        ScrollTrigger.update();
      };
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        seek();
        requestAnimationFrame(seek);
      });
    }
  }
})();
