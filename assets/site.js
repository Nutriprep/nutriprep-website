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
  dock.classList.toggle('sichtbar', scrollY > innerHeight * 0.6);
  let aktiv = -1;
  ziele.forEach((z, i) => { if (z.getBoundingClientRect().top < innerHeight * 0.45) aktiv = i; });
  dockLinks.forEach((a, i) => a.classList.toggle('on', i === aktiv));
};

// ---------- Kreislauf: Ring füllt sich beim Scrollen ----------
const kreis = document.querySelector('.loop-scroll');
const kreisTeile = kreis && {
  prog: kreis.querySelector('.prog'),
  orbit: kreis.querySelector('.orbit'),
  nummer: kreis.querySelector('.loop-center b'),
  knoten: [...kreis.querySelectorAll('.loop-node')],
  schritte: [...kreis.querySelectorAll('.loop-step')],
  punkte: [...kreis.querySelectorAll('.loop-dots i')],
};
let kreisSchritt = -1;
const drehKreis = () => {
  if (!kreis) return;
  const r = kreis.getBoundingClientRect();
  const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight)));
  const k = kreisTeile;
  const umfang = 2 * Math.PI * 120;
  k.prog.style.strokeDasharray = umfang;
  k.prog.style.strokeDashoffset = umfang * (1 - p);
  k.orbit.style.transform = `rotate(${p * 360}deg)`;
  const schritt = Math.min(3, Math.floor(p * 4));
  if (schritt === kreisSchritt) return;
  kreisSchritt = schritt;
  k.nummer.textContent = '0' + (schritt + 1);
  k.knoten.forEach((n, i) => { n.classList.toggle('on', i === schritt); n.classList.toggle('done', i < schritt); });
  k.schritte.forEach((s, i) => s.classList.toggle('on', i === schritt));
  k.punkte.forEach((d, i) => d.classList.toggle('on', i === schritt));
};

// ---------- Bühne: Küche, Rezepte, Nutrition wechseln beim Scrollen ----------
const szenenBuehne = document.querySelector('.stage');
const szenen = szenenBuehne ? [...szenenBuehne.querySelectorAll('.szene')] : [];
const buehnenTabs = szenenBuehne ? [...szenenBuehne.querySelectorAll('.stage-tab')] : [];
let buehnenIndex = -1;
let buehneLaeuft = false;
const segment = () => (szenenBuehne.offsetHeight - innerHeight) / szenen.length;
const spieleBuehne = () => {
  szenen.forEach((p, i) => {
    const v = p.querySelector('video');
    if (!v) return;
    if (i === buehnenIndex && buehneLaeuft) v.play().catch(() => {}); else v.pause();
  });
};
const wechsleBuehne = () => {
  if (!szenenBuehne || ruhig) return;
  const r = szenenBuehne.getBoundingClientRect();
  const sichtbar = r.top < innerHeight && r.bottom > 0;
  const fortschritt = Math.min(0.9999, Math.max(0, -r.top / Math.max(1, r.height - innerHeight))) * szenen.length;
  const i = Math.floor(fortschritt);
  buehnenTabs.forEach((t, j) => t.style.setProperty('--p', j === i ? fortschritt - i : 0));
  if (i !== buehnenIndex) {
    buehnenIndex = i;
    szenen.forEach((p, j) => { p.classList.toggle('on', j === i); p.classList.toggle('vorbei', j < i); });
    buehnenTabs.forEach((t, j) => t.classList.toggle('on', j === i));
    const v = szenen[i].querySelector('video');
    if (v) v.currentTime = 0;
    spieleBuehne();
  }
  if (sichtbar !== buehneLaeuft) { buehneLaeuft = sichtbar; spieleBuehne(); }
};
buehnenTabs.forEach((t, i) => t.addEventListener('click', () => {
  scrollTo({ top: szenenBuehne.offsetTop + i * segment() + 4, behavior: ruhig ? 'auto' : 'smooth' });
}));

let wartet = false;
const beimScrollen = () => {
  if (wartet) return;
  wartet = true;
  requestAnimationFrame(() => {
    if (kopf) kopf.classList.toggle('scrolled', scrollY > 8);
    legeKarten();
    drehKreis();
    wechsleBuehne();
    markiereDock();
    wartet = false;
  });
};
addEventListener('scroll', beimScrollen, { passive: true });
addEventListener('resize', beimScrollen);
beimScrollen();

