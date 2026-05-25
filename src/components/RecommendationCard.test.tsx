import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import RecommendationCard from './RecommendationCard'

const defaultProps = {
  title: 'Reduce mortgage lead times.',
  context: 'Lead times are 50% higher than industry average.',
  impact: '+12% customer retention over 90 days',
  dimension: 'Growth' as const,
  ctaLabel: 'Take Action',
  onAct: vi.fn(),
  onDismiss: vi.fn(),
}

describe('RecommendationCard — idle state', () => {
  it('renders the dimension badge', () => {
    render(<RecommendationCard {...defaultProps} />)
    expect(screen.getByText('Growth')).toBeInTheDocument()
  })

  it('renders the title', () => {
    render(<RecommendationCard {...defaultProps} />)
    expect(screen.getByText('Reduce mortgage lead times.')).toBeInTheDocument()
  })

  it('renders the context line', () => {
    render(<RecommendationCard {...defaultProps} />)
    expect(screen.getByText('Lead times are 50% higher than industry average.')).toBeInTheDocument()
  })

  it('renders the impact value', () => {
    render(<RecommendationCard {...defaultProps} />)
    expect(screen.getByText('+12% customer retention over 90 days')).toBeInTheDocument()
  })

  it('renders the CTA button with the ctaLabel', () => {
    render(<RecommendationCard {...defaultProps} />)
    expect(screen.getByRole('button', { name: 'Take Action' })).toBeInTheDocument()
  })

  it('renders the Dismiss button', () => {
    render(<RecommendationCard {...defaultProps} />)
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument()
  })
})
