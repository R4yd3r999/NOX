import { uid } from "./id.js";

export const WEEKDAYS = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

export function nextVersionLabel(existingLabels) {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (const ch of letters) {
    if (!existingLabels.includes(ch)) return ch;
  }
  return `V${existingLabels.length + 1}`;
}

export function makeVersion(label = "A") {
  return { id: uid("ver"), label, exercises: [] };
}

export function makeDay(name) {
  return {
    id: uid("day"),
    name,
    versions: [makeVersion("A")],
    activeVersion: 0,
  };
}

export function defaultGymState() {
  const days = WEEKDAYS.map((name) => makeDay(name));
  return {
    unit: "kg",
    layout: "list",
    selectedDayId: days[0].id,
    days,
  };
}

// ---- ejercicios: cada serie es independiente (reps + peso propios) ----

export function makeSet(reps = "", weight = "") {
  return { id: uid("set"), reps, weight };
}

export function makeExercise() {
  return { id: uid("ex"), name: "", sets: [makeSet()] };
}

/**
 * Convierte un ejercicio con el formato viejo (series/reps/weight como
 * texto libre) al nuevo formato de sets independientes. Si ya viene en
 * formato nuevo, lo devuelve intacto. Best-effort: si reps/weight traían
 * varios valores separados por guion, los reparte por serie; si no
 * coinciden en cantidad, rellena/recorta según haga falta.
 */
export function normalizeExercise(ex) {
  if (Array.isArray(ex.sets)) return ex;

  const count = Math.max(1, parseInt(ex.series, 10) || 1);
  const repsParts = String(ex.reps ?? "")
    .split(/[-,]/)
    .map((s) => s.trim())
    .filter(Boolean);
  const weightParts = String(ex.weight ?? "")
    .split(/[-,]/)
    .map((s) => s.trim())
    .filter(Boolean);

  const sets = Array.from({ length: count }, (_, i) => {
    const reps =
      repsParts.length === count
        ? repsParts[i]
        : repsParts[0] !== undefined
          ? repsParts[Math.min(i, repsParts.length - 1)]
          : "";
    const weight =
      weightParts.length === count
        ? weightParts[i]
        : weightParts[0] !== undefined
          ? weightParts[Math.min(i, weightParts.length - 1)]
          : "";
    return makeSet(reps, weight);
  });

  return { id: ex.id, name: ex.name || "", sets };
}

export function migrateGymState(gym) {
  return {
    ...gym,
    days: gym.days.map((day) => ({
      ...day,
      versions: day.versions.map((v) => ({
        ...v,
        exercises: v.exercises.map(normalizeExercise),
      })),
    })),
  };
}

/**
 * Resume los sets de un ejercicio para mostrarlos compactos:
 * si todas las series comparten el mismo valor, muestra uno solo
 * ("4×12 reps"); si varían, muestra el rango completo ("12-10-8-6").
 */
export function summarizeSets(sets) {
  const count = sets.length;
  const repsValues = sets.map((s) => s.reps || "–");
  const weightValues = sets.filter((s) => s.weight).map((s) => s.weight);

  const repsUniform = repsValues.every((r) => r === repsValues[0]);
  const weightUniform =
    weightValues.length > 0 &&
    weightValues.every((w) => w === weightValues[0]);

  return {
    count,
    reps: repsUniform ? repsValues[0] : repsValues.join("-"),
    repsIsRange: !repsUniform,
    weight: weightValues.length
      ? weightUniform
        ? weightValues[0]
        : weightValues.join("-")
      : "",
    weightIsRange: weightValues.length > 0 && !weightUniform,
    hasWeight: weightValues.length > 0,
  };
}
