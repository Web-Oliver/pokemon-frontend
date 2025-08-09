import { describe, expect, it } from 'vitest'
import { generateId, capitalize, isEmpty, safeJsonParse } from '../common'

describe('common utilities', () => {
  it('generateId creates unique identifiers', () => {
    const id1 = generateId('test')
    const id2 = generateId('test')
    
    expect(id1).toContain('test_')
    expect(id2).toContain('test_')
    expect(id1).not.toBe(id2)
  })

  it('capitalize handles various inputs correctly', () => {
    expect(capitalize('hello')).toBe('Hello')
    expect(capitalize('HELLO')).toBe('Hello')
    expect(capitalize('')).toBe('')
    expect(capitalize(null as any)).toBe(null)
  })

  it('isEmpty correctly identifies empty values', () => {
    expect(isEmpty(null)).toBe(true)
    expect(isEmpty(undefined)).toBe(true)
    expect(isEmpty('')).toBe(true)
    expect(isEmpty([])).toBe(true)
    expect(isEmpty({})).toBe(true)
    expect(isEmpty('text')).toBe(false)
    expect(isEmpty([1])).toBe(false)
    expect(isEmpty({key: 'value'})).toBe(false)
  })

  it('safeJsonParse handles valid and invalid JSON', () => {
    expect(safeJsonParse('{"key": "value"}', {})).toEqual({key: 'value'})
    expect(safeJsonParse('invalid json', {fallback: true})).toEqual({fallback: true})
  })
})