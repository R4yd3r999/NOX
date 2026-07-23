import { useEffect, useRef, useState } from "react";

export default function NoteCard({
  note,
  onOpen,
  onDelete,
  onDuplicate,
  onToggleCheckbox,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const visibleLines = note.lines.slice(0, 6);
  const hasMore = note.lines.length > 6;

  return (
    <div className="note-card panel hud-corners fade-slide-in">
      <span className="hud-corner hc-tl" />
      <span className="hud-corner hc-tr" />
      <span className="hud-corner hc-bl" />
      <span className="hud-corner hc-br" />

      <div className="note-card-header">
        <button
          className="note-card-title"
          onClick={onOpen}
          title="Abrir nota"
        >
          {note.title || "Sin título"}
        </button>

        <div className="note-card-actions" ref={menuRef}>
          <button
            className="btn-icon btn-ghost icon-only"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Más opciones"
            aria-haspopup="true"
            aria-expanded={menuOpen}
          >
            <DotsIcon />
          </button>
          {menuOpen && (
            <div className="dropdown fade-slide-in">
              <button
                onClick={() => {
                  onOpen();
                  setMenuOpen(false);
                }}
              >
                Editar
              </button>
              <button
                onClick={() => {
                  onDuplicate();
                  setMenuOpen(false);
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

      <div className="note-card-body" onClick={onOpen}>
        {visibleLines.length === 0 ||
        visibleLines.every((l) => !l.text.trim()) ? (
          <p className="note-empty-hint">Nota vacía…</p>
        ) : (
          visibleLines.map((line) =>
            line.type === "checkbox" ? (
              <label
                key={line.id}
                className={`note-check-line ${line.checked ? "checked" : ""}`}
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="checkbox"
                  checked={line.checked}
                  onChange={() => onToggleCheckbox(line.id)}
                />
                <span>{line.text || "\u00A0"}</span>
              </label>
            ) : (
              line.text.trim() && (
                <p key={line.id} className="note-text-line">
                  {line.text}
                </p>
              )
            )
          )
        )}
        {hasMore && <p className="note-more-hint">···</p>}
      </div>

      <button
        className="note-delete-btn"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        aria-label="Eliminar nota"
      >
        <TrashIcon />
      </button>
    </div>
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

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="15"
      height="15"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-9 0 1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
    </svg>
  );
}
