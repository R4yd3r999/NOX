import { useEffect, useState } from "react";
import { loadState, saveState } from "../lib/storage.js";

const SCALE_STEPS = [
  { key: "sm", label: "Pequeño", value: 0.92 },
  { key: "md", label: "Normal", value: 1 },
  { key: "lg", label: "Grande", value: 1.15 },
  { key: "xl", label: "Muy grande", value: 1.32 },
];

export default function SettingsPanel() {
  const [open, setOpen] = useState(false);
  const [scaleKey, setScaleKey] = useState(
    () => loadState("settings", { textScale: "md" }).textScale || "md"
  );

  useEffect(() => {
    const step = SCALE_STEPS.find((s) => s.key === scaleKey) || SCALE_STEPS[1];
    document.documentElement.style.setProperty("--ui-zoom", step.value);
    saveState("settings", { textScale: scaleKey });
  }, [scaleKey]);

  return (
    <>
      <button
        className="settings-gear-btn"
        onClick={() => setOpen(true)}
        aria-label="Configuración"
        title="Configuración"
      >
        ⚙️
      </button>

      {open && (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">
              Configuración
              <button
                className="btn-icon btn-ghost"
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
              >
                ×
              </button>
            </h3>

            <p className="section-label" style={{ marginTop: 0 }}>
              Tamaño de texto
            </p>

            <div className="scale-options">
              {SCALE_STEPS.map((s) => (
                <button
                  key={s.key}
                  className={`scale-option ${scaleKey === s.key ? "active" : ""}`}
                  onClick={() => setScaleKey(s.key)}
                >
                  <span className="scale-option-preview" style={{ fontSize: 14 * s.value }}>
                    Aa
                  </span>
                  <span className="scale-option-label">{s.label}</span>
                </button>
              ))}
            </div>

            <p className="scale-hint">
              Ajusta todo el tamaño de la interfaz (letras, íconos y espaciados) para
              que sea más cómodo de leer. Se aplica al instante y se recuerda la
              próxima vez que abras NOX.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
