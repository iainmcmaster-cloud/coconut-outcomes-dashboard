export type Dimension = 'Growth' | 'Productivity' | 'Customer Experience'
export type DismissReason = 'Not relevant' | 'Already done' | 'Do later'
export const DISMISS_REASONS: DismissReason[] = ['Not relevant', 'Already done', 'Do later']

export interface Recommendation {
  id: string
  title: string
  context: string
  impact: string
  dimension: Dimension
  ctaLabel: string
}

export const RECOMMENDATIONS: Recommendation[] = [
  { id: 'rec-1', dimension: 'Growth', title: 'Reduce mortgage lead times.', context: 'Lead times are 50% higher than industry average.', impact: '+12% customer retention over 90 days', ctaLabel: 'Take Action' },
  { id: 'rec-2', dimension: 'Growth', title: 'Enable walk-in appointments.', context: 'Walk-in rate is 0%. Competitors see 8% higher deposits.', impact: '+8% deposit volume in 60 days', ctaLabel: 'Configure' },
  { id: 'rec-3', dimension: 'Growth', title: 'Expand high-value advisor hours.', context: 'High-value meetings peak 4–6 PM but advisors end at 4 PM.', impact: '+18% high-value engagement rate', ctaLabel: 'Schedule' },
  { id: 'rec-4', dimension: 'Growth', title: 'Launch referral incentive program.', context: 'Referral bookings are 3× more likely to convert.', impact: '+22% new client acquisition in 120 days', ctaLabel: 'Review' },
  { id: 'rec-5', dimension: 'Productivity', title: 'Simplify your service menu.', context: '35 services listed. Reducing to 20 lifts conversion.', impact: '+15% booking conversion rate', ctaLabel: 'Configure' },
  { id: 'rec-6', dimension: 'Productivity', title: 'Automate appointment reminders.', context: 'Manual reminders are sent inconsistently across branches.', impact: '−18% no-show rate within 30 days', ctaLabel: 'Enable' },
  { id: 'rec-7', dimension: 'Productivity', title: 'Reduce no-shows with confirmations.', context: 'No-show rate is 14%. Industry benchmark is 8%.', impact: '−30% no-show rate in 60 days', ctaLabel: 'Enable' },
  { id: 'rec-8', dimension: 'Productivity', title: 'Consolidate duplicate service types.', context: '6 overlapping services create booking confusion.', impact: '+10% staff utilisation rate', ctaLabel: 'Review' },
  { id: 'rec-9', dimension: 'Customer Experience', title: 'Improve lobby wait time visibility.', context: 'Avg wait is 18 min with no visibility to clients.', impact: '−22% perceived wait time complaints', ctaLabel: 'Enable' },
  { id: 'rec-10', dimension: 'Customer Experience', title: 'Add post-visit feedback collection.', context: 'Only 12% of visits generate satisfaction feedback.', impact: '+40% feedback response rate in 45 days', ctaLabel: 'Set Up' },
  { id: 'rec-11', dimension: 'Customer Experience', title: 'Enable self-serve rescheduling.', context: 'Rescheduling requires a phone call for 80% of clients.', impact: '−35% inbound reschedule calls in 30 days', ctaLabel: 'Enable' },
  { id: 'rec-12', dimension: 'Customer Experience', title: 'Surface next-best product offers.', context: 'Post-visit product suggestions shown to only 5% of clients.', impact: '+9% cross-sell conversion in 90 days', ctaLabel: 'Configure' },
]

export function sortByPriority(recs: Recommendation[], priority: Dimension | null): Recommendation[] {
  if (!priority) return [...recs]
  return [
    ...recs.filter(r => r.dimension === priority),
    ...recs.filter(r => r.dimension !== priority),
  ]
}
