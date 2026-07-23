import { useState } from "react";
import Button from "../Button.jsx";

export default function DuplicateModal({ days, sourceDayId, onClose, onConfirm }) {
  const [targetDayId, setTargetDayId] = useState(sourceDayId);
  const [mode, setMode] = useState("new"); // "new" | "overwrite"
  const [versionId, setVersionId] = useState(null);

  const targetDay = days.find((d) => d.id === targetDayId);

  function handleConfirm() {
    onConfirm(
      targetDayId,
      mode,
      mode === "overwrite" ? versionId || targetDay?.versions[0]?.id : null
    );
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">
          Duplicar día
          <button className="btn-icon btn-ghost" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </h3>

        <div className="form-field">
          <label>Día destino</label>
          <select
            className="field"
            value={targetDayId}
            onChange={(e) => {
              setTargetDayId(e.target.value);
              setVersionId(null);
            }}
          >
            {days.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label>Modo</label>
          <div style={{ display: "flex", gap: 8 }}>
            <Button
              variant={mode === "new" ? "btn-primary" : "btn-ghost"}
              className="small"
              onClick={() => setMode("new")}
              type="button"
            >
              CREAR VERSIÓN NUEVA
            </Button>
            <Button
              variant={mode === "overwrite" ? "btn-primary" : "btn-ghost"}
              className="small"
              onClick={() => setMode("overwrite")}
              type="button"
            >
              SOBRESCRIBIR VERSIÓN
            </Button>
          </div>
        </div>

        {mode === "overwrite" && targetDay && (
          <div className="form-field">
            <label>Versión a sobrescribir</label>
            <select
              className="field"
              value={versionId || targetDay.versions[0]?.id}
              onChange={(e) => setVersionId(e.target.value)}
            >
              {targetDay.versions.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <Button variant="btn-primary" onClick={handleConfirm}>
            DUPLICAR
          </Button>
          <Button variant="btn-ghost" onClick={onClose}>
            CANCELAR
          </Button>
        </div>
      </div>
    </div>
  );
}
