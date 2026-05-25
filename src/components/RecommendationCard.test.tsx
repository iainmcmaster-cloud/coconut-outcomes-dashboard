import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
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

beforeEach(() => {
  vi.clearAllMocks()
})

describe('RecommendationCard — act flow', () => {
  it('calls onAct immediately when CTA is clicked', async () => {
    const onAct = vi.fn()
    render(<RecommendationCard {...defaultProps} onAct={onAct} />)
    await userEvent.click(screen.getByRole('button', { name: 'Take Action' }))
    expect(onAct).toHaveBeenCalledTimes(1)
  })
})

describe('RecommendationCard — dismiss flow', () => {
  it('shows reason prompt when Dismiss is clicked', async () => {
    render(<RecommendationCard {...defaultProps} />)
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(screen.getByText('Why are you dismissing this?')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Not relevant' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Already done' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Do later' })).toBeInTheDocument()
  })

  it('keeps the dimension badge visible in dismissing state', async () => {
    render(<RecommendationCard {...defaultProps} />)
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(screen.getByText('Growth')).toBeInTheDocument()
  })

  it('calls onDismiss with "Not relevant"', async () => {
    const onDismiss = vi.fn()
    render(<RecommendationCard {...defaultProps} onDismiss={onDismiss} />)
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    await userEvent.click(screen.getByRole('button', { name: 'Not relevant' }))
    expect(onDismiss).toHaveBeenCalledWith('Not relevant')
  })

  it('calls onDismiss with "Already done"', async () => {
    const onDismiss = vi.fn()
    render(<RecommendationCard {...defaultProps} onDismiss={onDismiss} />)
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    await userEvent.click(screen.getByRole('button', { name: 'Already done' }))
    expect(onDismiss).toHaveBeenCalledWith('Already done')
  })

  it('calls onDismiss with "Do later"', async () => {
    const onDismiss = vi.fn()
    render(<RecommendationCard {...defaultProps} onDismiss={onDismiss} />)
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    await userEvent.click(screen.getByRole('button', { name: 'Do later' }))
    expect(onDismiss).toHaveBeenCalledWith('Do later')
  })
})
