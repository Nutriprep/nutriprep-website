// NutriPrep Webseite – kleine Helfer. Keine Cookies, kein Tracking.

const root = document.documentElement;
const merken = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* privater Modus */ } };
const lesen = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };

// ---------- Sprache ----------
const setzeSprache = (lang) => {
  root.dataset.lang = lang;
  root.lang = lang;
  document.querySelectorAll('[data-title-' + lang + ']').forEach((el) => { document.title = el.getAttribute('data-title-' + lang); });
  document.querySelectorAll('img[data-alt-en]').forEach((el) => {
    if (!el.dataset.altDe) el.dataset.altDe = el.alt;
    el.alt = lang === 'en' ? el.dataset.altEn : el.dataset.altDe;
  });
  document.querySelectorAll('.lang-btn').forEach((b) => { b.textContent = lang === 'de' ? 'EN' : 'DE'; b.setAttribute('aria-label', lang === 'de' ? 'Switch to English' : 'Auf Deutsch wechseln'); });
};
const gemerkt = lesen('np-lang');
setzeSprache(gemerkt || (/^de\b/i.test(navigator.language || 'de') ? 'de' : 'en'));
document.querySelectorAll('.lang-btn').forEach((b) => b.addEventListener('click', () => {
  const neu = root.dataset.lang === 'de' ? 'en' : 'de';
  setzeSprache(neu);
  merken('np-lang', neu);
}));

// ---------- Hell / Dunkel ----------
const thema = lesen('np-theme');
if (thema) root.dataset.theme = thema;
document.querySelectorAll('.theme-btn').forEach((b) => b.addEventListener('click', () => {
  const istDunkel = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  root.dataset.theme = istDunkel ? 'light' : 'dark';
  merken('np-theme', root.dataset.theme);
}));

// ---------- Kopfzeile bekommt beim Scrollen eine Linie ----------
const kopf = document.querySelector('.top');
const ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Überschrift: Wörter einzeln einblenden ----------
document.querySelectorAll('.reveal-words').forEach((h) => {
  h.querySelectorAll('.de, .en').forEach((teil) => {
    const woerter = teil.textContent.trim().split(/\s+/);
    teil.textContent = '';
    woerter.forEach((w, i) => {
      const s = document.createElement('span');
      s.className = 'w';
      s.textContent = w;
      s.style.transitionDelay = (i * 70) + 'ms';
      teil.append(s, i < woerter.length - 1 ? ' ' : '');
    });
  });
  requestAnimationFrame(() => setTimeout(() => h.classList.add('in'), 80));
});

// ---------- Elemente steigen beim Scrollen auf ----------
const beobachter = new IntersectionObserver((eintraege) => {
  eintraege.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); beobachter.unobserve(e.target); } });
}, { rootMargin: '0px 0px -8% 0px' });
document.querySelectorAll('.rise').forEach((el) => beobachter.observe(el));

// ---------- Fächer: Karten fächern sich beim Scrollen auf ----------
const buehne = document.querySelector('.fan-stage');
const faecher = buehne && buehne.querySelector('.fan');
const karten = faecher ? [...faecher.querySelectorAll('.card')] : [];
const legeKarten = () => {
  if (!buehne) return;
  const r = buehne.getBoundingClientRect();
  const weg = Math.max(1, r.height - innerHeight * 0.85);
  const p = ruhig ? 1 : Math.min(1, Math.max(0, -r.top / weg));
  const breit = innerWidth;
  const abstand = Math.min(250, breit * (breit < 640 ? 0.13 : 0.17));
  const mitte = (karten.length - 1) / 2;
  karten.forEach((k, i) => {
    const d = i - mitte;
    const x = d * (14 + p * abstand);
    const y = Math.abs(d) * (10 + p * 26) - p * 10;
    const dreh = d * (6 - p * 3);
    const s = 1 - Math.abs(d) * 0.04 * (1 - p * 0.5);
    k.style.transform = `translate(${x}px, ${y}px) rotate(${dreh}deg) scale(${s})`;
    k.style.zIndex = String(10 - Math.round(Math.abs(d)));
  });
  faecher.classList.toggle('spread', p > 0.6);
};

// ---------- Dock: zeigt, wo man gerade ist ----------
const dock = document.querySelector('.dock');
const dockLinks = dock ? [...dock.querySelectorAll('a[href^="#"]:not(.cta)')] : [];
const ziele = dockLinks.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
const markiereDock = () => {
  if (!dock) return;
  dock.classList.toggle('show', scrollY > innerHeight * 0.6);
  let aktiv = -1;
  ziele.forEach((z, i) => { if (z.getBoundingClientRect().top < innerHeight * 0.45) aktiv = i; });
  dockLinks.forEach((a, i) => a.classList.toggle('on', i === aktiv));
};

let wartet = false;
const beimScrollen = () => {
  if (wartet) return;
  wartet = true;
  requestAnimationFrame(() => {
    if (kopf) kopf.classList.toggle('scrolled', scrollY > 8);
    legeKarten();
    markiereDock();
    wartet = false;
  });
};
addEventListener('scroll', beimScrollen, { passive: true });
addEventListener('resize', beimScrollen);
beimScrollen();

// ---------- Jahr in der Fußzeile ----------
document.querySelectorAll('.year').forEach((el) => { el.textContent = new Date().getFullYear(); });
