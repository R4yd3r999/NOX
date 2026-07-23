import { useEffect, useMemo, useState } from "react";
import { uid } from "../../lib/id.js";
import { loadState, saveState } from "../../lib/storage.js";
import Button from "../Button.jsx";
import NoteCard from "./NoteCard.jsx";
import NoteEditor from "./NoteEditor.jsx";
import FolderGroup from "./FolderGroup.jsx";

function newLine(type = "text") {
  return { id: uid("ln"), text: "", type, checked: false };
}

function makeNote(folderId = null) {
  return {
    id: uid("note"),
    title: "",
    lines: [newLine()],
    folderId,
    updatedAt: Date.now(),
  };
}

export default function NotesModule() {
  const [notes, setNotes] = useState(() => loadState("notes", []));
  const [folders, setFolders] = useState(() => loadState("folders", []));
  const [editingId, setEditingId] = useState(null);
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  useEffect(() => saveState("notes", notes), [notes]);
  useEffect(() => saveState("folders", folders), [folders]);

  const unfiledNotes = useMemo(
    () => notes.filter((n) => !n.folderId),
    [notes]
  );

  function handleCreateNote(folderId = null) {
    const note = makeNote(folderId);
    setNotes((prev) => [note, ...prev]);
    setEditingId(note.id);
  }

  function handleUpdateNote(id, updater) {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...updater(n), updatedAt: Date.now() } : n
      )
    );
  }

  function handleDeleteNote(id) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (editingId === id) setEditingId(null);
  }

  function handleDuplicateNote(id) {
    setNotes((prev) => {
      const original = prev.find((n) => n.id === id);
      if (!original) return prev;
      const copy = {
        ...original,
        id: uid("note"),
        title: original.title ? `${original.title} (copia)` : "",
        lines: original.lines.map((l) => ({ ...l, id: uid("ln") })),
        updatedAt: Date.now(),
      };
      const idx = prev.findIndex((n) => n.id === id);
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
  }

  function handleCreateFolder() {
    const name = newFolderName.trim();
    if (!name) return;
    setFolders((prev) => [
      ...prev,
      { id: uid("folder"), name, expanded: true },
    ]);
    setNewFolderName("");
    setCreatingFolder(false);
  }

  function handleDeleteFolder(folderId) {
    setFolders((prev) => prev.filter((f) => f.id !== folderId));
    setNotes((prev) =>
      prev.map((n) => (n.folderId === folderId ? { ...n, folderId: null } : n))
    );
  }

  function handleToggleFolder(folderId) {
    setFolders((prev) =>
      prev.map((f) =>
        f.id === folderId ? { ...f, expanded: !f.expanded } : f
      )
    );
  }

  const editingNote = notes.find((n) => n.id === editingId) || null;

  return (
    <div className="fade-slide-in">
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 18,
          flexWrap: "wrap",
        }}
      >
        <Button variant="btn-primary" onClick={() => handleCreateNote(null)}>
          + NUEVA NOTA
        </Button>
        <Button variant="btn-ghost" onClick={() => setCreatingFolder(true)}>
          + CARPETA
        </Button>
      </div>

      {creatingFolder && (
        <div className="panel fade-slide-in" style={{ padding: 14, marginBottom: 16 }}>
          <input
            autoFocus
            className="field"
            placeholder="Nombre de la carpeta"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreateFolder();
              if (e.key === "Escape") setCreatingFolder(false);
            }}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <Button variant="btn-primary" onClick={handleCreateFolder}>
              CREAR
            </Button>
            <Button
              variant="btn-ghost"
              onClick={() => {
                setCreatingFolder(false);
                setNewFolderName("");
              }}
            >
              CANCELAR
            </Button>
          </div>
        </div>
      )}

      {folders.map((folder) => (
        <FolderGroup
          key={folder.id}
          folder={folder}
          notes={notes.filter((n) => n.folderId === folder.id)}
          onToggle={() => handleToggleFolder(folder.id)}
          onDeleteFolder={() => handleDeleteFolder(folder.id)}
          onAddNote={() => handleCreateNote(folder.id)}
          onOpenNote={setEditingId}
          onDeleteNote={handleDeleteNote}
          onDuplicateNote={handleDuplicateNote}
          onToggleCheckbox={(noteId, lineId) =>
            handleUpdateNote(noteId, (n) => ({
              ...n,
              lines: n.lines.map((l) =>
                l.id === lineId ? { ...l, checked: !l.checked } : l
              ),
            }))
          }
        />
      ))}

      <p className="section-label" style={{ marginTop: folders.length ? 22 : 0 }}>
        Notas sin carpeta
      </p>

      {unfiledNotes.length === 0 && folders.length === 0 && (
        <div className="empty-state">
          <p className="empty-title">SIN REGISTROS</p>
          <p>Crea tu primera nota para empezar.</p>
        </div>
      )}

      <div className="notes-grid">
        {unfiledNotes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onOpen={() => setEditingId(note.id)}
            onDelete={() => handleDeleteNote(note.id)}
            onDuplicate={() => handleDuplicateNote(note.id)}
            onToggleCheckbox={(lineId) =>
              handleUpdateNote(note.id, (n) => ({
                ...n,
                lines: n.lines.map((l) =>
                  l.id === lineId ? { ...l, checked: !l.checked } : l
                ),
              }))
            }
          />
        ))}
      </div>

      {editingNote && (
        <NoteEditor
          note={editingNote}
          folders={folders}
          onClose={() => setEditingId(null)}
          onChange={(updater) => handleUpdateNote(editingNote.id, updater)}
          onDelete={() => handleDeleteNote(editingNote.id)}
          onDuplicate={() => handleDuplicateNote(editingNote.id)}
        />
      )}
    </div>
  );
}

export { newLine, makeNote };
