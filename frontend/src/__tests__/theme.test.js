import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const css = readFileSync(new URL('../App.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')

// Returns the declaration block of the first rule whose selector exactly matches.
function rule(selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = css.match(new RegExp(`(?:^|\\})\\s*${escaped}\\s*\\{([^}]*)\\}`))
  return match ? match[1] : ''
}

describe('turquoise theme (issue #1)', () => {
  it('defines the turquoise and dark red palette', () => {
    const root = rule(':root')
    expect(root).toMatch(/--turquoise:\s*#40e0d0/i)
    expect(root).toMatch(/--dark-red:\s*#8b0000/i)
  })

  it('uses a turquoise page background and heading', () => {
    expect(rule('body')).toMatch(/background:\s*var\(--turquoise-light\)/)
    expect(rule('h1')).toMatch(/color:\s*var\(--turquoise-dark\)/)
  })

  it('makes every button dark red with white text', () => {
    const button = rule('button')
    expect(button).toMatch(/background:\s*var\(--dark-red\)/)
    expect(button).toMatch(/color:\s*white/)
    expect(rule('button:hover')).toMatch(/background:\s*var\(--dark-red-hover\)/)
  })

  it('has no other button background colours overriding dark red', () => {
    const otherButtonBackgrounds = css
      .split('}')
      .filter((block) => /button|\.btn-/.test(block.split('{')[0]))
      .filter((block) => !/^\s*button(:hover)?\s*$/.test(block.split('{')[0]))
      .filter((block) => /background\s*:/.test(block))
    expect(otherButtonBackgrounds).toEqual([])
  })
})
