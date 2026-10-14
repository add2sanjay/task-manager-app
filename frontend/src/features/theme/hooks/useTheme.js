import { useEffect, useState } from 'react'
import { applyTheme, loadTheme, saveTheme } from '../theme'

export function useTheme() {
  const [theme, setTheme] = useState(() => loadTheme())

  useEffect(() => {
    applyTheme(theme)
    saveTheme(theme)
  }, [theme])

  return { theme, setTheme }
}
