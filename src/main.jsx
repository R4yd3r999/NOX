import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// On native Android, style the system status bar to match the app instead
// of leaving the OS default (which is what made the UI look "mixed" with
// the phone's own status bar / battery icons). Dynamically imported and
// guarded so web and Electron builds never touch this.
if (window.Capacitor?.isNativePlatform?.()) {
  import('@capacitor/status-bar')
    .then(({ StatusBar, Style }) => {
      StatusBar.setOverlaysWebView({ overlay: false }).catch(() => {})
      StatusBar.setBackgroundColor({ color: '#08080a' }).catch(() => {})
      StatusBar.setStyle({ style: Style.Dark }).catch(() => {})
    })
    .catch(() => {})
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
