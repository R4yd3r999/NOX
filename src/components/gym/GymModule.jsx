import { useEffect, useRef, useState } from "react";
import { loadState, saveState } from "../../lib/storage.js";
import { defaultGymState, makeDay, migrateGymState } from "../../lib/gymDefaults.js";
import { convertAllExercises } from "../../lib/weightConvert.js";
import Button from "../Button.jsx";
import DayCard from "./DayCard.jsx";
import DayTabs from "./DayTabs.jsx";
import DuplicateModal from "./DuplicateModal.jsx";

export default function GymModule() {
  const [gym, setGym] = useState(() =>
    migrateGymState(loadState("gym", defaultGymState()))
  );
  const [duplicateSource, setDuplicateSource] = useState(null);
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);

  const selectedDayId = gym.selectedDayId || gym.days[0]?.id;
  const selectedDay = gym.days.find((d) => d.id === selectedDayId) || gym.days[0];

  useEffect(() => saveState("gym", gym), [gym]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  function updateDay(dayId, updater) {
    setGym((prev) => ({
      ...prev,
      days: prev.days.map((d) => (d.id === dayId ? updater(d) : d)),
    }));
  }

  function handleSelectDay(dayId) {
    setGym((prev) => ({ ...prev, selectedDayId: dayId }));
  }

  function toggleLayout() {
    setGym((prev) => ({
      ...prev,
      layout: prev.layout === "list" ? "sections" : "list",
    }));
  }

  function toggleUnit() {
    setGym((prev) => {
      const nextUnit = prev.unit === "kg" ? "lb" : "kg";
      return {
        ...prev,
        unit: nextUnit,
        days: convertAllExercises(prev.days, prev.unit, nextUnit),
      };
    });
  }

  function handleDuplicateConfirm(targetDayId, mode, versionId) {
    if (!duplicateSource) return;
    const sourceDay = gym.days.find((d) => d.id === duplicateSource.dayId);
    const sourceVersion = sourceDay?.versions.find(
      (v) => v.id === duplicateSource.versionId
    );
    if (!sourceVersion) return;

    const clonedExercises = sourceVersion.exercises.map((ex) => ({
      ...ex,
      id: `${ex.id}_${Math.random().toString(36).slice(2, 7)}`,
    }));

    setGym((prev) => ({
      ...prev,
      days: prev.days.map((d) => {
        if (d.id !== targetDayId) return d;
        if (mode === "new") {
          const label = sourceVersion.label + " copia";
          const newVersion = {
            id: `ver_${Math.random().toString(36).slice(2, 9)}`,
            label,
            exercises: clonedExercises,
          };
          return {
            ...d,
            versions: [...d.versions, newVersion],
            activeVersion: d.versions.length,
          };
        }
        return {
          ...d,
          versions: d.versions.map((v) =>
            v.id === versionId ? { ...v, exercises: clonedExercises } : v
          ),
        };
      }),
    }));
    setDuplicateSource(null);
    setToast("Día duplicado correctamente");
  }

  function handleExport() {
    const payload = {
      app: "NOX",
      module: "gym",
      exportedAt: new Date().toISOString(),
      data: gym,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `nox-rutinas-backup-${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setToast("Backup exportado");
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function handleImportFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        const incoming = parsed?.data ?? parsed;
        if (!incoming?.days || !Array.isArray(incoming.days)) {
          throw new Error("Formato inválido");
        }
        setGym(
          migrateGymState({
            unit: incoming.unit === "lb" ? "lb" : "kg",
            layout: incoming.layout === "sections" ? "sections" : "list",
            selectedDayId: incoming.selectedDayId || incoming.days[0]?.id,
            days: incoming.days,
          })
        );
        setToast("Backup importado correctamente");
      } catch (err) {
        console.error(err);
        setToast("El archivo no es un backup válido");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <div className="fade-slide-in">
      <div className="gym-toolbar">
        <Button variant="btn-ghost" onClick={toggleLayout}>
          {gym.layout === "list" ? <LayoutGridIcon /> : <LayoutListIcon />}
          {gym.layout === "list" ? "VISTA POR DÍA" : "VISTA LISTA"}
        </Button>

        <Button variant="btn-ghost" onClick={toggleUnit}>
          <ScaleIcon />
          UNIDAD: {gym.unit.toUpperCase()}
        </Button>

        <div style={{ flex: 1 }} />

        <Button variant="btn-ghost" onClick={handleImportClick}>
          <ImportIcon />
          IMPORTAR
        </Button>
        <Button variant="btn-primary" onClick={handleExport}>
          <ExportIcon />
          EXPORTAR BACKUP
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          style={{ display: "none" }}
          onChange={handleImportFile}
        />
      </div>

      {gym.layout === "sections" ? (
        <>
          <DayTabs
            days={gym.days}
            selectedId={selectedDayId}
            onSelect={handleSelectDay}
          />
          <div className="day-focus">
            {selectedDay && (
              <DayCard
                key={selectedDay.id}
                day={selectedDay}
                unit={gym.unit}
                onUpdateDay={(updater) => updateDay(selectedDay.id, updater)}
                onRequestDuplicate={(versionId) =>
                  setDuplicateSource({ dayId: selectedDay.id, versionId })
                }
              />
            )}
          </div>
        </>
      ) : (
        <div className="days-list">
          {gym.days.map((day) => (
            <DayCard
              key={day.id}
              day={day}
              unit={gym.unit}
              onUpdateDay={(updater) => updateDay(day.id, updater)}
              onRequestDuplicate={(versionId) =>
                setDuplicateSource({ dayId: day.id, versionId })
              }
            />
          ))}
        </div>
      )}

      {duplicateSource && (
        <DuplicateModal
          days={gym.days}
          sourceDayId={duplicateSource.dayId}
          onClose={() => setDuplicateSource(null)}
          onConfirm={handleDuplicateConfirm}
        />
      )}

      {toast && <div className="toast fade-slide-in">{toast}</div>}
    </div>
  );
}

function LayoutListIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
    </svg>
  );
}
function LayoutGridIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3.5" y="4.5" width="6" height="15" rx="1" />
      <rect x="14.5" y="4.5" width="6" height="15" rx="1" />
    </svg>
  );
}
function ScaleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3v18M7 7l-4 8a4 4 0 0 0 8 0Zm10 0-4 8a4 4 0 0 0 8 0Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ImportIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3v12m0 0 4-4m-4 4-4-4M4 19h16" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ExportIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 15V3m0 0 4 4m-4-4L8 7M4 19h16" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
