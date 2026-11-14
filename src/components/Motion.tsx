"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

/**
 * Rolagem suave (Lenis) sincronizada com o GSAP e todas as animações ligadas à rolagem.
 * Fica num lugar só para manter a ordem: Lenis primeiro, depois os gatilhos, depois um refresh.
 */
export default function Motion() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = matchMedia("(pointer: fine)").matches;
    const $ = <T extends Element = HTMLElement>(s: string) => document.querySelector<T>(s);
    const top = $("#top");
    const bar = $("#bar");
    const heroWrap = $("#inicio");
    const contato = $("#contato");

    // topo compacto e barra de busca
    const onScroll = () => {
      const y = scrollY;
      const h = heroWrap?.offsetHeight ?? innerHeight;
      const footTop = contato?.getBoundingClientRect().top ?? Infinity;
      top?.classList.toggle("show", y > h * 0.9 && footTop > innerHeight * 0.35);
      bar?.classList.toggle("away", y < h * 0.45 || footTop < innerHeight * 0.6);
    };
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const smooth: { lenis?: Lenis } = {};
    const toTop = () => (smooth.lenis ? smooth.lenis.scrollTo(0, { duration: 1.6 }) : scrollTo({ top: 0 }));
    addEventListener("zenite:top", toTop);

    if (reduce) {
      return () => {
        removeEventListener("scroll", onScroll);
        removeEventListener("zenite:top", toTop);
      };
    }

    document.documentElement.classList.add("pin");
    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1, anchors: { offset: -64 } });
    smooth.lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      // o hero recua e a página sobe por cima (escala + véu escuro; sem filter, que pesa)
      gsap.to(".frame", { scale: 0.92, rotate: -2, ease: "none", scrollTrigger: { trigger: "#after", start: "top bottom", end: "top top", scrub: true } });
      gsap.to(".frame-dim", { opacity: 0.55, ease: "none", scrollTrigger: { trigger: "#after", start: "top bottom", end: "top top", scrub: true } });

      // títulos: linhas sobem do corte
      gsap.utils.toArray<HTMLElement>(".split").forEach((h) => {
        gsap.from(h.querySelectorAll(".line > span"), {
          yPercent: 110, duration: 1.1, stagger: 0.09, ease: "power3.out",
          scrollTrigger: { trigger: h, start: "top 85%", once: true },
        });
      });
      ScrollTrigger.batch(".up", { start: "top 88%", once: true, onEnter: (els) => gsap.from(els, { y: 28, autoAlpha: 0, duration: 0.9, stagger: 0.1, ease: "power3.out" }) });
      ScrollTrigger.batch(".facts li", { start: "top 92%", once: true, onEnter: (els) => gsap.from(els, { y: 24, autoAlpha: 0, duration: 0.8, stagger: 0.07, ease: "power3.out" }) });

      // números contando
      gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
        const end = parseFloat(el.dataset.count!);
        const dec = Number(el.dataset.dec ?? 0);
        const o = { v: 0 };
        ScrollTrigger.create({
          trigger: el, start: "top 95%", once: true,
          onEnter: () => gsap.to(o, { v: end, duration: 1.8, ease: "power2.out", onUpdate: () => { el.textContent = o.v.toLocaleString("pt-BR", { minimumFractionDigits: dec, maximumFractionDigits: dec }); } }),
        });
      });

      // faixa de bairros: anda sozinha e acelera com a rolagem
      const track = $(".marquee .track");
      if (track) {
        const loop = gsap.to(track, { xPercent: -50, duration: 40, ease: "none", repeat: -1 });
        let boost = gsap.to({}, {});
        lenis.on("scroll", ({ velocity }: { velocity: number }) => {
          const ts = 1 + Math.min(Math.abs(velocity) / 6, 5);
          boost.kill();
          loop.timeScale(ts);
          boost = gsap.to(loop, { timeScale: 1, duration: 1.2, ease: "power2.out" });
        });
      }

      // fotos dos imóveis abrem de baixo para cima
      gsap.utils.toArray<HTMLElement>(".item").forEach((it) => {
        const ph = it.querySelector(".ph");
        const img = it.querySelector(".ph img");
        const tl = gsap.timeline({ scrollTrigger: { trigger: it, start: "top 88%", once: true } });
        tl.from(ph, { clipPath: "inset(100% 0% 0% 0%)", duration: 1.2, ease: "expo.out" })
          .from(img, { scale: 1.15, duration: 1.5, ease: "expo.out", clearProps: "transform" }, 0)
          .from(it.querySelectorAll("h3, .lbl"), { y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.07, ease: "power3.out" }, 0.25);
      });

      // financiamento contado no scroll
      const cards = gsap.utils.toArray<HTMLElement>(".card");
      const photos = gsap.utils.toArray<HTMLElement>(".fin-photo");
      const ticks = cards.map((c) => Array.from(c.querySelectorAll<HTMLElement>(".ticks span")));
      const finbar = $(".fin-progress span");
      let active = -1;
      ScrollTrigger.create({
        trigger: ".fin", start: "top top", end: "bottom bottom",
        onUpdate: (self) => {
          const n = cards.length;
          const p = self.progress;
          const idx = Math.min(n - 1, Math.floor(p * n));
          const local = Math.min(1, p * n - idx);
          if (finbar) finbar.style.transform = `scaleX(${p})`;
          if (idx !== active) {
            cards.forEach((c, i) => { c.classList.toggle("active", i === idx); c.classList.toggle("prev", i < idx); });
            photos.forEach((ph, i) => ph.classList.toggle("on", i === idx));
            active = idx;
          }
          ticks[idx].forEach((s, j) => { s.style.transform = `scaleX(${j < idx ? 1 : j === idx ? local : 0})`; });
        },
      });
      gsap.to(".fin-photos", { scale: 1.06, ease: "none", scrollTrigger: { trigger: ".fin", start: "top top", end: "bottom bottom", scrub: true } });

      // fachada em parallax
      gsap.fromTo(".about .ph img", { yPercent: -2, scale: 1.05 }, { yPercent: 2, scale: 1.05, ease: "none", scrollTrigger: { trigger: ".about", start: "top bottom", end: "bottom top", scrub: true } });

      // rodapé-cortina
      gsap.fromTo(".big", { yPercent: 30, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, ease: "none", scrollTrigger: { trigger: "#contato", start: "top 80%", end: "bottom bottom", scrub: true } });
      gsap.fromTo(".f-in", { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.12, ease: "none", scrollTrigger: { trigger: "#contato", start: "top 55%", end: "top 10%", scrub: true } });
    });

    // botões magnéticos (só com mouse)
    const cleanups: (() => void)[] = [];
    if (fine) {
      document.querySelectorAll<HTMLElement>(".magnetic").forEach((m) => {
        const move = (e: MouseEvent) => {
          const r = m.getBoundingClientRect();
          gsap.to(m, { x: (e.clientX - r.left - r.width / 2) * 0.3, y: (e.clientY - r.top - r.height / 2) * 0.3, duration: 0.4, ease: "power2.out" });
        };
        const leave = () => gsap.to(m, { x: 0, y: 0, duration: 1, ease: "elastic.out(1, 0.35)" });
        m.addEventListener("mousemove", move);
        m.addEventListener("mouseleave", leave);
        cleanups.push(() => { m.removeEventListener("mousemove", move); m.removeEventListener("mouseleave", leave); });
      });
    }

    const refresh = () => ScrollTrigger.refresh();
    addEventListener("load", refresh);
    document.fonts?.ready.then(refresh);

    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("zenite:top", toTop);
      removeEventListener("load", refresh);
      cleanups.forEach((c) => c());
      ctx.revert();
      gsap.ticker.remove(raf);
      lenis.destroy();
      document.documentElement.classList.remove("pin");
    };
  }, []);

  return null;
}
