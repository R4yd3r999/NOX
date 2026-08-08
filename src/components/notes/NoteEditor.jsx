import { useEffect, useRef, useState } from "react";
import { uid } from "../../lib/id.js";
import { groupNoteLines } from "../../lib/noteLines.js";

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
  const [focusedLineId, setFocusedLineId] = useState(null);
  const [focusedBlockKey, setFocusedBlockKey] = useState(
    note.lines[0]?.type !== "checkbox" ? note.lines[0]?.id : null
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const inputRefs = useRef({});
  const textareaRefs = useRef({});
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

  function handleTextBlockChange(block, value) {
    const newTexts = value.split("\n");
    const newLines = newTexts.map((text, i) => {
      const existing = block.lines[i];
      return existing ? { ...existing, text } : newLine();
    });
    updateLines((lines) => {
      const firstIdx = lines.findIndex((l) => l.id === block.lines[0].id);
      if (firstIdx === -1) return lines;
      const before = lines.slice(0, firstIdx);
      const after = lines.slice(firstIdx + block.lines.length);
      return [...before, ...newLines, ...after];
    });
  }

  function toggleListModeForFocused() {
    // Caso 1: el foco está en un ítem de checklist -> lo devuelve a texto
    // normal (se fusionará con el párrafo vecino automáticamente).
    const focusedCheckboxLine = note.lines.find(
      (l) => l.id === focusedLineId && l.type === "checkbox"
    );
    if (focusedCheckboxLine) {
      updateLines((lines) =>
        lines.map((l) =>
          l.id === focusedCheckboxLine.id
            ? { ...l, type: "text", checked: false }
            : l
        )
      );
      return;
    }

    // Caso 2: el foco está dentro de un bloque de texto -> convierte solo
    // la línea donde está el cursor en un ítem de checklist.
    if (focusedBlockKey) {
      const ta = textareaRefs.current[focusedBlockKey];
      const block = groupNoteLines(note.lines).find(
        (b) => b.type === "text" && b.lines[0].id === focusedBlockKey
      );
      if (ta && block) {
        const cursorPos = ta.selectionStart ?? ta.value.length;
        const lineIndex = ta.value.slice(0, cursorPos).split("\n").length - 1;
        const targetLine = block.lines[lineIndex];
        if (targetLine) {
          updateLines((lines) =>
            lines.map((l) =>
              l.id === targetLine.id
                ? { ...l, type: "checkbox", checked: false }
                : l
            )
          );
          focusNextId.current = targetLine.id;
          setFocusedLineId(targetLine.id);
          setFocusedBlockKey(null);
          return;
        }
      }
    }

    // Fallback: sin nada enfocado, alterna la última línea de la nota.
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
    const prevLine = note.lines[idx - 1];
    updateLines((lines) => lines.filter((l) => l.id !== lineId));
    if (prevLine.type === "checkbox") {
      focusNextId.current = prevLine.id;
      setFocusedLineId(prevLine.id);
    }
  }

  const listModeActive = note.lines.some(
    (l) => l.id === focusedLineId && l.type === "checkbox"
  );

  const blocks = groupNoteLines(note.lines);

  return (
    <div className="modal-backdrop note-editor-backdrop" onClick={onClose}>
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
            autoFocus={isBlankNote}
            onChange={(e) => onChange((n) => ({ ...n, title: e.target.value }))}
          />
        ) : (
          <h2 className="note-title-view">{note.title || "Sin título"}</h2>
        )}

        <div className="note-lines">
          {blocks.map((block) =>
            block.type === "checkbox" ? (
              <div key={block.line.id} className="note-line is-check">
                <input
                  type="checkbox"
                  checked={block.line.checked}
                  onChange={() => toggleChecked(block.line.id)}
                  className="note-line-checkbox"
                />
                {isEditing ? (
                  <input
                    ref={(el) => (inputRefs.current[block.line.id] = el)}
                    className={`note-line-input ${block.line.checked ? "checked" : ""}`}
                    value={block.line.text}
                    placeholder="Elemento…"
                    onFocus={() => {
                      setFocusedLineId(block.line.id);
                      setFocusedBlockKey(null);
                    }}
                    onChange={(e) => setLineText(block.line.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleEnter(block.line.id);
                      } else if (e.key === "Backspace" && block.line.text === "") {
                        e.preventDefault();
                        handleBackspaceEmpty(block.line.id);
                      }
                    }}
                  />
                ) : (
                  <span
                    className={`note-line-text ${block.line.checked ? "checked" : ""}`}
                  >
                    {block.line.text || "\u00A0"}
                  </span>
                )}
              </div>
            ) : isEditing ? (
              <AutoGrowTextarea
                key={block.lines[0].id}
                value={block.lines.map((l) => l.text).join("\n")}
                placeholder="Escribe algo…"
                refCallback={(el) => (textareaRefs.current[block.lines[0].id] = el)}
                onFocus={() => {
                  setFocusedBlockKey(block.lines[0].id);
                  setFocusedLineId(null);
                }}
                onChangeValue={(val) => handleTextBlockChange(block, val)}
              />
            ) : (
              <p key={block.lines[0].id} className="note-text-block-view">
                {block.lines.map((l) => l.text).join("\n") || "\u00A0"}
              </p>
            )
          )}
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

function newLine() {
  return { id: uid("ln"), text: "", type: "text", checked: false };
}

function AutoGrowTextarea({ value, onChangeValue, onFocus, refCallback, placeholder }) {
  const localRef = useRef(null);

  useEffect(() => {
    const el = localRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [value]);

  return (
    <textarea
      ref={(el) => {
        localRef.current = el;
        refCallback(el);
      }}
      className="note-text-block-input"
      value={value}
      placeholder={placeholder}
      rows={1}
      onFocus={onFocus}
      onChange={(e) => onChangeValue(e.target.value)}
    />
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
