"use client";

import Image from "next/image";
import { Fragment, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { heroSlides } from "@/data/imoveis";
import { site, instagramUrl, whatsappUrl } from "@/data/site";
import { ArrowIcon, InstagramIcon, Logo, WhatsAppIcon } from "./icons";

const TITLE = "Imóveis em Itanhaém, com quem conhece o litoral.";
const DUR = 6;

export default function Hero() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const slides = gsap.utils.toArray<HTMLElement>(".slide", el);
    const bars = gsap.utils.toArray<HTMLElement>(".bars b", el);
    const cap = el.querySelector<HTMLElement>("#cap")!;
    const count = el.querySelector<HTMLElement>("#count")!;
    if (reduce) {
      gsap.set(bars[0], { scaleX: 1 });
      return;
    }

    let cur = 0;
    let timer: number | undefined;
    const ctx = gsap.context(() => {
      const kb = (s: HTMLElement) =>
        gsap.fromTo(s.querySelector("img"), { scale: 1.12 }, { scale: 1, duration: DUR + 1.8, ease: "none" });

      const show = (n: number) => {
        const prev = slides[cur];
        const next = slides[n];
        gsap.set(next, { zIndex: 2 });
        gsap.set(prev, { zIndex: 1 });
        kb(next);
        gsap.fromTo(
          next,
          { autoAlpha: 1, clipPath: "inset(0% 0% 0% 100%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.4,
            ease: "expo.inOut",
            onComplete: () => { gsap.set(prev, { autoAlpha: 0 }); },
          },
        );
        gsap.to(cap, {
          yPercent: -100, autoAlpha: 0, duration: 0.4, ease: "power3.in",
          onComplete: () => {
            cap.textContent = heroSlides[n].legenda;
            gsap.fromTo(cap, { yPercent: 100, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.7, ease: "power3.out" });
          },
        });
        count.textContent = `${String(n + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
        bars.forEach((b, i) => { gsap.killTweensOf(b); gsap.set(b, { scaleX: i < n ? 1 : 0 }); });
        gsap.to(bars[n], { scaleX: 1, duration: DUR, ease: "none" });
        cur = n;
      };

      gsap.set(slides.slice(1), { autoAlpha: 0 });
      kb(slides[0]);
      gsap.to(bars[0], { scaleX: 1, duration: DUR, ease: "none" });
      timer = window.setInterval(() => { if (!document.hidden) show((cur + 1) % slides.length); }, DUR * 1000);

      // entrada
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".frame", { clipPath: "inset(6% 6% 6% 6% round 40px)", duration: 1.5, ease: "expo.out" }, 0)
        .from(".tab", { yPercent: -100, duration: 1, ease: "expo.out" }, 0.45)
        .from(".notch", { xPercent: 100, duration: 1, ease: "expo.out" }, 0.6)
        .from(".hero-title .w > span", { yPercent: 110, duration: 1, stagger: 0.06 }, 0.5)
        .from(".h-in", { y: 22, autoAlpha: 0, duration: 0.9, stagger: 0.1 }, 0.95)
        .from(".hmeta", { autoAlpha: 0, y: -8, duration: 0.8 }, 1.05);
    }, el);

    return () => { window.clearInterval(timer); ctx.revert(); };
  }, []);

  return (
    <div className="hero-wrap" id="inicio" ref={root}>
      <section className="frame hero" aria-label="Destaques">
        <div className="slides">
          {heroSlides.map((s, i) => (
            <div className="slide" key={s.img}>
              <Image src={s.img} alt={s.alt} fill sizes="100vw" preload={i === 0} loading={i === 0 ? "eager" : "lazy"} />
            </div>
          ))}
        </div>
        <div className="frame-shade" aria-hidden="true" />
        <div className="frame-dim" aria-hidden="true" />

        <nav className="tab" aria-label="Principal">
          <a href="#imoveis">Comprar</a>
          <a href="#imoveis">Alugar</a>
          <a className="tab-logo" href="#inicio" aria-label={`${site.name}, início`}><Logo /></a>
          <a href="#financiamento">Financiamento</a>
          <a href="#sobre">Sobre</a>
        </nav>

        <div className="hcontent">
          <div className="hleft">
            <div className="hmeta mono">
              <div className="cap" aria-live="polite"><span id="cap">{heroSlides[0].legenda}</span></div>
              <div className="bars">
                <em id="count">01 / {String(heroSlides.length).padStart(2, "0")}</em>
                {heroSlides.map((s) => <i key={s.img}><b /></i>)}
              </div>
            </div>
            <h1 className="hero-title" aria-label={TITLE}>
              {TITLE.split(" ").map((w, i) => (
                <Fragment key={i}>
                  <span className="w" aria-hidden="true"><span>{w}</span></span>{" "}
                </Fragment>
              ))}
            </h1>
          </div>
          <div className="hside">
            <span className="lbl mono h-in">{site.corretora} · CRECI {site.creci}</span>
            <p className="h-in">Especialista em chácaras na praia e financiamento bancário.</p>
            <a className="pillcta h-in" href="#imoveis">
              Ver imóveis <span aria-hidden="true"><ArrowIcon /></span>
            </a>
          </div>
        </div>

        <div className="notch">
          <a className="social" href={instagramUrl} target="_blank" rel="noopener" aria-label="Instagram da Elaine"><InstagramIcon /></a>
          <a className="social" href={whatsappUrl()} target="_blank" rel="noopener" aria-label="Falar no WhatsApp"><WhatsAppIcon /></a>
        </div>
      </section>
    </div>
  );
}
