import { useCallback, useEffect, useRef, useState } from 'react';
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
  useInView,
} from 'framer-motion';

/* ============================================================
   DIREÇÃO CRIATIVA — "ESCULPIDA EM VERMELHO"
   Paleta: #1A0000 (noite) · #3E0404 (borgonha) · #BF0002 (carmesim) · #FF6686 (rosa)
   Tipografia: Cormorant Garamond (editorial) + Inter (corpo claro)
   O scroll funciona como narrativa:
   1. Vídeo scrubado pelo scroll (hero cinematográfico)
   2. Revelação em cortina entre blocos (transição memorável)
   3. Galeria horizontal pinning com parallax interno
   4. Frase gigante sobre fotografia fixa (momento de impacto)
   ============================================================ */

const EASE = [0.22, 1, 0.36, 1] as const;

function slug(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/* ------------------------------------------------------------
   PREFERS REDUCED MOTION
------------------------------------------------------------ */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return reduced;
}

/* ------------------------------------------------------------
   SCROLL-DRIVEN VIDEO
   O vídeo 01-video.mp4 é controlado pelo scroll do mouse.
   Se o arquivo ainda não foi enviado, um fundo vivo em
   carmesim assume o lugar sem quebrar a experiência.
------------------------------------------------------------ */
function ScrollVideo({ className }: { className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasVideo, setHasVideo] = useState(true);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !hasVideo) return;

    let duration = 0;
    let ticking = false;

    const onMeta = () => {
      duration = v.duration && isFinite(v.duration) ? v.duration : 0;
      if (duration > 0) {
        // pausa total: o scroll é o controle remoto
        v.pause();
        v.currentTime = 0;
      } else {
        setHasVideo(false);
      }
    };

    const onScroll = () => {
      if (ticking || duration === 0) return;
      ticking = true;
      requestAnimationFrame(() => {
        const doc = document.documentElement;
        const max = doc.scrollHeight - window.innerHeight;
        const p = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
        v.currentTime = p * (duration - 0.05);
        ticking = false;
      });
    };

    onMeta();
    v.addEventListener('loadedmetadata', onMeta);
    if (!reduced) {
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }
    return () => {
      v.removeEventListener('loadedmetadata', onMeta);
      window.removeEventListener('scroll', onScroll);
    };
  }, [hasVideo, reduced]);

  return (
    <div className={`absolute inset-0 ${className ?? ''}`} aria-hidden="true">
      {/* fallback vivo — aparece atrás do vídeo e quando ele não existe */}
      <div className="absolute inset-0 bg-dark">
        <div className="video-pulse absolute inset-[-20%]" />
        <div className="video-drift absolute inset-[-20%]" />
      </div>
      {hasVideo && (
        <video
          ref={videoRef}
          className="relative h-full w-full object-cover"
          muted
          playsInline
          preload="auto"
          onError={() => setHasVideo(false)}
          tabIndex={-1}
        >
          <source src="/01-videofundo.mp4" type="video/mp4" />
        </video>
      )}
    </div>
  );
}

/* ------------------------------------------------------------
   LOADING — contagem cinematográfica
------------------------------------------------------------ */
function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min((t - start) / 1700, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(eased * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setTimeout(onComplete, 450);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onComplete]);

  return (
    <motion.div
      exit={{ clipPath: 'inset(0 0 100% 0)' }}
      transition={{ duration: 1.1, ease: EASE }}
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-dark"
    >
      <p className="mb-6 text-[10px] font-light uppercase tracking-[0.5em] text-rose/60">
        Prévia conceitual
      </p>
      <h1 className="font-serif text-7xl font-light text-cream md:text-8xl">
        {count}
        <span className="text-crimson">%</span>
      </h1>
      <div className="mt-8 h-px w-52 overflow-hidden bg-cream/10">
        <div
          className="h-full bg-gradient-to-r from-crimson to-rose transition-[width] duration-100"
          style={{ width: `${count}%` }}
        />
      </div>
      <p className="mt-5 text-[9px] uppercase tracking-[0.4em] text-cream/25">
        Preparando a experiência
      </p>
    </motion.div>
  );
}

