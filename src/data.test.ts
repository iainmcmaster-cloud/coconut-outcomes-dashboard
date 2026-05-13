import { describe, it, expect } from 'vitest'
import { sumCounts, pct, fmt } from './data'

describe('sumCounts', () => {
  it('sums all values in an OutcomeCounts object', () => {
    expect(sumCounts({ closedBiz: 10, genOpp: 5, strengthRel: 3, providedInfo: 2, nextSteps: 1, didNotAch: 1, noShow: 1, cancelled: 1, doNotTrack: 1 })).toBe(25)
  })
  it('returns 0 for all-zero counts', () => {
    expect(sumCounts({ closedBiz: 0, genOpp: 0, strengthRel: 0, providedInfo: 0, nextSteps: 0, didNotAch: 0, noShow: 0, cancelled: 0, doNotTrack: 0 })).toBe(0)
  })
})

describe('pct', () => {
  it('returns percentage string to 1 decimal place', () => {
    expect(pct(1, 4)).toBe('25.0')
  })
  it('returns "0.0" when total is 0', () => {
    expect(pct(0, 0)).toBe('0.0')
  })
})

describe('fmt', () => {
  it('formats numbers with locale commas', () => {
    expect(fmt(1658)).toBe('1,658')
  })
  it('handles numbers under 1000', () => {
    expect(fmt(42)).toBe('42')
  })
})
