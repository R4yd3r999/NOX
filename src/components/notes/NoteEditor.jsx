import { useEffect, useRef, useState } from "react";
import { uid } from "../../lib/id.js";
import Button from "../Button.jsx";

export default function NoteEditor({
  note,
  folders,
  onClose,
  onChange,
  onDelete,
  onDuplicate,
}) {
  const isBlankNote =
    !note.title && note.lines.length === 1 && !note.lines[0].text;
  const [isEditing, setIsEditing] = useState(isBlankNote);
  const [focusedLineId, setFocusedLineId] = useState(note.lines[0]?.id);
  const [menuOpen, setMenuOpen] = useState(false);
  const inputRefs = useRef({});
  const focusNextId = useRef(null);

  useEffect(() => {
    if (focusNextId.current) {
      const el = inputRefs.current[focusNextId.current];
      if (el) {
        el.focus();
      }
      focusNextId.current = null;
    }
  });

  function updateLines(updater) {
    onChange((n) => ({ ...n, lines: updater(n.lines) }));
  }

  function setLineText(lineId, text) {
    updateLines((lines) =>
      lines.map((l) => (l.id === lineId ? { ...l, text } : l))
    );
  }

  function toggleChecked(lineId) {
    updateLines((lines) =>
      lines.map((l) => (l.id === lineId ? { ...l, checked: !l.checked } : l))
    );
  }

  function toggleListModeForFocused() {
    const targetId = focusedLineId || note.lines[note.lines.length - 1]?.id;
    if (!targetId) return;
    updateLines((lines) =>
      lines.map((l) =>
        l.id === targetId
          ? {
              ...l,
              type: l.type === "checkbox" ? "text" : "checkbox",
              checked: false,
            }
          : l
      )
    );
  }

  function removeAllLists() {
    updateLines((lines) =>
      lines.map((l) => ({ ...l, type: "text", checked: false }))
    );
  }

  function handleEnter(lineId) {
    const currentLine = note.lines.find((l) => l.id === lineId);
    const newId = uid("ln");
    updateLines((lines) => {
      const idx = lines.findIndex((l) => l.id === lineId);
      const next = [...lines];
      next.splice(idx + 1, 0, {
        id: newId,
        text: "",
        type: currentLine?.type === "checkbox" ? "checkbox" : "text",
        checked: false,
      });
      return next;
    });
    focusNextId.current = newId;
    setFocusedLineId(newId);
  }

  function handleBackspaceEmpty(lineId) {
    const idx = note.lines.findIndex((l) => l.id === lineId);
    if (idx <= 0) return;
    const prevId = note.lines[idx - 1].id;
    updateLines((lines) => lines.filter((l) => l.id !== lineId));
    focusNextId.current = prevId;
    setFocusedLineId(prevId);
  }

  const focusedLine = note.lines.find((l) => l.id === focusedLineId);
  const listModeActive = focusedLine?.type === "checkbox";

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-sheet note-editor-sheet"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-title">
          <button className="btn-icon btn-ghost" onClick={onClose} aria-label="Cerrar">
            <BackIcon />
          </button>

          <div style={{ display: "flex", gap: 6 }}>
            <button
              className={`btn-icon ${listModeActive ? "btn-primary" : "btn-ghost"}`}
              onClick={toggleListModeForFocused}
              disabled={!isEditing}
              title="Alternar checklist en la línea seleccionada"
              aria-pressed={listModeActive}
            >
              <ChecklistIcon />
            </button>
            <button
              className="btn-icon btn-ghost"
              onClick={removeAllLists}
              disabled={!isEditing}
              title="Quitar todas las listas"
            >
              <ClearListIcon />
            </button>
            <button
              className={`btn-icon ${isEditing ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setIsEditing((v) => !v)}
              title={isEditing ? "Terminar edición" : "Editar nota"}
              aria-pressed={isEditing}
            >
              <EditIcon />
            </button>

            <div style={{ position: "relative" }}>
              <button
                className="btn-icon btn-ghost"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Más opciones"
              >
                <DotsIcon />
              </button>
              {menuOpen && (
                <div className="dropdown dropdown-right fade-slide-in">
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setMenuOpen(false);
                    }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => {
                      onDuplicate();
                      setMenuOpen(false);
                      onClose();
                    }}
                  >
                    Duplicar
                  </button>
                  <button
                    className="dropdown-danger"
                    onClick={() => {
                      onDelete();
                      setMenuOpen(false);
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {isEditing ? (
          <input
            className="note-title-input"
            placeholder="Título"
            value={note.title}
            onChange={(e) => onChange((n) => ({ ...n, title: e.target.value }))}
          />
        ) : (
          <h2 className="note-title-view">{note.title || "Sin título"}</h2>
        )}

        <div className="note-lines">
          {note.lines.map((line) => (
            <div
              key={line.id}
              className={`note-line ${line.type === "checkbox" ? "is-check" : ""}`}
            >
              {line.type === "checkbox" && (
                <input
                  type="checkbox"
                  checked={line.checked}
                  onChange={() => toggleChecked(line.id)}
                  className="note-line-checkbox"
                />
              )}
              {isEditing ? (
                <input
                  ref={(el) => (inputRefs.current[line.id] = el)}
                  className={`note-line-input ${
                    line.type === "checkbox" && line.checked ? "checked" : ""
                  }`}
                  value={line.text}
                  placeholder={line.type === "checkbox" ? "Elemento…" : "Escribe algo…"}
                  onFocus={() => setFocusedLineId(line.id)}
                  onChange={(e) => setLineText(line.id, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleEnter(line.id);
                    } else if (e.key === "Backspace" && line.text === "") {
                      e.preventDefault();
                      handleBackspaceEmpty(line.id);
                    }
                  }}
                />
              ) : (
                <span
                  className={`note-line-text ${
                    line.type === "checkbox" && line.checked ? "checked" : ""
                  }`}
                >
                  {line.text || "\u00A0"}
                </span>
              )}
            </div>
          ))}
        </div>

        {folders.length > 0 && (
          <div className="note-folder-select">
            <span className="section-label" style={{ margin: 0 }}>
              Carpeta
            </span>
            <select
              className="field"
              value={note.folderId || ""}
              onChange={(e) =>
                onChange((n) => ({
                  ...n,
                  folderId: e.target.value || null,
                }))
              }
            >
              <option value="">Sin carpeta</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ChecklistIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 6l1.5 1.5L8 5M4 12l1.5 1.5L8 10M4 18l1.5 1.5L8 16" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 6h9M11 12h9M11 18h9" strokeLinecap="round" />
    </svg>
  );
}
function ClearListIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 6h9M4 12h9M4 18h5" strokeLinecap="round" />
      <path d="M16 15l5 5m0-5-5 5" strokeLinecap="round" />
    </svg>
  );
}
function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 20h9" strokeLinecap="round" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function DotsIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
      <circle cx="12" cy="5" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="12" cy="19" r="1.8" />
    </svg>
  );
}