/* ------------------------------------------------------------
   CURSOR — anel + halo (desktop apenas)
------------------------------------------------------------ */
function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const ring = ringRef.current;
    const halo = haloRef.current;
    if (!ring || !halo) return;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let rx = x;
    let ry = y;
    let raf = 0;

    const move = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      halo.style.left = `${x}px`;
      halo.style.top = `${y}px`;
      const interactive = (e.target as HTMLElement)?.closest?.('a, button, [data-cursor]');
      ring.classList.toggle('is-hovering', !!interactive);
    };
    const loop = () => {
      rx += (x - rx) * 0.16;
      ry += (y - ry) * 0.16;
      ring.style.left = `${rx}px`;
      ring.style.top = `${ry}px`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener('mousemove', move);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('mousemove', move);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={haloRef} className="cursor-halo hidden md:block" aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring hidden md:block" aria-hidden="true" />
    </>
  );
}

/* ------------------------------------------------------------
   NAVEGAÇÃO — muda de aparência conforme o scroll
------------------------------------------------------------ */
const NAV_ITEMS = ['Experiência', 'Serviços', 'Galeria', 'Contato'];

function Navigation({ scrolled }: { scrolled: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.3, ease: EASE }}
        className={`fixed left-0 right-0 top-0 z-[500] transition-all duration-700 ${
          scrolled
            ? 'border-b border-cream/[0.06] bg-dark/85 py-3 backdrop-blur-md'
            : 'bg-transparent py-7'
        }`}
      >
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 md:px-12">
          <a href="#topo" className="group flex items-baseline gap-2" aria-label="Início">
            <span className="font-serif text-2xl font-light tracking-wide text-cream">
              <span className="italic text-crimson transition-colors duration-500 group-hover:text-rose">
                V
              </span>
                      itória
            </span>
            <span className="hidden text-[8px] uppercase tracking-[0.4em] text-cream/30 sm:inline">
              Estúdio pessoal
            </span>
          </a>

          <div className="hidden items-center gap-9 md:flex">
            {NAV_ITEMS.map((item) => (
              <a
                key={item}
                href={`#${slug(item)}`}
                className="group relative py-1 text-[11px] font-light uppercase tracking-[0.22em] text-cream/60 transition-colors duration-300 hover:text-cream"
              >
                {item}
                <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-crimson transition-all duration-500 group-hover:w-full" />
              </a>
            ))}
            <a
              href="#contato"
              className="btn-premium border border-crimson/60 px-6 py-2.5 text-[10px] uppercase tracking-[0.25em] text-cream transition-all duration-500 hover:border-crimson hover:bg-crimson/10"
            >
              Agendar horário
            </a>
          </div>

          <button
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={open}
            className="flex flex-col gap-[7px] p-2 md:hidden"
          >
            <motion.span
              animate={open ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
              className="block h-px w-7 bg-cream"
            />
            <motion.span
              animate={open ? { opacity: 0, x: -10 } : { opacity: 1, x: 0 }}
              className="block h-px w-5 self-end bg-rose"
            />
            <motion.span
              animate={open ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
              className="block h-px w-7 bg-cream"
            />
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.7, ease: EASE }}
            className="fixed inset-0 z-[490] flex flex-col items-center justify-center gap-8 bg-burgundy md:hidden"
          >
            {NAV_ITEMS.map((item, i) => (
              <motion.a
                key={item}
                href={`#${slug(item)}`}
                onClick={() => setOpen(false)}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.09, duration: 0.6, ease: EASE }}
                className="font-serif text-5xl font-light text-cream/90"
              >
                {item}
                <span className="ml-3 align-super text-[10px] text-crimson">0{i + 1}</span>
              </motion.a>
            ))}
            <motion.a
              href="#contato"
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-6 border border-crimson px-10 py-4 text-[11px] uppercase tracking-[0.3em] text-cream"
            >
              Agendar horário
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ------------------------------------------------------------
   HERO — vídeo scrubado + câmera cinematográfica no scroll
