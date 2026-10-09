const preferenceKey = 'iywahl-color-mode';
const modes = ['light', 'system', 'dark'];
const systemPreference = matchMedia('(prefers-color-scheme: dark)');
const switcher = document.querySelector('.theme-switcher');
const buttons = [...switcher.querySelectorAll('[data-color-mode]')];
let mode = 'system';

try {
  const savedMode = localStorage.getItem(preferenceKey);
  if (modes.includes(savedMode)) mode = savedMode;
} catch {}

function applyMode() {
  const scheme = mode === 'system' ? (systemPreference.matches ? 'dark' : 'light') : mode;
  document.documentElement.dataset.colorMode = mode;
  document.documentElement.dataset.colorScheme = scheme;
  for (const button of buttons) {
    button.setAttribute('aria-pressed', String(button.dataset.colorMode === mode));
  }
}

for (const button of buttons) {
  button.addEventListener('click', () => {
    mode = button.dataset.colorMode;
    applyMode();
    try {
      localStorage.setItem(preferenceKey, mode);
    } catch {}
  });
}

systemPreference.addEventListener('change', () => {
  if (mode === 'system') applyMode();
});

applyMode();
switcher.hidden = false;