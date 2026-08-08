// Agrupa el arreglo plano de líneas de una nota en "bloques":
// - bloques de tipo "text": una o más líneas consecutivas de texto normal,
//   pensadas para editarse/mostrarse como un único párrafo continuo.
// - bloques de tipo "checkbox": una línea individual de checklist.
// Esto permite que una nota se vea como texto normal (Keep/Samsung Notes)
// en vez de una lista de líneas sueltas, mientras las líneas marcadas como
// checklist siguen agrupándose visualmente como una lista compacta.
export function groupNoteLines(lines) {
  const blocks = [];
  let currentText = null;

  for (const line of lines) {
    if (line.type === "checkbox") {
      currentText = null;
      blocks.push({ type: "checkbox", line });
    } else {
      if (!currentText) {
        currentText = { type: "text", lines: [] };
        blocks.push(currentText);
      }
      currentText.lines.push(line);
    }
  }

  return blocks;
}