// ---------- Funktions-Abschnitte: Video läuft, Reiter laufen mit ----------
document.querySelectorAll('.show').forEach((abschnitt) => {
  const video = abschnitt.querySelector('video');
  const reiter = [...abschnitt.querySelectorAll('.tab')];
  const texte = [...abschnitt.querySelectorAll('.show-desc p')];
  const leiste = abschnitt.querySelector('.tabs');
  if (!video || !reiter.length) return;
  const starts = reiter.map((r) => parseFloat(r.dataset.t));
  let aktiv = -1;

  const zeige = (i) => {
    if (i === aktiv) return;
    aktiv = i;
    reiter.forEach((r, j) => { r.classList.toggle('on', j === i); r.setAttribute('aria-selected', j === i); if (j !== i) r.style.setProperty('--p', 0); });
    texte.forEach((t, j) => t.classList.toggle('on', j === i));
    // Reiter-Leiste auf dem Handy mitscrollen, ohne die Seite zu bewegen
    if (leiste.scrollWidth > leiste.clientWidth) {
      const r = reiter[i];
      leiste.scrollTo({ left: r.offsetLeft - (leiste.clientWidth - r.offsetWidth) / 2, behavior: ruhig ? 'auto' : 'smooth' });
    }
  };
  const fortschritt = () => {
    const t = video.currentTime;
    const dauer = video.duration || starts[starts.length - 1] + 3;
    let i = 0;
    starts.forEach((s, j) => { if (t >= s - 0.05) i = j; });
    zeige(i);
    const ende = i + 1 < starts.length ? starts[i + 1] : dauer;
    reiter[i].style.setProperty('--p', Math.min(1, Math.max(0, (t - starts[i]) / (ende - starts[i]))));
    if (!video.paused) requestAnimationFrame(fortschritt);
  };
  video.addEventListener('play', () => requestAnimationFrame(fortschritt));
  video.addEventListener('seeked', fortschritt);
  reiter.forEach((r, i) => r.addEventListener('click', () => {
    video.currentTime = starts[i];
    zeige(i);
    video.play().catch(() => {});
  }));
  zeige(0);

  // Auf der Bühne steuert die Bühne das Abspielen
  if (abschnitt.closest('.stage') && !ruhig) return;
  // Nur abspielen, wenn der Abschnitt zu sehen ist
  if (ruhig) { video.removeAttribute('autoplay'); video.addEventListener('click', () => (video.paused ? video.play() : video.pause())); return; }
  new IntersectionObserver((eintraege) => eintraege.forEach((e) => {
    if (e.isIntersecting) video.play().catch(() => {}); else video.pause();
  }), { threshold: 0.35 }).observe(video);
});

// ---------- Stärken: zwei Laufbänder, beim Scrollen schneller, beim Darüberfahren Halt ----------
const laufReihen = [...document.querySelectorAll('.lauf-reihe')];
if (laufReihen.length && !ruhig) {
  const KOPIEN = 4;
  laufReihen.forEach((r) => {
    const original = r.innerHTML;
    r.innerHTML = original.repeat(KOPIEN);
    [...r.children].slice(r.children.length / KOPIEN).forEach((k) => k.setAttribute('aria-hidden', 'true'));
    r.addEventListener('pointerenter', () => { r.dataset.halt = '1'; });
    r.addEventListener('pointerleave', () => { r.dataset.halt = ''; });
  });
  const pos = laufReihen.map(() => 0);
  let tempo = 0, letzteY = scrollY, sichtbar = false;
  new IntersectionObserver((e) => { sichtbar = e[0].isIntersecting; }).observe(laufReihen[0].parentElement);
  const lauf = () => {
    const dy = Math.abs(scrollY - letzteY); letzteY = scrollY;
    tempo = tempo * 0.9 + dy * 0.25;
    if (sichtbar) laufReihen.forEach((r, i) => {
      const breite = r.scrollWidth / KOPIEN;
      pos[i] = (pos[i] + (r.dataset.halt ? 0 : 0.45 + tempo * 0.3)) % breite;
      r.style.transform = `translateX(${+r.dataset.dir > 0 ? -pos[i] : -breite + pos[i]}px)`;
    });
    requestAnimationFrame(lauf);
  };
  lauf();
}

// ---------- Jahr in der Fußzeile ----------
document.querySelectorAll('.year').forEach((el) => { el.textContent = new Date().getFullYear(); });