------------------------------------------------------------ */
function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.28]);
  const layerSlow = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const layerFast = useTransform(scrollYProgress, [0, 1], [0, -220]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const vignette = useTransform(scrollYProgress, [0, 1], [0.35, 0.9]);
  const barOpen = useTransform(scrollYProgress, [0, 0.85], ['8%', '0%']);

  return (
    <section ref={heroRef} id="topo" className="relative h-[260vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* vídeo dominando a tela inteira, reagindo ao scroll */}
        <motion.div style={{ scale }} className="absolute inset-[-4%]">
          <ScrollVideo />
        </motion.div>

        {/* tratamento cinematográfico */}
        <motion.div
          style={{ opacity: vignette }}
          className="absolute inset-0 bg-dark mix-blend-multiply"
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_35%,_rgba(26,0,0,0.75)_100%)]" />

        {/* barras letterbox que se abrem ao rolar */}
        <motion.div
          style={{ height: barOpen }}
          className="absolute inset-x-0 top-0 z-20 bg-dark"
        />
        <motion.div
          style={{ height: barOpen }}
          className="absolute inset-x-0 bottom-0 z-20 bg-dark"
        />

        {/* tipografia lateral — camada lenta */}
        <motion.div
          style={{ y: layerSlow, opacity: contentOpacity }}
          className="absolute left-6 top-1/2 z-30 hidden -translate-y-1/2 lg:block"
        >
          <p className="vertical-text text-[10px] uppercase tracking-[0.6em] text-cream/30">
            Acompanhante de luxo — Atendimento VIP
          </p>
        </motion.div>
        <motion.div
          style={{ y: layerSlow, opacity: contentOpacity }}
          className="absolute right-6 top-1/2 z-30 hidden -translate-y-1/2 lg:block"
        >
          <p className="vertical-text text-[10px] uppercase tracking-[0.6em] text-rose/40">
            Experiências · Video Call · Packs
          </p>
        </motion.div>

        {/* conteúdo central — camada rápida (parallax de velocidades) */}
        <motion.div
          style={{ y: layerFast, opacity: contentOpacity }}
          className="relative z-30 flex h-full flex-col items-center justify-center px-6 text-center"
        >
          <motion.p
            initial={{ opacity: 0, letterSpacing: '0.1em' }}
            animate={{ opacity: 1, letterSpacing: '0.55em' }}
            transition={{ duration: 2, delay: 1.9, ease: 'easeOut' }}
            className="mb-9 text-[10px] font-light uppercase text-rose/80"
          >
            Presença · Elegância · Discrição
          </motion.p>

          <h1 className="font-serif leading-[0.86] text-cream">
            <motion.span
              initial={{ y: '110%' }}
              animate={{ y: 0 }}
              transition={{ duration: 1.2, delay: 2.1, ease: EASE }}
              className="block overflow-hidden"
            >
              <span className="block text-[clamp(3.6rem,12vw,10.5rem)] font-light">
                Momentos
              </span>
            </motion.span>
            <motion.span
              initial={{ y: '110%' }}
              animate={{ y: 0 }}
              transition={{ duration: 1.2, delay: 2.35, ease: EASE }}
              className="block overflow-hidden"
            >
              <span className="block text-[clamp(3.6rem,12vw,10.5rem)] italic text-crimson">
                inesquecíveis
              </span>
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 2.9, ease: EASE }}
            className="mt-10 max-w-sm text-xs font-light leading-relaxed tracking-wide text-cream/55 md:text-sm"
          >
            Uma experiência desenhada para quem entende que os melhores momentos
            acontecem longe dos holofotes.
          </motion.p>
        </motion.div>

        {/* indicador de scroll */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.6, duration: 1 }}
          style={{ opacity: contentOpacity }}
          className="absolute bottom-[12%] left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-3"
        >
          <span className="text-[9px] uppercase tracking-[0.5em] text-cream/35">
            Role para viver
          </span>
          <motion.span
            animate={{ y: [0, 12, 0], opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            className="block h-12 w-px bg-gradient-to-b from-crimson to-transparent"
          />
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------
   TRANSIÇÃO CINEMATOGRÁFICA — cortina sobe, revelando a marca
------------------------------------------------------------ */
function CurtainReveal() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end end'],
  });
  const curtain = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
  const wordY = useTransform(scrollYProgress, [0.25, 1], ['100%', '-12%']);
  const subOpacity = useTransform(scrollYProgress, [0.55, 0.95], [0, 1]);

  return (
    <section ref={ref} className="relative h-[130vh]">
      <div className="sticky top-0 h-screen overflow-hidden bg-dark">
        {/* destino: a palavra gigante emerge por trás da cortina */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="overflow-hidden">
            <motion.h2
              style={{ y: wordY }}
              className="whitespace-nowrap font-serif text-[clamp(4.5rem,17vw,15rem)] font-light leading-none text-cream"
            >
              Marcante<span className="text-crimson">.</span>
            </motion.h2>
          </div>
        </div>
        <motion.p
          style={{ opacity: subOpacity }}
          className="absolute bottom-[16%] left-1/2 w-full -translate-x-1/2 px-6 text-center text-[10px] uppercase tracking-[0.5em] text-rose/60"
        >
          A primeira impressão permanece
        </motion.p>

        {/* cortina — vídeo scrubado subindo como uma porta */}
        <motion.div
          style={{ top: curtain }}
          className="absolute inset-x-0 bottom-0 h-full will-change-[top]"
        >
          <ScrollVideo />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(26,0,0,0.55),rgba(26,0,0,0)_38%)]" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-crimson/70 to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------
   SOBRE — apresentação editorial com moldura viva
