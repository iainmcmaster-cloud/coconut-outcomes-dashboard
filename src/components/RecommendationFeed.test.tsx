import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
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
