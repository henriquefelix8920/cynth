import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView, AnimatePresence } from 'framer-motion';

function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) { clearInterval(interval); setTimeout(onComplete, 500); return 100; }
        return prev + 2;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [onComplete]);
  return (
    <motion.div exit={{ opacity: 0, scale: 1.05 }} transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }} className="fixed inset-0 z-[9999] bg-dark flex flex-col items-center justify-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center">
        <h1 className="font-serif text-4xl md:text-5xl font-light text-cream mb-8 tracking-wider"><span className="text-crimson">E</span>xclusiva</h1>
        <div className="w-48 h-px bg-cream/10 mx-auto overflow-hidden"><motion.div className="h-full bg-gradient-to-r from-crimson to-rose" style={{ width: `${progress}%` }} /></div>
        <p className="text-cream/30 text-[10px] tracking-[0.4em] uppercase mt-4">Carregando experiência</p>
      </motion.div>
    </motion.div>
  );
}

function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      const handleMouseMove = (e: MouseEvent) => {
        if (glowRef.current) { glowRef.current.style.left = `${e.clientX}px`; glowRef.current.style.top = `${e.clientY}px`; }
      };
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);
  return <div ref={glowRef} className="cursor-glow hidden md:block" />;
}

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  return <motion.div className="scroll-progress origin-left" style={{ scaleX }} />;
}