------------------------------------------------------------ */
function AboutSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-120px' });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ['8%', '-8%']);

  return (
    <section
      ref={ref}
      id="experiencia"
      className="relative overflow-hidden bg-dark py-28 md:py-44"
    >
      <div className="pointer-events-none absolute -right-32 top-0 h-full w-1/2 bg-[linear-gradient(to_left,rgba(62,4,4,0.5),transparent)]" />

      <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-16 px-6 md:px-12 lg:grid-cols-12 lg:gap-10">
        {/* coluna fotográfica */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 1.2, ease: EASE }}
          className="relative lg:col-span-5 lg:col-start-1"
        >
          <div className="relative aspect-[3/4] overflow-hidden">
            <motion.img
              style={{ y: imgY }}
              src="/02-modelofrente.jpg"
              alt="Retrato editorial da Vitória em clima sofisticado"
              loading="lazy"
              className="absolute inset-[-10%] h-[120%] w-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark/60 via-transparent to-transparent" />
          </div>
          {/* moldura deslocada */}
          <div className="pointer-events-none absolute -bottom-5 -left-5 hidden h-40 w-40 border-b border-l border-crimson/50 sm:block" />
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="absolute -right-3 top-8 bg-crimson px-5 py-2 md:-right-8"
          >
            <span className="text-[9px] uppercase tracking-[0.4em] text-cream">
              Atendimento VIP
            </span>
          </motion.div>
        </motion.div>

        {/* coluna editorial */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.25, ease: EASE }}
          className="lg:col-span-6 lg:col-start-7"
        >
          <p className="mb-5 text-[10px] uppercase tracking-[0.45em] text-crimson">
            A anfitriã
          </p>
          <h2 className="font-serif text-[clamp(2.6rem,6vw,5rem)] font-light leading-[1.02] text-cream">
            Discrição é<br />
            <span className="italic text-rose">a arte</span> do encontro
          </h2>
          <div className="my-9 h-px w-24 bg-gradient-to-r from-crimson to-transparent" />
          <p className="max-w-lg text-sm font-light leading-[2] text-cream/60 md:text-base">
            Cada encontro é tratado como uma produção exclusiva: preparação,
            presença e atenção aos detalhes que transformam uma simples companhia
            em uma memória permanente.
          </p>
          <p className="mt-6 max-w-lg text-sm font-light leading-[2] text-cream/45 md:text-base">
            Eventos, jantares, viagens ou conversas que merecem tempo — tudo
            conduzido com elegância natural, sigilo absoluto e uma energia que só
            quem valoriza o extraordinário reconhece.
          </p>

          <ul className="mt-12 grid grid-cols-2 gap-x-8 gap-y-4 border-t border-cream/10 pt-10 sm:grid-cols-3">
            {['Discrição absoluta', 'Presença marcante', 'Atendimento personalizado'].map(
              (t, i) => (
                <motion.li
                  key={t}
                  initial={{ opacity: 0, y: 18 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.7 + i * 0.15, duration: 0.7, ease: EASE }}
                  className="text-[11px] uppercase tracking-[0.18em] text-cream/50"
                >
                  <span className="mr-2 text-crimson">—</span>
                  {t}
                </motion.li>
              )
            )}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------
   SERVIÇOS — lista editorial com reveal em máscara
------------------------------------------------------------ */
const SERVICES = [
  {
    n: '01',
    title: 'Acompanhante',
    tag: 'Eventos · Jantares · Viagens',
    desc: 'Uma companhia sofisticada para ocasiões que pedem presença à altura — do tapete vermelho ao jantar reservado.',
  },
  {
    n: '02',
    title: 'Chamadas de vídeo',
    tag: 'Conexão exclusiva',
    desc: 'Encontros virtuais privados, com atenção integral e um ambiente construído inteiramente ao seu redor.',
  },
  {
    n: '03',
    title: 'Packs exclusivos',
    tag: 'Conteúdo premium',
    desc: 'Material produzido com direção artística própria — qualidade, exclusividade e sigilo em cada envio.',
  },
];

function ServicesSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      ref={ref}
      id="servicos"
      className="relative overflow-hidden bg-burgundy py-28 md:py-40"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(191,0,2,0.18),transparent_60%)]" />

      <div className="relative mx-auto max-w-[1400px] px-6 md:px-12">
        <div className="mb-16 flex flex-col gap-6 md:mb-24 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-4 text-[10px] uppercase tracking-[0.45em] text-rose">
              O que ofereço
            </p>
            <h2 className="font-serif text-[clamp(2.6rem,6vw,5.5rem)] font-light leading-none text-cream">
              Três formas de<br />
              <span className="italic text-crimson-bright">viver o exclusivo</span>
            </h2>
          </div>
          <a
            href="#contato"
            className="group hidden items-center gap-3 text-[11px] uppercase tracking-[0.25em] text-cream/60 transition-colors hover:text-cream md:flex"
          >
            Solicitar informações
            <span className="transition-transform duration-500 group-hover:translate-x-2">→</span>
          </a>
        </div>

        <div>
          {SERVICES.map((s, i) => (
            <ServiceRow key={s.n} service={s} inView={isInView} index={i} />
          ))}
        </div>

        <a
          href="#contato"
          className="group mt-14 inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.25em] text-cream/60 transition-colors hover:text-cream md:hidden"
        >
          Solicitar informações
          <span className="transition-transform duration-500 group-hover:translate-x-2">→</span>
        </a>
      </div>
    </section>
  );
}

function ServiceRow({
  service,
  inView,
  index,
}: {
  service: (typeof SERVICES)[number];
  inView: boolean;
  index: number;
}) {
  return (
    <motion.article
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ delay: 0.2 + index * 0.18, duration: 0.9, ease: EASE }}
      className="group relative border-t border-cream/10 last:border-b"
    >
      <div className="grid cursor-default grid-cols-1 items-baseline gap-4 py-9 md:grid-cols-12 md:gap-8 md:py-12">
        <div className="md:col-span-1">
          <span className="font-serif text-sm text-crimson-bright/50 transition-colors duration-500 group-hover:text-crimson-bright">
            {service.n}
          </span>
        </div>
        <div className="md:col-span-4">
          <div className="overflow-hidden">
            <h3
              className={`font-serif text-3xl font-light text-cream transition-colors duration-500 group-hover:text-rose md:text-5xl ${
                inView ? 'reveal-run' : ''
              }`}
              style={{ animationDelay: `${0.45 + index * 0.18}s` }}
            >
              {service.title}
            </h3>
          </div>
        </div>
        <div className="md:col-span-2">
          <p className="text-[10px] uppercase tracking-[0.2em] text-rose/70">{service.tag}</p>
        </div>
        <div className="md:col-span-4">
          <p className="max-w-md text-sm font-light leading-relaxed text-cream/50 transition-colors duration-500 group-hover:text-cream/75">
            {service.desc}
          </p>
        </div>
        <div className="hidden justify-end md:col-span-1 md:flex">
          <span className="text-cream/20 transition-all duration-500 group-hover:translate-x-2 group-hover:text-crimson-bright">
            →
          </span>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-crimson/[0.04] opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
    </motion.article>
  );
}

/* ------------------------------------------------------------
   MOMENTO DE IMPACTO — frase gigante sobre foto fixa
------------------------------------------------------------ */
function StatementSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [1.25, 1]);
  const imgY = useTransform(scrollYProgress, [0, 1], ['-6%', '6%']);
  const textX = useTransform(scrollYProgress, [0.15, 0.85], ['22%', '-22%']);
  const lineW = useTransform(scrollYProgress, [0.3, 0.7], ['0%', '100%']);

  return (
    <section ref={ref} className="relative h-[190vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        <motion.div style={{ scale, y: imgY }} className="absolute inset-[-6%]">
          <img
            src="/03-modelofrente.jpg"
            alt="Vitória em composição editorial de forte contraste cromático"
            loading="lazy"
            className="h-full w-full object-cover object-center"
          />
        </motion.div>
        <div className="absolute inset-0 bg-dark/60" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(26,0,0,0.85)_100%)]" />

        <motion.div style={{ x: textX }} className="relative z-10 flex h-full items-center">
          <div className="w-full px-6 text-center md:px-16">
            <p className="font-serif text-[clamp(3rem,10.5vw,9.5rem)] font-light italic leading-[0.95] text-cream text-shadow-cinematic">
              O luxo é<br />
              <span className="not-italic text-crimson-bright">ser inesquecível</span>
            </p>
          </div>
        </motion.div>

        <motion.div
          style={{ width: lineW }}
          className="absolute bottom-[14%] left-1/2 z-10 h-px -translate-x-1/2 bg-gradient-to-r from-transparent via-rose/70 to-transparent"
        />
        <p className="absolute bottom-[8%] left-1/2 z-10 -translate-x-1/2 whitespace-nowrap text-[9px] uppercase tracking-[0.5em] text-cream/35">
          Direção · Presença · Memória
        </p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------
   GALERIA — scroll horizontal com parallax interno + lightbox
