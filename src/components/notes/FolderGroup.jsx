import NoteCard from "./NoteCard.jsx";
import Button from "../Button.jsx";

export default function FolderGroup({
  folder,
  notes,
  onToggle,
  onDeleteFolder,
  onAddNote,
  onOpenNote,
  onDeleteNote,
  onDuplicateNote,
  onToggleCheckbox,
}) {
  return (
    <div className="folder-group panel fade-slide-in">
      <button className="folder-header" onClick={onToggle}>
        <span className={`folder-chevron ${folder.expanded ? "open" : ""}`}>
          <ChevronIcon />
        </span>
        <FolderIcon />
        <span className="folder-name">{folder.name}</span>
        <span className="folder-count">{notes.length}</span>
      </button>

      {folder.expanded && (
        <div className="folder-body fade-slide-in">
          <div className="folder-actions">
            <Button variant="btn-ghost" className="small" onClick={onAddNote}>
              + NOTA AQUÍ
            </Button>
            <Button
              variant="btn-ghost btn-danger"
              className="small"
              onClick={onDeleteFolder}
            >
              ELIMINAR CARPETA
            </Button>
          </div>

          {notes.length === 0 ? (
            <p className="folder-empty">Carpeta vacía.</p>
          ) : (
            <div className="notes-grid">
              {notes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onOpen={() => onOpenNote(note.id)}
                  onDelete={() => onDeleteNote(note.id)}
                  onDuplicate={() => onDuplicateNote(note.id)}
                  onToggleCheckbox={(lineId) =>
                    onToggleCheckbox(note.id, lineId)
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function FolderIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 7a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z" />
    </svg>
  );
}
