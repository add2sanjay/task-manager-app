import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { DEFAULT_THEME, STORAGE_KEY, THEMES, applyTheme, loadTheme, saveTheme } from '../theme'

const css = readFileSync(new URL('../../../App.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')

function rule(selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = css.match(new RegExp(`(?:^|\\})\\s*${escaped}\\s*\\{([^}]*)\\}`))
  return match ? match[1] : ''
}

function memoryStorage(initial = {}) {
  const data = { ...initial }
  return {
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => { data[key] = String(value) },
    data,
  }
}

const THEME_VARS = ['--page-bg', '--surface', '--text', '--text-muted', '--heading', '--border', '--focus']

describe('theme options (issue #2)', () => {
  it('offers exactly Dark, White and Default', () => {
    expect(THEMES.map((t) => t.id).sort()).toEqual(['dark', 'default', 'white'])
    expect(THEMES.map((t) => t.label).sort()).toEqual(['Dark', 'Default', 'White'])
    expect(DEFAULT_THEME).toBe('default')
  })

  it('falls back to Default when nothing valid is saved', () => {
    expect(loadTheme(memoryStorage())).toBe('default')
    expect(loadTheme(memoryStorage({ [STORAGE_KEY]: 'purple' }))).toBe('default')
    expect(loadTheme(undefined)).toBe('default')
    const throwing = { getItem: () => { throw new Error('blocked') } }
    expect(loadTheme(throwing)).toBe('default')
  })

  it('saves the chosen theme and restores it', () => {
    const storage = memoryStorage()
    saveTheme('dark', storage)
    expect(storage.data[STORAGE_KEY]).toBe('dark')
    expect(loadTheme(storage)).toBe('dark')
    saveTheme('white', storage)
    expect(loadTheme(storage)).toBe('white')
  })

  it('applies the theme as a data-theme attribute on the root element', () => {
    const root = { dataset: {} }
    applyTheme('dark', root)
    expect(root.dataset.theme).toBe('dark')
    applyTheme('default', root)
    expect(root.dataset.theme).toBe('default')
  })

  it('defines every theme colour variable for Default, Dark and White', () => {
    for (const selector of [':root', '[data-theme="dark"]', '[data-theme="white"]']) {
      const block = rule(selector)
      for (const name of THEME_VARS) {
        expect(block, `${selector} ${name}`).toMatch(new RegExp(`${name}:`))
      }
    }
  })

  it('styles the page through the theme variables', () => {
    expect(rule('body')).toMatch(/background:\s*var\(--page-bg\)/)
    expect(rule('body')).toMatch(/color:\s*var\(--text\)/)
    expect(rule('h1')).toMatch(/color:\s*var\(--heading\)/)
    expect(rule('.task-item')).toMatch(/background:\s*var\(--surface\)/)
  })
})
