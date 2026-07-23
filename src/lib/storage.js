const PREFIX = "nox";

export function loadState(key, fallback) {
  try {
    const raw = localStorage.getItem(`${PREFIX}:${key}`);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch (err) {
    console.error(`No se pudo leer ${key} de localStorage`, err);
    return fallback;
  }
}

export function saveState(key, value) {
  try {
    localStorage.setItem(`${PREFIX}:${key}`, JSON.stringify(value));
  } catch (err) {
    console.error(`No se pudo guardar ${key} en localStorage`, err);
  }
}
