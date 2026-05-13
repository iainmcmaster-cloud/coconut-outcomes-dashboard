import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import KpiTile from './KpiTile'

describe('KpiTile', () => {
  it('renders the label and value', () => {
    render(<KpiTile label="Total Engagements" value="1,658" delta="▲ +3.2%" direction="up" sub="vs 1,606 prior period" />)
    expect(screen.getByText('Total Engagements')).toBeInTheDocument()
    expect(screen.getByText('1,658')).toBeInTheDocument()
  })

  it('renders the delta text', () => {
    render(<KpiTile label="Total Engagements" value="1,658" delta="▲ +3.2%" direction="up" sub="vs 1,606 prior period" />)
    expect(screen.getByText('▲ +3.2%')).toBeInTheDocument()
  })

  it('renders the sub-label', () => {
    render(<KpiTile label="Outcomes Recorded" value="86.2%" delta="▲ +2.1pp" direction="up" sub="1,429 of 1,658 engagements" />)
    expect(screen.getByText('1,429 of 1,658 engagements')).toBeInTheDocument()
  })
})
