import { useState } from "react";
import Button from "../Button.jsx";
import { makeSet } from "../../lib/gymDefaults.js";

export default function ExerciseModal({ exercise, unit, onClose, onSave }) {
  const [name, setName] = useState(exercise.name);
  const [sets, setSets] = useState(
    exercise.sets.length ? exercise.sets : [makeSet()]
  );

  function updateSet(id, field, value) {
    setSets((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  }

  function addSet() {
    setSets((prev) => {
      const last = prev[prev.length - 1];
      // Nueva serie parte de los valores de la anterior — lo más común
      // es que se repitan, y así se ajusta más rápido si cambian.
      return [...prev, makeSet(last?.reps || "", last?.weight || "")];
    });
  }

  function removeSet(id) {
    setSets((prev) => (prev.length > 1 ? prev.filter((s) => s.id !== id) : prev));
  }

  function copyFirstToAll() {
    setSets((prev) => {
      const [first] = prev;
      return prev.map((s) => ({ ...s, reps: first.reps, weight: first.weight }));
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ id: exercise.id, name, sets });
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form
        className="modal-sheet"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <h3 className="modal-title">
          {exercise.name ? "Editar ejercicio" : "Nuevo ejercicio"}
          <button
            type="button"
            className="btn-icon btn-ghost"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </h3>

        <div className="form-field">
          <label>Nombre del ejercicio</label>
          <input
            autoFocus
            className="field"
            placeholder="Ej. Press banca"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="sets-editor-head">
          <label>
            Series <span className="sets-count-badge">{sets.length}</span>
          </label>
          {sets.length > 1 && (
            <button
              type="button"
              className="copy-all-btn"
              onClick={copyFirstToAll}
              title="Copiar la primera fila a todas las series"
            >
              <CopyIcon /> COPIAR FILA 1 A TODAS
            </button>
          )}
        </div>

        <div className="sets-editor-list">
          {sets.map((s, i) => (
            <div className="set-row" key={s.id}>
              <span className="set-index">{i + 1}</span>
              <div className="set-row-field">
                <input
                  className="field"
                  inputMode="numeric"
                  placeholder="reps"
                  value={s.reps}
                  onChange={(e) => updateSet(s.id, "reps", e.target.value)}
                />
                <small>reps</small>
              </div>
              <div className="set-row-field">
                <input
                  className="field"
                  inputMode="decimal"
                  placeholder="peso"
                  value={s.weight}
                  onChange={(e) => updateSet(s.id, "weight", e.target.value)}
                />
                <small>{unit}</small>
              </div>
              <button
                type="button"
                className="btn-icon btn-ghost small-icon danger-hover"
                onClick={() => removeSet(s.id)}
                disabled={sets.length <= 1}
                aria-label={`Eliminar serie ${i + 1}`}
              >
                <TrashIcon />
              </button>
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="btn-ghost"
          className="small"
          onClick={addSet}
          style={{ marginTop: 4 }}
        >
          + SERIE
        </Button>

        <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
          <Button type="submit" variant="btn-primary">
            GUARDAR
          </Button>
          <Button type="button" variant="btn-ghost" onClick={onClose}>
            CANCELAR
          </Button>
        </div>
      </form>
    </div>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-9 0 1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
    </svg>
  );
}
function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="8" y="8" width="12" height="12" rx="1.5" />
      <path d="M4 15V5a1 1 0 0 1 1-1h10" />
    </svg>
  );
}
