import { darkThemeInit, applyThemeVariant } from 'TaskDesk/js/navigation/theme'
import { describe, expect, test } from 'vitest'

describe('navigation app', () => {
    test('initial theme variant loading', () => {
        expect(darkThemeInit()).toBe(false)
    })

    test('applying theme variant', () => {
        expect(document.documentElement.classList.contains('dark')).toBe(false)
        applyThemeVariant(true)
        expect(document.documentElement.classList.contains('dark')).toBe(true)
        applyThemeVariant(false)
        expect(document.documentElement.classList.contains('dark')).toBe(false)
    })
})