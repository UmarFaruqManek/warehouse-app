import { render, screen } from '@testing-library/react'
import { Skeleton, TableSkeleton, PageSkeleton } from '@/components/ui/skeleton'

describe('Skeleton components', () => {
  it('renders Skeleton with custom className', () => {
    const { container } = render(<Skeleton className="h-8 w-48" />)
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain('animate-pulse')
    expect(el.className).toContain('h-8')
    expect(el.className).toContain('w-48')
  })

  it('renders TableSkeleton with correct number of rows', () => {
    const { container } = render(<TableSkeleton rows={3} cols={4} />)
    const rows = container.querySelectorAll('.flex.gap-4')
    expect(rows.length).toBe(3)
  })

  it('renders PageSkeleton', () => {
    const { container } = render(<PageSkeleton />)
    expect(container.firstChild).toBeTruthy()
  })
})
