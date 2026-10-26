const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const header = document.querySelector('[data-header]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const nav = document.querySelector('[data-nav]');
const form = document.querySelector('[data-interest-form]');
const success = document.querySelector('.form-success');
const root = document.documentElement;
const heroScene = document.querySelector('[data-scroll-scene]');
const journeyScene = document.querySelector('[data-scroll-journey]');
const sceneFrame = document.querySelector('.visual-frame');
const chapterLabel = document.querySelector('[data-scroll-chapter]');
const percentLabel = document.querySelector('[data-scroll-percent]');
const progressLine = document.querySelector('[data-scroll-line]');
const journeyLabel = document.querySelector('[data-journey-label]');
let rafId = 0;

const setMenuState = (open) => {
  menuToggle?.setAttribute('aria-expanded', String(open));
  menuToggle?.querySelector('.sr-only')?.replaceChildren(document.createTextNode(open ? 'Fechar menu' : 'Abrir menu'));
  nav?.classList.toggle('is-open', open);
  document.body.classList.toggle('menu-open', open);
};

const setHeaderState = () => {
  header?.classList.toggle('is-scrolled', window.scrollY > 18);
};

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

const updateCinematicScene = () => {
  rafId = 0;
  const viewportHeight = window.innerHeight || 1;
  const heroRect = heroScene?.getBoundingClientRect();
  const journeyRect = journeyScene?.getBoundingClientRect();
  const heroRange = Math.max((heroScene?.offsetHeight || viewportHeight) - viewportHeight, 1);
  const journeyRange = Math.max((journeyScene?.offsetHeight || viewportHeight) - viewportHeight, 1);
  const heroProgress = clamp(-(heroRect?.top || 0) / heroRange);
  const journeyProgress = clamp(-(journeyRect?.top || 0) / journeyRange);
  const pageProgress = clamp(window.scrollY / Math.max(document.documentElement.scrollHeight - viewportHeight, 1));

  root.style.setProperty('--scroll-progress', heroProgress.toFixed(4));
  root.style.setProperty('--journey-progress', journeyProgress.toFixed(4));
  root.style.setProperty('--page-progress', pageProgress.toFixed(4));
  percentLabel?.replaceChildren(document.createTextNode(String(Math.round(pageProgress * 100)).padStart(2, '0')));
  progressLine?.style.setProperty('transform', `scaleY(${pageProgress})`);

  const sections = [...document.querySelectorAll('[data-chapter]')];
  const active = sections.reduce((current, section) => {
    const distance = Math.abs(section.getBoundingClientRect().top - viewportHeight * 0.34);
    return distance < current.distance ? { distance, section } : current;
  }, { distance: Infinity, section: sections[0] });
  if (active.section && chapterLabel) chapterLabel.textContent = active.section.dataset.chapter;

  const stepProgress = journeyProgress * 1.38;
  journeyScene?.querySelectorAll('.journey-step').forEach((step, index) => {
    const local = clamp((stepProgress - index * 0.19) / 0.68);
    step.style.setProperty('--step-progress', local.toFixed(4));
  });
  if (journeyLabel) {
    const labels = ['03 / JORNADA', '03 / AVALIAR', '03 / ORGANIZAR', '03 / ESCOLHER', '03 / REVISAR'];
    journeyLabel.textContent = labels[Math.min(4, Math.floor(journeyProgress * 5))];
  }
};

const requestCinematicFrame = () => {
  if (!rafId) rafId = window.requestAnimationFrame(updateCinematicScene);
};

setHeaderState();
window.addEventListener('scroll', setHeaderState, { passive: true });
window.addEventListener('scroll', requestCinematicFrame, { passive: true });
window.addEventListener('resize', requestCinematicFrame, { passive: true });
requestCinematicFrame();

if (sceneFrame && !prefersReducedMotion) {
  sceneFrame.addEventListener('pointermove', (event) => {
    const bounds = sceneFrame.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    sceneFrame.style.setProperty('--pointer-x', x.toFixed(3));
    sceneFrame.style.setProperty('--pointer-y', y.toFixed(3));
  });
  sceneFrame.addEventListener('pointerleave', () => {
    sceneFrame.style.setProperty('--pointer-x', '0');
    sceneFrame.style.setProperty('--pointer-y', '0');
  });
}

menuToggle?.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  setMenuState(!isOpen);
});

nav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    setMenuState(false);
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuToggle?.getAttribute('aria-expanded') === 'true') setMenuState(false);
});

const revealItems = document.querySelectorAll('.reveal');
if (prefersReducedMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        currentObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  revealItems.forEach((item) => observer.observe(item));
}

const formError = (field, message = '') => {
  const error = document.querySelector(`[data-error-for="${field.name}"]`);
  field.classList.toggle('has-error', Boolean(message));
  field.setAttribute('aria-invalid', String(Boolean(message)));
  if (error) error.textContent = message;
};

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = form.elements.name;
  const email = form.elements.email;
  const simulation = form.elements.simulation;
  let valid = true;

  if (!name.value.trim()) {
    formError(name, 'Digite seu nome para continuar.');
    valid = false;
  } else formError(name);

  if (!email.validity.valid) {
    formError(email, 'Digite um e-mail válido para a simulação.');
    valid = false;
  } else formError(email);

  if (!simulation.checked) {
    simulation.closest('.consent')?.classList.add('has-error');
    formError(simulation, 'Confirme que este envio é apenas uma simulação.');
    valid = false;
  } else {
    simulation.closest('.consent')?.classList.remove('has-error');
    formError(simulation);
  }

  if (!valid) return;

  form.querySelectorAll('input, select, button').forEach((control) => { control.disabled = true; });
  form.querySelector('[data-success-name]').textContent = name.value.trim().split(' ')[0];
  success.hidden = false;
  success.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'nearest' });
});

form?.querySelectorAll('input, select').forEach((field) => {
  field.addEventListener('input', () => formError(field));
  field.addEventListener('change', () => {
    formError(field);
    field.closest('.consent')?.classList.remove('has-error');
  });
});
