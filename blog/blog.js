// NutriPrep Blog – nur Hell/Dunkel und die Linie unter der Kopfzeile. Keine Cookies, kein Tracking.
// (Nicht /assets/site.js, weil das die Sprache auf Englisch umstellen kann; der Blog ist nur Deutsch.)

const root = document.documentElement;
const lesen = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
const merken = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* privater Modus */ } };

const thema = lesen('np-theme');
if (thema) root.dataset.theme = thema;
document.querySelectorAll('.theme-btn').forEach((b) => b.addEventListener('click', () => {
  const istDunkel = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  root.dataset.theme = istDunkel ? 'light' : 'dark';
  merken('np-theme', root.dataset.theme);
}));

const kopf = document.querySelector('.top');
const linie = () => kopf && kopf.classList.toggle('scrolled', scrollY > 8);
addEventListener('scroll', linie, { passive: true });
linie();
