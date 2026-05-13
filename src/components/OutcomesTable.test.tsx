import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import OutcomesTable from './OutcomesTable'
import type { BaseRow } from '../data'

const rows: BaseRow[] = [
  { name: 'Branch A', c: { closedBiz: 10, genOpp: 5, strengthRel: 8, providedInfo: 4, nextSteps: 3, didNotAch: 2, noShow: 1, cancelled: 1, doNotTrack: 1 }, prev: 30 },
  { name: 'Branch B', c: { closedBiz: 20, genOpp: 2, strengthRel: 5, providedInfo: 3, nextSteps: 2, didNotAch: 1, noShow: 2, cancelled: 1, doNotTrack: 1 }, prev: 25 },
]

describe('OutcomesTable', () => {
  it('renders the title', () => {
    render(<OutcomesTable title="Location Detail" rows={rows} firstLabel="Location" />)
    expect(screen.getByText('Location Detail')).toBeInTheDocument()
  })

  it('renders all row names', () => {
    render(<OutcomesTable title="Location Detail" rows={rows} firstLabel="Location" />)
    expect(screen.getByText('Branch A')).toBeInTheDocument()
    expect(screen.getByText('Branch B')).toBeInTheDocument()
  })

  it('renders all 9 outcome column headers in full', () => {
    render(<OutcomesTable title="Location Detail" rows={rows} firstLabel="Location" />)
    expect(screen.getByText('Closed New Business')).toBeInTheDocument()
    expect(screen.getByText('No-Show')).toBeInTheDocument()
    expect(screen.getByText('Outcome not tracked')).toBeInTheDocument()
  })

  it('shows empty state when rows is empty', () => {
    render(<OutcomesTable title="Location Detail" rows={[]} firstLabel="Location" />)
    expect(screen.getByText(/no data matches/i)).toBeInTheDocument()
  })

  it('sorts rows by name column when header is clicked', async () => {
    const user = userEvent.setup()
    render(<OutcomesTable title="Location Detail" rows={rows} firstLabel="Location" />)
    const nameHeader = screen.getByRole('columnheader', { name: /location/i })
    await user.click(nameHeader)
    const cells = screen.getAllByRole('cell')
    expect(cells[0].textContent).toBe('Branch A')
  })
})
