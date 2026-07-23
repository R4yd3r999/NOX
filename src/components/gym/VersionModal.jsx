import Button from "../Button.jsx";
import { makeVersion, nextVersionLabel } from "../../lib/gymDefaults.js";

export default function VersionModal({ day, onClose, onUpdateDay }) {
  function selectVersion(index) {
    onUpdateDay((d) => ({ ...d, activeVersion: index }));
  }

  function addVersion() {
    const label = nextVersionLabel(day.versions.map((v) => v.label));
    onUpdateDay((d) => ({
      ...d,
      versions: [...d.versions, makeVersion(label)],
      activeVersion: d.versions.length,
    }));
  }

  function deleteVersion(index) {
    if (day.versions.length <= 1) return;
    onUpdateDay((d) => {
      const versions = d.versions.filter((_, i) => i !== index);
      const activeVersion =
        d.activeVersion >= versions.length
          ? versions.length - 1
          : d.activeVersion > index
          ? d.activeVersion - 1
          : d.activeVersion;
      return { ...d, versions, activeVersion };
    });
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">
          Versiones · {day.name}
          <button className="btn-icon btn-ghost" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </h3>

        <div className="version-list">
          {day.versions.map((v, i) => (
            <div
              key={v.id}
              className={`version-row ${i === day.activeVersion ? "active" : ""}`}
            >
              <button className="version-row-select" onClick={() => selectVersion(i)}>
                <span className="version-badge">{v.label}</span>
                <span className="version-info">
                  {v.exercises.length} ejercicio
                  {v.exercises.length === 1 ? "" : "s"}
                </span>
              </button>
              {day.versions.length > 1 && (
                <button
                  className="btn-icon btn-ghost small-icon danger-hover"
                  onClick={() => deleteVersion(i)}
                  aria-label={`Eliminar versión ${v.label}`}
                >
                  <TrashIcon />
                </button>
              )}
            </div>
          ))}
        </div>

        <Button variant="btn-primary" onClick={addVersion} style={{ marginTop: 14, width: "100%" }}>
          + AÑADIR VERSIÓN
        </Button>
      </div>
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
