const TABS = [
  {
    id: "notes",
    label: "NOTAS",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M6 4h9l5 5v11a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" />
        <path d="M14 4v5h5" />
        <path d="M8 13h6M8 16.5h4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "gym",
    label: "RUTINAS",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path
          d="M4 8v8M2 10v4M20 8v8M22 10v4M7 12h10M7 8v8M17 8v8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export default function NavBar({ active, onChange }) {
  return (
    <nav className="navbar" role="tablist" aria-label="Módulos">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={active === tab.id}
          className={`nav-btn ${active === tab.id ? "active" : ""}`}
          onClick={() => onChange(tab.id)}
        >
          {active === tab.id && <span className="nav-tick" />}
          <span className="nav-icon">{tab.icon}</span>
          <span className="nav-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