function Navigation({ scrolled }: { scrolled: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
      <motion.nav initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1, delay: 1.5 }} className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 ${scrolled ? 'py-3 glass-subtle' : 'py-6 bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <motion.a href="#" className="font-serif text-2xl md:text-3xl font-light tracking-wider text-cream" whileHover={{ scale: 1.02 }}><span className="text-crimson">E</span>xclusiva</motion.a>
          <div className="hidden md:flex items-center gap-10">
            {['Experiência', 'Galeria', 'Contato'].map((item) => (<a key={item} href={`#${item.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}`} className="relative text-sm font-light tracking-widest uppercase text-cream/70 hover:text-cream transition-colors duration-300 group">{item}<span className="absolute bottom-0 left-0 w-0 h-px bg-crimson group-hover:w-full transition-all duration-500" /></a>))}
            <a href="#contato" className="px-6 py-2.5 border border-crimson/50 text-sm tracking-widest uppercase text-cream hover:bg-crimson/10 hover:border-crimson transition-all duration-500">Agendar</a>
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden flex flex-col gap-1.5 p-2" aria-label="Menu">
            <motion.span animate={menuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }} className="w-6 h-px bg-cream block" />
            <motion.span animate={menuOpen ? { opacity: 0 } : { opacity: 1 }} className="w-6 h-px bg-cream block" />
            <motion.span animate={menuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }} className="w-6 h-px bg-cream block" />
          </button>
        </div>
      </motion.nav>
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="fixed inset-0 z-[99] bg-dark/98 backdrop-blur-xl flex flex-col items-center justify-center gap-8 md:hidden">
            {['Experiência', 'Galeria', 'Contato'].map((item, i) => (<motion.a key={item} href={`#${item.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} onClick={() => setMenuOpen(false)} className="font-serif text-4xl font-light text-cream/80 hover:text-crimson transition-colors">{item}</motion.a>))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [videoError, setVideoError] = useState(false);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.4]);
  const videoY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const videoOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, 250]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 0.6, 0.95]);
  const titleScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.2]);
  return (
    <section ref={heroRef} className="relative h-[250vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        <motion.div style={{ scale: videoScale, y: videoY, opacity: videoOpacity }} className="absolute inset-0 w-full h-full">
          {!videoError ? (<video autoPlay muted loop playsInline className="w-full h-full object-cover" onError={() => setVideoError(true)}><source src="/01-video.mp4" type="video/mp4" /></video>) : (<div className="w-full h-full bg-gradient-to-br from-burgundy via-dark to-burgundy"><div className="absolute inset-0 opacity-30"><div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_rgba(191,0,2,0.3)_0%,_transparent_70%)]" /></div></div>)}
        </motion.div>
        <motion.div style={{ opacity: overlayOpacity }} className="absolute inset-0 bg-dark" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(26,0,0,0.6)_100%)] pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-[6%] md:h-[8%] bg-dark z-10" />
        <div className="absolute bottom-0 left-0 right-0 h-[6%] md:h-[8%] bg-dark z-10" />
        <motion.div style={{ y: textY, opacity: textOpacity }} className="relative z-20 h-full flex flex-col items-center justify-center px-6">
          <motion.div style={{ scale: titleScale }} className="text-center">
            <motion.p initial={{ opacity: 0, letterSpacing: '0.1em' }} animate={{ opacity: 1, letterSpacing: '0.4em' }} transition={{ duration: 1.5, delay: 0.5 }} className="text-rose/70 text-[10px] md:text-xs uppercase mb-8 font-light">Experiência Exclusiva</motion.p>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-[8rem] font-light text-cream leading-[0.85] mb-8">
              <motion.span initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.8 }} className="block">Momentos</motion.span>
              <motion.span initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 1.1 }} className="block italic text-crimson">Únicos</motion.span>
            </h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1.6 }} className="text-cream/50 text-xs md:text-sm font-light max-w-sm mx-auto leading-relaxed tracking-wide">Uma experiência sofisticada desenhada para quem aprecia o extraordinário</motion.p>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.8, duration: 1 }} className="absolute bottom-[10%] left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
            <span className="text-cream/30 text-[9px] tracking-[0.4em] uppercase">Scroll</span>
            <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }} className="w-px h-10 bg-gradient-to-b from-crimson/80 to-transparent" />
          </motion.div>
        </motion.div>
        <motion.div initial={{ height: 0 }} animate={{ height: '30%' }} transition={{ duration: 2, delay: 2 }} className="absolute left-6 md:left-12 top-1/2 -translate-y-1/2 w-px bg-gradient-to-b from-transparent via-crimson/30 to-transparent hidden md:block" />
        <motion.div initial={{ height: 0 }} animate={{ height: '30%' }} transition={{ duration: 2, delay: 2.2 }} className="absolute right-6 md:right-12 top-1/2 -translate-y-1/2 w-px bg-gradient-to-b from-transparent via-crimson/30 to-transparent hidden md:block" />
      </div>
    </section>
  );
}

function CinematicTransition() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const imageScale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [1.3, 1, 1, 0.9]);
  const imageClip = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], ["inset(20% 0%)", "inset(0% 0%)", "inset(0% 0%)", "inset(10% 0%)"]);
  const textX = useTransform(scrollYProgress, [0.2, 0.5], [-100, 0]);
  const textOpacity = useTransform(scrollYProgress, [0.2, 0.45], [0, 1]);
  const lineScale = useTransform(scrollYProgress, [0.3, 0.6], [0, 1]);
  return (
    <section ref={sectionRef} className="relative h-[120vh] overflow-hidden">
      <div className="sticky top-0 h-screen overflow-hidden">
        <motion.div style={{ scale: imageScale, clipPath: imageClip }} className="absolute inset-0">
          <img src="/02-fotofrente.jpg" alt="Apresentação" className="w-full h-full object-cover object-top" />
          <div className="absolute inset-0 bg-gradient-to-r from-dark/95 via-dark/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-dark via-transparent to-dark/60" />
        </motion.div>
        <div className="relative z-10 h-full flex items-center px-6 md:px-16 lg:px-24">
          <motion.div style={{ x: textX, opacity: textOpacity }} className="max-w-xl">
            <motion.span className="text-crimson text-[10px] md:text-xs tracking-[0.4em] uppercase block mb-4">Sobre</motion.span>
            <h2 className="font-serif text-4xl md:text-6xl lg:text-8xl font-light text-cream leading-[1.05] mb-8">Presença que<br /><span className="italic text-rose">marca</span></h2>
            <motion.div style={{ scaleX: lineScale }} className="w-20 h-px bg-crimson mb-8 origin-left" />
            <p className="text-cream/60 text-sm md:text-base font-light leading-[1.9] max-w-md">Elegância, sofisticação e uma energia magnética que transforma cada encontro em uma memória inesquecível.</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function AboutSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <section ref={ref} id="experiencia" className="relative py-32 md:py-48 px-6 md:px-12 bg-dark">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-burgundy/10 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-crimson/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        <motion.div initial={{ opacity: 0, x: -60 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }} className="relative">
          <div className="relative aspect-[3/4] overflow-hidden">
            <img src="/03-fotofrente.jpg" alt="Apresentação" className="w-full h-full object-cover object-top" />
            <div className="absolute inset-0 bg-gradient-to-t from-dark/50 via-transparent to-transparent" />
          </div>
          <div className="absolute -top-4 -left-4 w-20 h-20 border-t border-l border-crimson/30" />
          <div className="absolute -bottom-4 -right-4 w-20 h-20 border-b border-r border-crimson/30" />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.8, duration: 0.8 }} className="absolute -bottom-6 -right-6 md:right-auto md:-left-6 glass-subtle px-6 py-3"><p className="text-cream/80 text-[10px] tracking-[0.3em] uppercase">Premium</p></motion.div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 1, delay: 0.3 }} className="space-y-8">
          <div><span className="text-crimson text-[10px] tracking-[0.4em] uppercase">Quem sou</span></div>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-light text-cream leading-[1.1]">Uma experiência<br /><span className="italic text-rose">além do comum</span></h2>
          <div className="w-20 h-px bg-gradient-to-r from-crimson to-transparent" />
          <p className="text-cream/60 font-light leading-[1.9] text-sm md:text-base">Cada momento é pensado nos mínimos detalhes. Da primeira mensagem ao último olhar, tudo é conduzido com elegância, discrição e uma atenção exclusiva que só quem valoriza o extraordinário pode compreender.</p>
          <p className="text-cream/50 font-light leading-[1.9] text-sm md:text-base">Minha presença é marcada pela sofisticação natural, conversas envolventes e uma energia que transforma qualquer ocasião em algo memorável.</p>
          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-cream/10">
            <div><p className="font-serif text-2xl md:text-3xl text-crimson">VIP</p><p className="text-cream/40 text-[10px] tracking-wider uppercase mt-1">Atendimento</p></div>
            <div><p className="font-serif text-2xl md:text-3xl text-crimson">100%</p><p className="text-cream/40 text-[10px] tracking-wider uppercase mt-1">Discreta</p></div>
            <div><p className="font-serif text-2xl md:text-3xl text-crimson">★</p><p className="text-cream/40 text-[10px] tracking-wider uppercase mt-1">Exclusiva</p></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ServicesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const services = [{ title: "Acompanhante", subtitle: "Presença Exclusiva", description: "Eventos, jantares, viagens. Uma companhia sofisticada para momentos que merecem ser vividos com intensidade e elegância.", number: "01" }, { title: "Video Call", subtitle: "Conexão Virtual", description: "Encontros virtuais exclusivos com atenção total e inteira. Uma experiência íntima e personalizada no conforto do seu espaço.", number: "02" }, { title: "Conteúdo", subtitle: "Packs Exclusivos", description: "Material fotográfico premium produzido com direção artística. Conteúdo único para quem aprecia qualidade e exclusividade.", number: "03" }];
  return (
    <section ref={ref} className="relative py-32 md:py-48 px-6 md:px-12 bg-gradient-dark overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]"><div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-crimson blur-[150px]" /><div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-rose blur-[100px]" /></div>
      <div className="max-w-7xl mx-auto relative">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 1 }} className="text-center mb-20 md:mb-32"><span className="text-crimson text-[10px] tracking-[0.4em] uppercase block mb-4">Experiências</span><h2 className="font-serif text-4xl md:text-6xl lg:text-7xl font-light text-cream">O que <span className="italic text-rose">ofereço</span></h2></motion.div>
        <div className="space-y-0">
          {services.map((service, index) => (<motion.div key={service.title} initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: index * 0.15 }} className="group relative border-t border-cream/10 last:border-b"><div className="py-10 md:py-14 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-center cursor-default"><div className="md:col-span-1"><span className="text-crimson/40 font-serif text-lg group-hover:text-crimson transition-colors duration-500">{service.number}</span></div><div className="md:col-span-3"><h3 className="font-serif text-2xl md:text-3xl font-light text-cream group-hover:text-rose transition-colors duration-500">{service.title}</h3></div><div className="md:col-span-2"><p className="text-cream/40 text-xs tracking-[0.15em] uppercase">{service.subtitle}</p></div><div className="md:col-span-5"><p className="text-cream/50 text-sm font-light leading-relaxed group-hover:text-cream/70 transition-colors duration-500">{service.description}</p></div><div className="hidden md:flex md:col-span-1 justify-end"><motion.span className="text-cream/20 group-hover:text-crimson group-hover:translate-x-2 transition-all duration-500">→</motion.span></div></div><div className="absolute inset-0 bg-crimson/0 group-hover:bg-crimson/[0.02] transition-all duration-700 pointer-events-none" /></motion.div>))}
        </div>
        <motion.div initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 1, duration: 0.8 }} className="text-center mt-16"><a href="#contato" className="inline-block text-cream/50 text-xs tracking-[0.3em] uppercase hover:text-crimson transition-colors duration-500 border-b border-cream/10 hover:border-crimson/30 pb-1">Solicitar informações →</a></motion.div>
      </div>
    </section>
  );
}

function CinematicMoment() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [0.85, 1, 1, 1.15]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const textScale = useTransform(scrollYProgress, [0.2, 0.5], [0.7, 1]);
  const textOpacity = useTransform(scrollYProgress, [0.2, 0.4], [0, 1]);
  const rotate = useTransform(scrollYProgress, [0, 1], [-2, 2]);
  return (
    <section ref={sectionRef} className="relative h-[160vh]">
      <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center">
        <motion.div style={{ scale, opacity, rotate }} className="absolute inset-[-5%]">
          <img src="https://image.qwenlm.ai/generated-images/19609062-4991-48b6-8239-27f3c021f9cb/_result.png" alt="Ambiente cinematográfico" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-dark/50" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgba(26,0,0,0.7)_100%)]" />
        </motion.div>
        <motion.div style={{ scale: textScale, opacity: textOpacity }} className="relative z-10 text-center px-6">
          <p className="font-serif text-5xl md:text-7xl lg:text-[9rem] font-light text-cream leading-[0.9]">Cada detalhe<br /><span className="italic text-crimson">importa</span></p>
          <motion.div initial={{ width: 0 }} whileInView={{ width: '80px' }} viewport={{ once: true }} transition={{ duration: 1.5, delay: 0.5 }} className="h-px bg-crimson mx-auto mt-8" />
        </motion.div>
      </div>
    </section>
  );
}

function GallerySection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const galleryImages = [{ src: "/02-fotofrente.jpg", alt: "Galeria 1", span: "row-span-2" }, { src: "/03-fotofrente.jpg", alt: "Galeria 2", span: "row-span-1" }, { src: "https://image.qwenlm.ai/generated-images/3eea652f-563e-4b70-86d2-2f8885642e5d/_result.png", alt: "Galeria 3", span: "row-span-1" }, { src: "https://image.qwenlm.ai/generated-images/974ebdfc-7ff2-4015-bad2-dfd1d49ce57f/_result.png", alt: "Galeria 4", span: "row-span-2" }, { src: "https://image.qwenlm.ai/generated-images/ab547c9b-1444-4a49-93b3-46995b295d7f/_result.png", alt: "Galeria 5", span: "row-span-1" }, { src: "https://image.qwenlm.ai/generated-images/19609062-4991-48b6-8239-27f3c021f9cb/_result.png", alt: "Galeria 6", span: "row-span-1" }];
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -40]);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImage === null) return;
      if (e.key === 'Escape') setSelectedImage(null);
      if (e.key === 'ArrowRight') setSelectedImage(prev => prev !== null ? (prev + 1) % galleryImages.length : null);
      if (e.key === 'ArrowLeft') setSelectedImage(prev => prev !== null ? (prev - 1 + galleryImages.length) % galleryImages.length : null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, galleryImages.length]);
  return (
    <section ref={ref} id="galeria" className="relative py-32 md:py-48 px-6 md:px-12 bg-dark overflow-hidden">
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1 }} className="text-center mb-20"><span className="text-crimson text-[10px] tracking-[0.4em] uppercase block mb-4">Portfólio Visual</span><h2 className="font-serif text-4xl md:text-6xl lg:text-7xl font-light text-cream"><span className="italic text-rose">Galeria</span></h2></motion.div>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 auto-rows-[180px] md:auto-rows-[260px]">
          {galleryImages.map((image, index) => (<motion.div key={index} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, delay: index * 0.1 }} className={`${image.span} relative overflow-hidden cursor-pointer group`} onClick={() => setSelectedImage(index)}><motion.div style={index % 2 === 0 ? { y: y1 } : { y: y2 }} className="absolute inset-[-10%]"><img src={image.src} alt={image.alt} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" /></motion.div><div className="absolute inset-0 bg-dark/0 group-hover:bg-dark/20 transition-all duration-500" /><div className="absolute inset-0 border border-transparent group-hover:border-crimson/20 transition-all duration-500" /><div className="absolute inset-0 flex items-end justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500"><span className="text-cream/70 text-[10px] font-light tracking-wider">{String(index + 1).padStart(2, '0')}</span></div></motion.div>))}
        </div>
      </div>
      <AnimatePresence>
        {selectedImage !== null && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="fixed inset-0 z-[200] bg-dark/97 backdrop-blur-2xl flex items-center justify-center p-4 md:p-8" onClick={() => setSelectedImage(null)}><motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }} className="relative max-w-5xl max-h-[85vh] w-full" onClick={(e) => e.stopPropagation()}><img src={galleryImages[selectedImage].src} alt={galleryImages[selectedImage].alt} className="w-full h-full object-contain" /><button onClick={(e) => { e.stopPropagation(); setSelectedImage(selectedImage > 0 ? selectedImage - 1 : galleryImages.length - 1); }} className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center border border-cream/20 text-cream/70 hover:border-crimson hover:text-crimson transition-all duration-300" aria-label="Anterior">←</button><button onClick={(e) => { e.stopPropagation(); setSelectedImage(selectedImage < galleryImages.length - 1 ? selectedImage + 1 : 0); }} className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center border border-cream/20 text-cream/70 hover:border-crimson hover:text-crimson transition-all duration-300" aria-label="Próxima">→</button><button onClick={() => setSelectedImage(null)} className="absolute -top-8 md:-top-12 right-0 text-cream/50 hover:text-cream text-xs tracking-wider uppercase transition-colors" aria-label="Fechar">Fechar ✕</button><div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-cream/40 text-[10px] tracking-[0.3em]">{String(selectedImage + 1).padStart(2, '0')} / {String(galleryImages.length).padStart(2, '0')}</div></motion.div></motion.div>)}
      </AnimatePresence>
    </section>
  );
}

function ContactSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <section ref={ref} id="contato" className="relative py-32 md:py-48 px-6 md:px-12 bg-dark overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-crimson/[0.04] blur-[200px]" /></div>
      <div className="max-w-4xl mx-auto relative text-center">
        <motion.div initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 1 }}>
          <span className="text-crimson text-[10px] tracking-[0.4em] uppercase block mb-6">Contato</span>
          <h2 className="font-serif text-4xl md:text-6xl lg:text-7xl font-light text-cream leading-[1.1] mb-8">Vamos criar um<br /><span className="italic text-rose">momento único?</span></h2>
          <p className="text-cream/50 font-light text-sm md:text-base max-w-lg mx-auto leading-[1.9] mb-14">Entre em contato para saber mais sobre disponibilidade e agendar sua experiência exclusiva. Discrição e elegância garantidas.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <motion.a href="#contato" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="px-12 py-4 bg-crimson text-cream text-xs tracking-[0.2em] uppercase font-light hover:bg-crimson/90 transition-all duration-500 animate-pulse-glow">Agendar Horário</motion.a>
            <motion.a href="#galeria" whileHover={{ scale: 1.03 }} className="px-12 py-4 border border-cream/15 text-cream/80 text-xs tracking-[0.2em] uppercase font-light hover:border-crimson/40 hover:text-crimson transition-all duration-500">Ver Galeria</motion.a>
          </div>
          <div className="w-16 h-px bg-cream/10 mx-auto mb-12" />
          <div className="flex items-center justify-center gap-8 mb-10">
            <a href="#" className="text-cream/30 hover:text-crimson transition-colors duration-300 group" aria-label="Instagram" title="Instagram — exemplo"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg></a>
            <a href="#" className="text-cream/30 hover:text-crimson transition-colors duration-300" aria-label="Twitter" title="Twitter — exemplo"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>
            <a href="#" className="text-cream/30 hover:text-crimson transition-colors duration-300" aria-label="Telegram" title="Telegram — exemplo"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg></a>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10">
            <a href="#" className="text-cream/30 hover:text-rose text-[10px] tracking-[0.25em] uppercase transition-colors duration-300 border-b border-cream/5 hover:border-rose/20 pb-1" title="OnlyFans — exemplo">OnlyFans — exemplo</a>
            <a href="#" className="text-cream/30 hover:text-rose text-[10px] tracking-[0.25em] uppercase transition-colors duration-300 border-b border-cream/5 hover:border-rose/20 pb-1" title="Privacy — exemplo">Privacy — exemplo</a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative py-12 px-6 border-t border-cream/5 bg-dark">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="font-serif text-xl text-cream/30"><span className="text-crimson/60">E</span>xclusiva</p>
        <p className="text-cream/20 text-[10px] tracking-[0.2em]">© {new Date().getFullYear()} — Todos os direitos reservados</p>
        <p className="text-cream/15 text-[9px] tracking-[0.3em] uppercase">Experiência Premium</p>
      </div>
    </footer>
  );
}

export default function App() {
  const [scrolled, setScrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const handleScroll = useCallback(() => { setScrolled(window.scrollY > 100); }, []);
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);
  const handleLoadingComplete = useCallback(() => { setLoading(false); }, []);
  return (
    <div className="relative bg-dark min-h-screen">
      <AnimatePresence>{loading && <LoadingScreen onComplete={handleLoadingComplete} />}</AnimatePresence>
      <div className="noise-overlay" />
      {!loading && <CursorGlow />}
      {!loading && <ScrollProgress />}
      {!loading && <Navigation scrolled={scrolled} />}
      {!loading && (<main><HeroSection /><CinematicTransition /><AboutSection /><ServicesSection /><CinematicMoment /><GallerySection /><ContactSection /></main>)}
      {!loading && <Footer />}
    </div>
  );
}
