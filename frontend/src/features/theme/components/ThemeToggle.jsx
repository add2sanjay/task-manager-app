import { THEMES } from '../theme'

export default function ThemeToggle({ theme, onChange }) {
  return (
    <label className="theme-toggle">
      Theme
      <select value={theme} onChange={(e) => onChange(e.target.value)}>
        {THEMES.map((t) => (
          <option key={t.id} value={t.id}>{t.label}</option>
        ))}
      </select>
    </label>
  )
}
