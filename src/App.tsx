import { Dashboard } from './components/Dashboard'
import { PreferencesProvider } from './context/PreferencesContext'

function App() {
  return (
    <PreferencesProvider>
      <Dashboard />
    </PreferencesProvider>
  )
}

export default App
