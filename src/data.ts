// ── Types ────────────────────────────────────────────────────────────────────

export type OutcomeCounts = {
  closedBiz: number
  genOpp: number
  strengthRel: number
  providedInfo: number
  nextSteps: number
  didNotAch: number
  noShow: number
  cancelled: number
  doNotTrack: number
}

export type BaseRow = {
  name: string
  c: OutcomeCounts
  prev: number
}

export type StaffMemberRow = BaseRow & {
  group: string
  location: string
}

export type ExtraCol = {
  key: string
  label: string
}

export type OutcomeDef = {
  key: keyof OutcomeCounts
  label: string
  color: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export const sumCounts = (c: OutcomeCounts): number =>
  Object.values(c).reduce((a, b) => a + b, 0)

export const pct = (n: number, t: number): string =>
  t ? (n / t * 100).toFixed(1) : '0.0'

export const fmt = (n: number): string =>
  Number(n).toLocaleString('en-US')

export const deltaStr = (curr: number, prev: number): string => {
  const d = ((curr - prev) / prev * 100).toFixed(1)
  return (Number(d) >= 0 ? '▲ +' : '▼ ') + d + '%'
}

export const deltaPp = (curr: number, prev: number): string => {
  const d = (curr - prev).toFixed(1)
  return (Number(d) >= 0 ? '▲ +' : '▼ ') + d + 'pp'
}

export const isUp = (curr: number, prev: number): boolean => curr >= prev

// ── Outcome definitions ───────────────────────────────────────────────────────

export const OUTCOMES: OutcomeDef[] = [
  { key: 'closedBiz',    label: 'Closed New Business',                     color: '#1a7a4a' },
  { key: 'genOpp',       label: 'Generated Opportunity / Lead / Referral',  color: '#34a85a' },
  { key: 'strengthRel',  label: 'Strengthened Client Relationship',         color: '#1A73E8' },
  { key: 'providedInfo', label: 'Provided Information / Education',         color: '#60a5fa' },
  { key: 'nextSteps',    label: 'Established Next Steps',                   color: '#0d9488' },
  { key: 'didNotAch',    label: 'Did Not Achieve Goal',                     color: '#f59e0b' },
  { key: 'noShow',       label: 'No-Show',                                  color: '#ef4444' },
  { key: 'cancelled',    label: 'Cancelled',                                color: '#9ca3af' },
  { key: 'doNotTrack',   label: 'Outcome not tracked',                      color: '#6B7280' },
]

// Keys that get the red badge treatment in tables
export const RED_BADGE_KEYS: (keyof OutcomeCounts)[] = ['noShow', 'cancelled']

// ── Mock data ─────────────────────────────────────────────────────────────────

export const LOCATIONS: BaseRow[] = [
  { name: 'Downtown Branch',           c: { closedBiz: 52, genOpp: 34, strengthRel: 63, providedInfo: 43, nextSteps: 29, didNotAch: 23, noShow: 14, cancelled: 12, doNotTrack: 17 }, prev: 251 },
  { name: 'Westside Financial Center', c: { closedBiz: 44, genOpp: 29, strengthRel: 53, providedInfo: 36, nextSteps: 24, didNotAch: 19, noShow: 12, cancelled: 10, doNotTrack: 16 }, prev: 218 },
  { name: 'Northgate Branch',          c: { closedBiz: 36, genOpp: 24, strengthRel: 43, providedInfo: 29, nextSteps: 20, didNotAch: 16, noShow: 10, cancelled:  8, doNotTrack: 12 }, prev: 181 },
  { name: 'Eastview Office',           c: { closedBiz: 31, genOpp: 21, strengthRel: 38, providedInfo: 26, nextSteps: 18, didNotAch: 14, noShow:  9, cancelled:  7, doNotTrack: 12 }, prev: 161 },
  { name: 'Millbrook Branch',          c: { closedBiz: 27, genOpp: 18, strengthRel: 34, providedInfo: 23, nextSteps: 15, didNotAch: 12, noShow:  8, cancelled:  6, doNotTrack: 11 }, prev: 137 },
  { name: 'Riverside Financial',       c: { closedBiz: 25, genOpp: 17, strengthRel: 31, providedInfo: 21, nextSteps: 14, didNotAch: 11, noShow:  7, cancelled:  6, doNotTrack: 10 }, prev: 128 },
  { name: 'Harbor Point Branch',       c: { closedBiz: 23, genOpp: 15, strengthRel: 28, providedInfo: 19, nextSteps: 13, didNotAch: 10, noShow:  6, cancelled:  5, doNotTrack:  9 }, prev: 113 },
  { name: 'Greenfield Office',         c: { closedBiz: 21, genOpp: 14, strengthRel: 25, providedInfo: 17, nextSteps: 11, didNotAch:  9, noShow:  6, cancelled:  4, doNotTrack:  8 }, prev: 102 },
  { name: 'Lakewood Branch',           c: { closedBiz: 17, genOpp: 12, strengthRel: 22, providedInfo: 15, nextSteps: 10, didNotAch:  7, noShow:  5, cancelled:  4, doNotTrack:  6 }, prev:  88 },
  { name: 'Sunridge Financial Center', c: { closedBiz: 15, genOpp: 10, strengthRel: 19, providedInfo: 13, nextSteps:  9, didNotAch:  7, noShow:  4, cancelled:  3, doNotTrack:  7 }, prev:  79 },
  { name: 'Parkview Branch',           c: { closedBiz: 13, genOpp:  9, strengthRel: 17, providedInfo: 11, nextSteps:  8, didNotAch:  6, noShow:  4, cancelled:  3, doNotTrack:  5 }, prev:  70 },
  { name: 'Valley Office',             c: { closedBiz: 11, genOpp:  7, strengthRel: 14, providedInfo: 10, nextSteps:  6, didNotAch:  5, noShow:  3, cancelled:  2, doNotTrack:  4 }, prev:  57 },
]

export const STAFF_GROUPS: BaseRow[] = [
  { name: 'Senior Financial Advisor', c: { closedBiz: 138, genOpp: 92, strengthRel: 168, providedInfo: 115, nextSteps: 78, didNotAch: 61, noShow: 38, cancelled: 32, doNotTrack: 42 }, prev: 700 },
  { name: 'Advisor',                  c: { closedBiz: 142, genOpp: 95, strengthRel: 173, providedInfo: 118, nextSteps: 81, didNotAch: 63, noShow: 39, cancelled: 33, doNotTrack: 44 }, prev: 722 },
  { name: 'Call Centre',              c: { closedBiz:  35, genOpp: 23, strengthRel:  72, providedInfo:  49, nextSteps: 28, didNotAch: 23, noShow: 14, cancelled: 11, doNotTrack: 21 }, prev: 236 },
]

export const STAFF_MEMBERS: StaffMemberRow[] = [
  { name: 'Sarah Mitchell',    group: 'Senior Financial Advisor', location: 'Downtown Branch',           c: { closedBiz: 22, genOpp: 15, strengthRel: 28, providedInfo: 19, nextSteps: 13, didNotAch: 10, noShow: 6, cancelled: 5, doNotTrack: 7 },  prev: 112 },
  { name: 'James Thornton',    group: 'Senior Financial Advisor', location: 'Westside Financial Center', c: { closedBiz: 20, genOpp: 13, strengthRel: 25, providedInfo: 17, nextSteps: 12, didNotAch:  9, noShow: 5, cancelled: 4, doNotTrack: 6 },  prev:  99 },
  { name: 'Patricia Wong',     group: 'Senior Financial Advisor', location: 'Northgate Branch',          c: { closedBiz: 19, genOpp: 13, strengthRel: 23, providedInfo: 16, nextSteps: 11, didNotAch:  8, noShow: 5, cancelled: 4, doNotTrack: 6 },  prev:  92 },
  { name: 'Robert Chen',       group: 'Senior Financial Advisor', location: 'Eastview Office',           c: { closedBiz: 18, genOpp: 12, strengthRel: 22, providedInfo: 15, nextSteps: 10, didNotAch:  8, noShow: 5, cancelled: 4, doNotTrack: 5 },  prev:  88 },
  { name: 'Linda Kowalski',    group: 'Senior Financial Advisor', location: 'Downtown Branch',           c: { closedBiz: 17, genOpp: 11, strengthRel: 21, providedInfo: 14, nextSteps:  9, didNotAch:  8, noShow: 5, cancelled: 4, doNotTrack: 5 },  prev:  83 },
  { name: 'David Okafor',      group: 'Senior Financial Advisor', location: 'Millbrook Branch',          c: { closedBiz: 16, genOpp: 11, strengthRel: 20, providedInfo: 14, nextSteps:  9, didNotAch:  7, noShow: 4, cancelled: 3, doNotTrack: 5 },  prev:  81 },
  { name: 'Anne-Marie Dubois', group: 'Senior Financial Advisor', location: 'Riverside Financial',       c: { closedBiz: 14, genOpp:  9, strengthRel: 17, providedInfo: 12, nextSteps:  8, didNotAch:  6, noShow: 4, cancelled: 3, doNotTrack: 4 },  prev:  72 },
  { name: 'Carlos Reyes',      group: 'Senior Financial Advisor', location: 'Harbor Point Branch',       c: { closedBiz: 12, genOpp:  8, strengthRel: 12, providedInfo:  8, nextSteps:  6, didNotAch:  5, noShow: 4, cancelled: 5, doNotTrack: 4 },  prev:  68 },
  { name: 'Emily Nakamura',    group: 'Advisor',                  location: 'Downtown Branch',           c: { closedBiz: 20, genOpp: 13, strengthRel: 25, providedInfo: 17, nextSteps: 12, didNotAch:  9, noShow: 5, cancelled: 4, doNotTrack: 6 },  prev: 101 },
  { name: 'Michael Osei',      group: 'Advisor',                  location: 'Westside Financial Center', c: { closedBiz: 18, genOpp: 12, strengthRel: 22, providedInfo: 15, nextSteps: 11, didNotAch:  8, noShow: 5, cancelled: 4, doNotTrack: 7 },  prev:  96 },
  { name: 'Hannah Fitzgerald', group: 'Advisor',                  location: 'Northgate Branch',          c: { closedBiz: 17, genOpp: 11, strengthRel: 21, providedInfo: 14, nextSteps: 10, didNotAch:  8, noShow: 5, cancelled: 4, doNotTrack: 5 },  prev:  89 },
  { name: 'Tom Schreiber',     group: 'Advisor',                  location: 'Eastview Office',           c: { closedBiz: 16, genOpp: 11, strengthRel: 19, providedInfo: 13, nextSteps:  9, didNotAch:  7, noShow: 4, cancelled: 4, doNotTrack: 6 },  prev:  84 },
  { name: 'Priya Sharma',      group: 'Advisor',                  location: 'Millbrook Branch',          c: { closedBiz: 15, genOpp: 10, strengthRel: 18, providedInfo: 12, nextSteps:  9, didNotAch:  7, noShow: 4, cancelled: 3, doNotTrack: 5 },  prev:  80 },
  { name: 'Ben Afolabi',       group: 'Advisor',                  location: 'Riverside Financial',       c: { closedBiz: 14, genOpp:  9, strengthRel: 17, providedInfo: 12, nextSteps:  8, didNotAch:  7, noShow: 4, cancelled: 3, doNotTrack: 5 },  prev:  77 },
  { name: 'Rachel Summers',    group: 'Advisor',                  location: 'Harbor Point Branch',       c: { closedBiz: 13, genOpp:  9, strengthRel: 16, providedInfo: 11, nextSteps:  7, didNotAch:  7, noShow: 4, cancelled: 3, doNotTrack: 4 },  prev:  74 },
  { name: 'Kevin Tran',        group: 'Advisor',                  location: 'Greenfield Office',         c: { closedBiz: 15, genOpp: 10, strengthRel: 20, providedInfo: 14, nextSteps:  8, didNotAch:  6, noShow: 4, cancelled: 3, doNotTrack: 5 },  prev:  78 },
  { name: 'Aisha Mensah',      group: 'Advisor',                  location: 'Lakewood Branch',           c: { closedBiz:  8, genOpp:  5, strengthRel: 10, providedInfo:  7, nextSteps:  5, didNotAch:  4, noShow: 3, cancelled: 2, doNotTrack: 4 },  prev:  45 },
  { name: 'Jordan Blake',      group: 'Advisor',                  location: 'Sunridge Financial Center', c: { closedBiz:  6, genOpp:  4, strengthRel:  8, providedInfo:  6, nextSteps:  5, didNotAch:  3, noShow: 2, cancelled: 2, doNotTrack: 3 },  prev:  39 },
  { name: 'Nicole Perreault',  group: 'Call Centre',              location: 'Downtown Branch',           c: { closedBiz:  7, genOpp:  5, strengthRel: 15, providedInfo: 10, nextSteps:  6, didNotAch:  5, noShow: 3, cancelled: 2, doNotTrack: 4 },  prev:  49 },
  { name: 'Marcus Webb',       group: 'Call Centre',              location: 'Westside Financial Center', c: { closedBiz:  7, genOpp:  4, strengthRel: 14, providedInfo: 10, nextSteps:  5, didNotAch:  5, noShow: 3, cancelled: 2, doNotTrack: 4 },  prev:  48 },
  { name: 'Fatima Al-Hassan',  group: 'Call Centre',              location: 'Northgate Branch',          c: { closedBiz:  6, genOpp:  4, strengthRel: 13, providedInfo:  9, nextSteps:  5, didNotAch:  4, noShow: 2, cancelled: 2, doNotTrack: 4 },  prev:  43 },
  { name: 'Derek Lam',         group: 'Call Centre',              location: 'Eastview Office',           c: { closedBiz:  6, genOpp:  4, strengthRel: 12, providedInfo:  8, nextSteps:  4, didNotAch:  4, noShow: 2, cancelled: 2, doNotTrack: 3 },  prev:  41 },
  { name: 'Simone Beaumont',   group: 'Call Centre',              location: 'Millbrook Branch',          c: { closedBiz:  5, genOpp:  3, strengthRel: 10, providedInfo:  7, nextSteps:  4, didNotAch:  3, noShow: 2, cancelled: 2, doNotTrack: 3 },  prev:  38 },
  { name: 'Omar Hassan',       group: 'Call Centre',              location: 'Downtown Branch',           c: { closedBiz:  4, genOpp:  3, strengthRel:  8, providedInfo:  5, nextSteps:  4, didNotAch:  2, noShow: 2, cancelled: 1, doNotTrack: 3 },  prev:  37 },
]

export const SERVICES: BaseRow[] = [
  { name: 'General Banking',   c: { closedBiz:  62, genOpp: 42, strengthRel:  95, providedInfo: 65, nextSteps: 44, didNotAch: 34, noShow: 21, cancelled: 18, doNotTrack: 28 }, prev: 369 },
  { name: 'Mortgage',          c: { closedBiz:  78, genOpp: 52, strengthRel:  68, providedInfo: 46, nextSteps: 31, didNotAch: 25, noShow: 15, cancelled: 13, doNotTrack: 17 }, prev: 308 },
  { name: 'Investments',       c: { closedBiz:  65, genOpp: 43, strengthRel:  72, providedInfo: 49, nextSteps: 33, didNotAch: 26, noShow: 16, cancelled: 14, doNotTrack: 19 }, prev: 314 },
  { name: 'Loans',             c: { closedBiz:  52, genOpp: 35, strengthRel:  61, providedInfo: 42, nextSteps: 28, didNotAch: 22, noShow: 14, cancelled: 11, doNotTrack: 17 }, prev: 271 },
  { name: 'Credit Cards',      c: { closedBiz:  38, genOpp: 25, strengthRel:  52, providedInfo: 36, nextSteps: 24, didNotAch: 19, noShow: 12, cancelled: 10, doNotTrack: 14 }, prev: 236 },
  { name: 'Open Bank Account', c: { closedBiz:  20, genOpp: 13, strengthRel:  65, providedInfo: 44, nextSteps: 27, didNotAch: 21, noShow: 13, cancelled: 11, doNotTrack: 15 }, prev: 196 },
]
