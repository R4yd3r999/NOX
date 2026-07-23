const KG_TO_LB = 2.20462;

export function convertWeight(value, fromUnit, toUnit) {
  const num = parseFloat(value);
  if (Number.isNaN(num) || fromUnit === toUnit) return value;

  const result =
    fromUnit === "kg" ? num * KG_TO_LB : num / KG_TO_LB;

  // Redondea a 1 decimal, sin ceros sobrantes
  const rounded = Math.round(result * 10) / 10;
  return String(rounded);
}

export function convertAllExercises(days, fromUnit, toUnit) {
  return days.map((day) => ({
    ...day,
    versions: day.versions.map((version) => ({
      ...version,
      exercises: version.exercises.map((ex) => ({
        ...ex,
        sets: ex.sets.map((s) => ({
          ...s,
          weight: s.weight ? convertWeight(s.weight, fromUnit, toUnit) : s.weight,
        })),
      })),
    })),
  }));
}
