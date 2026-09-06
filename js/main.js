(() => {
  const links = [...document.querySelectorAll(".tab-link")];
  const sections = links.map(link => document.querySelector(link.getAttribute("href"))).filter(Boolean);
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const setActive = id => links.forEach(link => link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`));
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) setActive(entry.target.id); }), { rootMargin: "-35% 0px -55% 0px" });
    sections.forEach(section => observer.observe(section));
  }
  if (!reduced) {
    const chapters = [...document.querySelectorAll(".chapter")];
    const moveArt = () => chapters.forEach(chapter => { const rect = chapter.getBoundingClientRect(); const shift = Math.max(-30, Math.min(30, (innerHeight / 2 - (rect.top + rect.height / 2)) * .06)); chapter.style.setProperty("--scroll-shift", shift); });
    addEventListener("scroll", moveArt, { passive: true }); moveArt();
  }
  document.querySelectorAll("[data-waitlist]").forEach(button => button.addEventListener("click", () => {
    const feedback = button.parentElement.querySelector(".button-feedback"); feedback.textContent = "Noted. The waitlist goes live with the first build."; button.textContent = "You are on the radar →"; button.disabled = true; button.style.opacity = ".65";
  }));
  const year = document.querySelector("#year"); if (year) year.textContent = new Date().getFullYear();
})();
