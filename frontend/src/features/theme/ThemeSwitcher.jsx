import { useTheme } from './hooks/useTheme'
import ThemeToggle from './components/ThemeToggle'

// Composes the theme hook with its control, mirroring tasks/TasksPage.jsx.
export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  return <ThemeToggle theme={theme} onChange={setTheme} />
}