------------------------------------------------------------ */
const GALLERY = [
  { src: '/02-modelofrente.jpg', alt: 'Composição editorial I', label: 'Ensaio · 01' },
  { src: '/03-modelofrente.jpg', alt: 'Composição editorial II', label: 'Ensaio · 02' },
  { src: '/02-modelofrente.jpg', alt: 'Composição editorial III', label: 'Bastidores · 03' },
  { src: '/03-modelofrente.jpg', alt: 'Composição editorial IV', label: 'Bastidores · 04' },
];

function GallerySection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });
  const x = useTransform(scrollYProgress, [0, 1], ['1%', '-72%']);
  const introOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);
  const railOpacity = useTransform(scrollYProgress, [0, 0.06, 1], [0.4, 1, 1]);

  const [lightbox, setLightbox] = useState<number | null>(null);

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null);
      if (e.key === 'ArrowRight')
        setLightbox((p) => (p === null ? p : (p + 1) % GALLERY.length));
      if (e.key === 'ArrowLeft')
        setLightbox((p) => (p === null ? p : (p - 1 + GALLERY.length) % GALLERY.length));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox]);

  return (
    <>
      <section
        ref={ref}
        id="galeria"
        className="relative h-[320vh] bg-dark"
        aria-label="Galeria editorial"
      >
        <div className="sticky top-0 flex h-screen flex-col overflow-hidden">
          {/* cabeçalho fixo da seção */}
          <div className="relative z-10 flex items-end justify-between px-6 pb-6 pt-24 md:px-12">
            <motion.div style={{ opacity: introOpacity }}>
              <p className="mb-3 text-[10px] uppercase tracking-[0.45em] text-crimson-bright">
                Portfólio visual
              </p>
              <h2 className="font-serif text-5xl font-light text-cream md:text-7xl">
                <span className="italic text-rose">Galeria</span>
              </h2>
            </motion.div>
            <p className="hidden max-w-[220px] text-right text-[10px] uppercase leading-relaxed tracking-[0.2em] text-cream/35 md:block">
              Continue rolando
              <br />
              para percorrer →
            </p>
          </div>

          {/* trilho horizontal */}
          <motion.div
            style={{ x, opacity: railOpacity }}
            className="flex flex-1 items-center gap-5 pl-6 will-change-transform md:gap-10 md:pl-[18vw]"
          >
            {GALLERY.map((g, i) => (
              <GalleryCard
                key={i}
                gallery={g}
                index={i}
                progress={scrollYProgress}
                onOpen={() => setLightbox(i)}
              />
            ))}
            {/* cartão-final: convite */}
            <div className="flex h-[62vh] w-[78vw] shrink-0 items-center justify-center pr-6 md:w-[34vw] md:pr-12">
              <div className="text-center">
                <p className="font-serif text-3xl font-light italic leading-snug text-cream/80 md:text-4xl">
                  O melhor
                  <br />
                  fica privado.
                </p>
                <a
                  href="#contato"
                  className="mt-8 inline-block border-b border-crimson/60 pb-1 text-[10px] uppercase tracking-[0.3em] text-cream/60 transition-colors duration-500 hover:text-cream"
                >
                  Falar comigo →
                </a>
              </div>
            </div>
          </motion.div>

          {/* barra de progresso horizontal */}
          <div className="relative z-10 mx-6 mb-10 h-px bg-cream/10 md:mx-12">
            <motion.div
              style={{ scaleX: scrollYProgress }}
              className="h-full origin-left bg-gradient-to-r from-crimson to-rose"
            />
          </div>
        </div>
      </section>

      {/* LIGHTBOX */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-dark/95 p-4 backdrop-blur-xl md:p-10"
            role="dialog"
            aria-modal="true"
            aria-label="Visualização ampliada da galeria"
            onClick={() => setLightbox(null)}
          >
            <motion.figure
              key={lightbox}
              initial={{ opacity: 0, scale: 0.94, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="relative flex max-h-[82vh] w-full max-w-4xl flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={GALLERY[lightbox].src}
                alt={GALLERY[lightbox].alt}
                className="max-h-[74vh] w-auto object-contain"
              />
              <figcaption className="mt-5 flex w-full items-center justify-between text-[10px] uppercase tracking-[0.3em] text-cream/40">
                <span>{GALLERY[lightbox].label}</span>
                <span>
                  {String(lightbox + 1).padStart(2, '0')} /{' '}
                  {String(GALLERY.length).padStart(2, '0')}
                </span>
              </figcaption>

              <button
                onClick={() =>
                  setLightbox((p) =>
                    p === null ? p : (p - 1 + GALLERY.length) % GALLERY.length
                  )
                }
                aria-label="Imagem anterior"
                className="absolute -left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-cream/15 text-cream/70 transition-all duration-300 hover:border-crimson hover:text-crimson-bright md:-left-16"
              >
                ←
              </button>
              <button
                onClick={() =>
                  setLightbox((p) => (p === null ? p : (p + 1) % GALLERY.length))
                }
                aria-label="Próxima imagem"
                className="absolute -right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-cream/15 text-cream/70 transition-all duration-300 hover:border-crimson hover:text-crimson-bright md:-right-16"
              >
                →
              </button>
              <button
                onClick={() => setLightbox(null)}
                aria-label="Fechar visualização"
                className="absolute -top-2 right-0 text-[10px] uppercase tracking-[0.25em] text-cream/45 transition-colors hover:text-cream md:-top-8"
              >
                Fechar ✕
              </button>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function GalleryCard({
  gallery,
  index,
  progress,
  onOpen,
}: {
  gallery: (typeof GALLERY)[number];
  index: number;
  progress: ReturnType<typeof useScroll>['scrollYProgress'];
  onOpen: () => void;
}) {
  // parallax interno: a imagem desloca-se mais devagar que o cartão
  const inner = useTransform(progress, [0, 1], ['10%', '-10%']);
  const tall = index % 2 === 0;
  const hostRef = useRef<HTMLButtonElement>(null);
  const enter = useInView(hostRef, { once: true, margin: '0px 0px 0px -5%' });

  return (
    <motion.button
      ref={hostRef}
      initial={{ opacity: 0, y: 60 }}
      animate={enter ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1, delay: (index % 2) * 0.1, ease: EASE }}
      onClick={onOpen}
      data-cursor
      aria-label={`Ampliar ${gallery.alt}`}
      className={`group relative shrink-0 overflow-hidden text-left ${
        tall ? 'h-[68vh] w-[78vw] md:w-[42vw]' : 'h-[52vh] w-[70vw] self-end md:w-[30vw]'
      }`}
    >
      <motion.img
        style={{ x: inner }}
        src={gallery.src}
        alt={gallery.alt}
        loading="lazy"
        className="absolute inset-[-8%] h-full w-[116%] object-cover object-top transition-transform duration-[1400ms] ease-out group-hover:scale-[1.04]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-dark/70 via-transparent to-transparent opacity-70 transition-opacity duration-700 group-hover:opacity-40" />
      <div className="absolute inset-0 border border-cream/0 transition-colors duration-500 group-hover:border-rose/30" />
      <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-5">
        <span className="translate-y-2 text-[9px] uppercase tracking-[0.35em] text-cream/70 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          {gallery.label}
        </span>
        <span className="font-serif text-lg text-cream/50">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>
    </motion.button>
  );
}

/* ------------------------------------------------------------
   CONTATO — agendamento (objetivo central da página)
------------------------------------------------------------ */
function ContactSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section
      ref={ref}
      id="contato"
      className="bg-gradient-contact relative overflow-hidden py-28 md:py-44"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(191,0,2,0.12),transparent_65%)]" />

      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.1, ease: EASE }}
        >
          <p className="mb-6 text-[10px] uppercase tracking-[0.5em] text-rose">Agenda aberta</p>
          <h2 className="font-serif text-[clamp(2.8rem,7vw,5.5rem)] font-light leading-[1.02] text-cream">
            Reserve o seu<br />
            <span className="italic text-crimson-bright">horário exclusivo</span>
          </h2>
          <p className="mx-auto mt-8 max-w-md text-sm font-light leading-[2] text-cream/55">
            Atendimentos organizados por agenda prévia. Envie uma mensagem discreta
            para verificar disponibilidade e combinar todos os detalhes.
          </p>

          <div className="mt-14 flex flex-col items-center justify-center gap-4 sm:flex-row">
            {/* CTA WhatsApp — demonstrativo até receber número real */}
            <button
              type="button"
              aria-label="Agendar por WhatsApp (demonstração — número ainda não informado)"
              title="Demonstração visual — conectaremos ao seu número real"
              className="btn-premium demo-cta flex w-full items-center justify-center gap-3 bg-crimson px-12 py-5 text-[11px] uppercase tracking-[0.28em] text-cream transition-all duration-500 hover:bg-[#d40003] sm:w-auto"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.214 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              Agendar horário
            </button>
            <a
              href="#redes"
              className="w-full border border-cream/15 px-12 py-5 text-[11px] uppercase tracking-[0.28em] text-cream/75 transition-all duration-500 hover:border-rose/50 hover:text-rose sm:w-auto"
            >
              Falar por mensagem
            </a>
          </div>
          <p className="demo-note mt-4 text-[9px] uppercase tracking-[0.3em] text-cream/25">
            Botão de demonstração — será conectado ao número oficial
          </p>

          <div id="redes" className="mx-auto mt-20 h-px w-16 bg-cream/10" />

          {/* redes e plataformas — links reais entram aqui na entrega final */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
            {[
              { name: 'Instagram', note: 'Adicionar perfil' },
              { name: 'OnlyFans', note: 'Adicionar perfil' },
              { name: 'Privacy', note: 'Adicionar perfil' },
            ].map((p) => (
              <a
                key={p.name}
                href="#redes"
                title={`${p.name} — exemplo (link real será adicionado)`}
                className="group flex flex-col items-center gap-1"
              >
                <span className="text-[11px] uppercase tracking-[0.3em] text-cream/45 transition-colors duration-300 group-hover:text-rose">
                  {p.name}
                </span>
                <span className="h-px w-0 bg-rose transition-all duration-500 group-hover:w-full" />
                <span className="text-[8px] uppercase tracking-[0.25em] text-cream/20">
                  {p.note}
                </span>
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------
   FAIXA INFINITA — ritmo entre blocos
------------------------------------------------------------ */
function MarqueeStrip() {
  const items = [
    'Acompanhante de luxo',
    'Chamadas de vídeo',
    'Packs exclusivos',
    'Atendimento VIP',
  ];
  const row = [...items, ...items];
  return (
    <div className="marquee overflow-hidden border-y border-cream/[0.07] bg-dark py-6" aria-hidden="true">
      <div className="marquee-track flex w-max items-center gap-14">
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-14">
            <span className="whitespace-nowrap font-serif text-2xl font-light italic text-cream/25 md:text-3xl">
              {t}
            </span>
            <span className="text-crimson">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------
   FOOTER
------------------------------------------------------------ */
function Footer() {
  return (
    <footer className="border-t border-cream/[0.06] bg-dark px-6 py-12 md:px-12">
      <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-6 md:flex-row">
        <p className="font-serif text-2xl text-cream/40">
          <span className="italic text-crimson">V</span>itória
        </p>
        <p className="text-[9px] uppercase tracking-[0.3em] text-cream/20">
          © {new Date().getFullYear()} · Todos os direitos reservados · Conteúdo +18
        </p>
        <p className="text-[9px] uppercase tracking-[0.35em] text-rose/40">
          Experiência premium
        </p>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------
   APP
------------------------------------------------------------ */
export default function App() {
  const [scrolled, setScrolled] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 80);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    document.body.style.overflow = loading ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [loading]);

  const handleLoadingComplete = useCallback(() => setLoading(false), []);

  const { scrollYProgress } = useScroll();
  const progressScale = useSpring(scrollYProgress, { stiffness: 120, damping: 28 });

  return (
    <div className="relative min-h-screen bg-dark">
      <AnimatePresence>
        {loading && <LoadingScreen onComplete={handleLoadingComplete} />}
      </AnimatePresence>

      {!loading && (
        <>
          <div className="noise-overlay" aria-hidden="true" />
          <CustomCursor />
          <motion.div
            style={{ scaleX: progressScale }}
            className="scroll-progress origin-left"
            aria-hidden="true"
          />
          <Navigation scrolled={scrolled} />

          <main>
            <HeroSection />
            <CurtainReveal />
            <AboutSection />
            <ServicesSection />
            <MarqueeStrip />
            <StatementSection />
            <GallerySection />
            <ContactSection />
          </main>

          <Footer />
        </>
      )}
    </div>
  );
}
