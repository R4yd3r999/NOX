import { useRef, useState } from "react";
import Button from "../Button.jsx";
import ExerciseModal from "./ExerciseModal.jsx";
import VersionModal from "./VersionModal.jsx";
import {
  makeExercise,
  makeVersion,
  nextVersionLabel,
  summarizeSets,
} from "../../lib/gymDefaults.js";

export default function DayCard({ day, unit, onUpdateDay, onRequestDuplicate }) {
  const [exerciseModal, setExerciseModal] = useState(null);
  const [versionModalOpen, setVersionModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [dragId, setDragId] = useState(null);

  const rowRefs = useRef({});
  const dragInfo = useRef({ pointerId: null, exId: null });

  const activeVersion = day.versions[day.activeVersion] || day.versions[0];

  function updateActiveVersion(updater) {
    onUpdateDay((d) => ({
      ...d,
      versions: d.versions.map((v, i) =>
        i === d.activeVersion ? updater(v) : v
      ),
    }));
  }

  function handleSaveExercise(exerciseData) {
    updateActiveVersion((v) => {
      const exists = v.exercises.some((e) => e.id === exerciseData.id);
      return {
        ...v,
        exercises: exists
          ? v.exercises.map((e) =>
              e.id === exerciseData.id ? exerciseData : e
            )
          : [...v.exercises, exerciseData],
      };
    });
    setExerciseModal(null);
  }

  function handleDeleteExercise(id) {
    updateActiveVersion((v) => ({
      ...v,
      exercises: v.exercises.filter((e) => e.id !== id),
    }));
  }

  function quickAddVersion() {
    const label = nextVersionLabel(day.versions.map((v) => v.label));
    onUpdateDay((d) => ({
      ...d,
      versions: [...d.versions, makeVersion(label)],
      activeVersion: d.versions.length,
    }));
  }

  // ---- arrastrar para reordenar (pointer events: funciona con mouse y touch) ----

  function handlePointerDown(e, exId) {
    if (!editMode) return;
    e.preventDefault();
    const handle = e.currentTarget;
    handle.setPointerCapture(e.pointerId);
    dragInfo.current = { pointerId: e.pointerId, exId };
    setDragId(exId);
  }

  function handlePointerMove(e) {
    if (!dragInfo.current.exId) return;
    const ids = activeVersion.exercises.map((ex) => ex.id);
    const dragIdx = ids.indexOf(dragInfo.current.exId);
    if (dragIdx === -1) return;

    let targetIdx = ids.length - 1;
    for (let i = 0; i < ids.length; i++) {
      const el = rowRefs.current[ids[i]];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      const mid = rect.top + rect.height / 2;
      if (e.clientY < mid) {
        targetIdx = i;
        break;
      }
    }

    if (targetIdx !== dragIdx) {
      updateActiveVersion((v) => {
        const exercises = [...v.exercises];
        const [moved] = exercises.splice(dragIdx, 1);
        exercises.splice(targetIdx, 0, moved);
        return { ...v, exercises };
      });
    }
  }

  function handlePointerUp(e) {
    const handle = e.currentTarget;
    try {
      handle.releasePointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
    dragInfo.current = { pointerId: null, exId: null };
    setDragId(null);
  }

  return (
    <div className="day-card panel hud-corners">
      <span className="hud-corner hc-tl" />
      <span className="hud-corner hc-tr" />
      <span className="hud-corner hc-bl" />
      <span className="hud-corner hc-br" />

      <div className="day-card-header">
        <h3 className="day-name">{day.name}</h3>

        <div className="day-header-controls">
          <div className="version-cluster">
            <button
              className="version-pill"
              onClick={() => setVersionModalOpen(true)}
              title="Elegir / gestionar variantes"
            >
              {activeVersion?.label || "A"}
              {day.versions.length > 1 && (
                <span className="version-count">{day.versions.length}</span>
              )}
            </button>
            <button
              className="version-quick-add"
              onClick={quickAddVersion}
              title="Añadir variante nueva (en blanco)"
              aria-label="Añadir variante nueva"
            >
              +
            </button>
          </div>

          <button
            className={`day-edit-toggle ${editMode ? "active" : ""}`}
            onClick={() => setEditMode((v) => !v)}
          >
            {editMode ? (
              <>
                <CheckIcon /> LISTO
              </>
            ) : (
              <>
                <EditIcon /> EDITAR
              </>
            )}
          </button>
        </div>
      </div>

      <div className="exercise-list">
        {activeVersion?.exercises.length === 0 && (
          <p className="folder-empty">Sin ejercicios en esta versión.</p>
        )}
        {activeVersion?.exercises.map((ex) => (
          <div
            key={ex.id}
            ref={(el) => (rowRefs.current[ex.id] = el)}
            className={`exercise-row ${dragId === ex.id ? "dragging" : ""}`}
          >
            {editMode && (
              <button
                className="drag-handle"
                onPointerDown={(e) => handlePointerDown(e, ex.id)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                aria-label={`Reordenar ${ex.name || "ejercicio"}`}
                title="Arrastra para reordenar"
              >
                <GripIcon />
              </button>
            )}

            <button
              className="exercise-info"
              onClick={() => editMode && setExerciseModal({ exercise: ex })}
              disabled={!editMode}
            >
              <span className="exercise-name">{ex.name || "Ejercicio"}</span>
              <span className="exercise-stats">
                {(() => {
                  const s = summarizeSets(ex.sets);
                  return (
                    <>
                      <span className="stat-chip">
                        <b>{s.count}</b>
                        <small>series</small>
                      </span>
                      <span className="stat-chip">
                        <b>{s.reps}</b>
                        <small>{s.repsIsRange ? "reps/serie" : "reps"}</small>
                      </span>
                      {s.hasWeight && (
                        <span className="stat-chip weight">
                          <b>{s.weight}</b>
                          <small>{unit}{s.weightIsRange ? "/serie" : ""}</small>
                        </span>
                      )}
                    </>
                  );
                })()}
              </span>
            </button>

            {editMode && (
              <button
                className="btn-icon btn-ghost small-icon danger-hover"
                onClick={() => handleDeleteExercise(ex.id)}
                aria-label="Eliminar ejercicio"
              >
                <TrashIcon />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="day-card-footer">
        {editMode && (
          <Button
            variant="btn-ghost"
            className="small"
            onClick={() => setExerciseModal({ new: true })}
          >
            + EJERCICIO
          </Button>
        )}
        <Button
          variant="btn-ghost"
          className="small"
          onClick={() => onRequestDuplicate(activeVersion?.id)}
        >
          DUPLICAR DÍA
        </Button>
      </div>

      {exerciseModal && (
        <ExerciseModal
          exercise={exerciseModal.exercise || makeExercise()}
          unit={unit}
          onClose={() => setExerciseModal(null)}
          onSave={handleSaveExercise}
        />
      )}

      {versionModalOpen && (
        <VersionModal
          day={day}
          onClose={() => setVersionModalOpen(false)}
          onUpdateDay={onUpdateDay}
        />
      )}
    </div>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 20h9" strokeLinecap="round" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M4 12l5 5L20 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-9 0 1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
    </svg>
  );
}
function GripIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
      <circle cx="9" cy="6" r="1.6" />
      <circle cx="9" cy="12" r="1.6" />
      <circle cx="9" cy="18" r="1.6" />
      <circle cx="15" cy="6" r="1.6" />
      <circle cx="15" cy="12" r="1.6" />
      <circle cx="15" cy="18" r="1.6" />
    </svg>
  );
}
