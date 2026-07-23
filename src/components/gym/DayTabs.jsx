export default function DayTabs({ days, selectedId, onSelect }) {
  return (
    <div className="day-tabs" role="tablist" aria-label="Elegir día">
      {days.map((d) => (
        <button
          key={d.id}
          role="tab"
          aria-selected={d.id === selectedId}
          className={`day-tab ${d.id === selectedId ? "active" : ""}`}
          onClick={() => onSelect(d.id)}
        >
          {d.name.slice(0, 3).toUpperCase()}
        </button>
      ))}
    </div>
  );
}
