import { render, screen, fireEvent } from '@testing-library/react'
import Pagination from '@/components/ui/pagination'

describe('Pagination', () => {
  it('renders nothing when totalPages <= 1', () => {
    const { container } = render(<Pagination page={1} totalPages={1} onPageChange={() => {}} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders page buttons', () => {
    render(<Pagination page={1} totalPages={3} onPageChange={() => {}} />)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('calls onPageChange when clicking a page', () => {
    const fn = jest.fn()
    render(<Pagination page={1} totalPages={3} onPageChange={fn} />)
    fireEvent.click(screen.getByText('2'))
    expect(fn).toHaveBeenCalledWith(2)
  })

  it('disables Prev on first page', () => {
    render(<Pagination page={1} totalPages={3} onPageChange={() => {}} />)
    expect(screen.getByText('Prev')).toBeDisabled()
  })

  it('disables Next on last page', () => {
    render(<Pagination page={3} totalPages={3} onPageChange={() => {}} />)
    expect(screen.getByText('Next')).toBeDisabled()
  })
})
