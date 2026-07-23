import { useEffect, useState } from "react";
import ParticleBackground from "./components/ParticleBackground.jsx";
import NavBar from "./components/NavBar.jsx";
import SettingsPanel from "./components/SettingsPanel.jsx";
import NotesModule from "./components/notes/NotesModule.jsx";
import GymModule from "./components/gym/GymModule.jsx";
import brandIcon from "./assets/brand-icon.png";

export default function App() {
  const [activeModule, setActiveModule] = useState("notes");

  useEffect(() => {
    if (navigator.userAgent.toLowerCase().includes("electron")) {
      document.documentElement.classList.add("is-electron");
    }
    if (window.Capacitor?.isNativePlatform?.()) {
      document.documentElement.classList.add("is-native");
    }
  }, []);

  return (
    <div className="app-shell">
      <ParticleBackground />

      <div className="app-content">
        <header className="topbar">
          <div className="brand">
            <img src={brandIcon} alt="" className="brand-icon" />
            <span className="brand-mark">
              N<span>0</span>X
            </span>
          </div>
          <div className="topbar-right">
            <span className="brand-status">LOCAL · SIN CONEXIÓN</span>
            <SettingsPanel />
          </div>
        </header>

        <main className="module-view">
          {activeModule === "notes" ? <NotesModule /> : <GymModule />}
        </main>
      </div>

      <NavBar active={activeModule} onChange={setActiveModule} />
    </div>
  );
}
