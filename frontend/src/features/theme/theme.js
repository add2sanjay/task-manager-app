// Available site themes. 'default' is the turquoise theme defined in :root of App.css;
// the others are [data-theme="..."] overrides in the same file.
export const THEMES = [
  { id: 'default', label: 'Default' },
  { id: 'dark', label: 'Dark' },
  { id: 'white', label: 'White' },
]

export const DEFAULT_THEME = 'default'
export const STORAGE_KEY = 'theme'

const isTheme = (id) => THEMES.some((t) => t.id === id)

// Storage may be missing or throw (e.g. privacy mode), so fall back to the default.
export function loadTheme(storage = globalThis.localStorage) {
  try {
    const saved = storage?.getItem(STORAGE_KEY)
    return isTheme(saved) ? saved : DEFAULT_THEME
  } catch {
    return DEFAULT_THEME
  }
}

export function saveTheme(theme, storage = globalThis.localStorage) {
  try {
    storage?.setItem(STORAGE_KEY, theme)
  } catch {
    // Not persisting is acceptable; the theme still applies for this session.
  }
}

export function applyTheme(theme, root = document.documentElement) {
  root.dataset.theme = theme
}
