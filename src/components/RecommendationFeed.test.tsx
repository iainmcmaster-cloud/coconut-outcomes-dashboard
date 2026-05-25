import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import RecommendationFeed from './RecommendationFeed'
import { RECOMMENDATIONS } from '../data/recommendations'

describe('RecommendationFeed — initial render', () => {
  it('renders exactly the first 4 recommendations on mount', () => {
    render(<RecommendationFeed />)
    expect(screen.getByText(RECOMMENDATIONS[0].title)).toBeInTheDocument()
    expect(screen.getByText(RECOMMENDATIONS[1].title)).toBeInTheDocument()
    expect(screen.getByText(RECOMMENDATIONS[2].title)).toBeInTheDocument()
    expect(screen.getByText(RECOMMENDATIONS[3].title)).toBeInTheDocument()
    expect(screen.queryByText(RECOMMENDATIONS[4].title)).not.toBeInTheDocument()
  })

  it('renders the priority selector with all three dimensions', () => {
    render(<RecommendationFeed />)
    expect(screen.getByRole('button', { name: 'Growth' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Productivity' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Customer Experience' })).toBeInTheDocument()
  })

  it('shows a remaining count', () => {
    render(<RecommendationFeed />)
    expect(screen.getByText('12 remaining')).toBeInTheDocument()
  })
})

describe('RecommendationFeed — card cycling', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('slides in card 5 after card 1 is acted on', async () => {
    render(<RecommendationFeed />)
    fireEvent.click(screen.getByRole('button', { name: RECOMMENDATIONS[0].ctaLabel }))
    await act(async () => { vi.advanceTimersByTime(400) })
    expect(screen.getByText(RECOMMENDATIONS[4].title)).toBeInTheDocument()
  })

  it('slides in card 5 after card 1 is dismissed', async () => {
    render(<RecommendationFeed />)
    const dismissButtons = screen.getAllByRole('button', { name: 'Dismiss' })
    fireEvent.click(dismissButtons[0])
    fireEvent.click(screen.getByRole('button', { name: 'Not relevant' }))
    await act(async () => { vi.advanceTimersByTime(400) })
    expect(screen.getByText(RECOMMENDATIONS[4].title)).toBeInTheDocument()
  })

  it('decrements the remaining count when a card is acted on', async () => {
    render(<RecommendationFeed />)
    expect(screen.getByText('12 remaining')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: RECOMMENDATIONS[0].ctaLabel }))
    await act(async () => { vi.advanceTimersByTime(400) })
    expect(screen.getByText('11 remaining')).toBeInTheDocument()
  })
})

describe('RecommendationFeed — priority selector', () => {
  it('active 4 cards are unchanged when priority is switched', async () => {
    render(<RecommendationFeed />)
    const initialTitles = RECOMMENDATIONS.slice(0, 4).map(r => r.title)

    await userEvent.click(screen.getByRole('button', { name: 'Customer Experience' }))

    initialTitles.forEach(title => {
      expect(screen.getByText(title)).toBeInTheDocument()
    })
    expect(screen.queryByText(RECOMMENDATIONS[8].title)).not.toBeInTheDocument()
  })

  it('next card after an act comes from the priority dimension', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    render(<RecommendationFeed />)

    fireEvent.click(screen.getByRole('button', { name: 'Customer Experience' }))
    fireEvent.click(screen.getByRole('button', { name: RECOMMENDATIONS[0].ctaLabel }))
    await act(async () => { vi.advanceTimersByTime(400) })

    expect(screen.getByText(RECOMMENDATIONS[8].title)).toBeInTheDocument()
    vi.useRealTimers()
  })

  it('toggling the active priority pill resets to default order', async () => {
    render(<RecommendationFeed />)
    const prodButton = screen.getByRole('button', { name: 'Productivity' })
    await userEvent.click(prodButton)
    await userEvent.click(prodButton)
    expect(screen.getByText(RECOMMENDATIONS[0].title)).toBeInTheDocument()
  })
})
