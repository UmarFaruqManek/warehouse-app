'use client'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import './globals.css'
import { Toaster } from 'sonner'
import Link from 'next/link'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const isLogin = pathname === '/login'

  useEffect(() => {
    const t = localStorage.getItem('token')
    setToken(t)
    if (!t && !isLogin) router.push('/login')
  }, [])

  if (!token && !isLogin) return <html><body><div className="flex items-center justify-center min-h-screen">Loading...</div></body></html>

  return (
    <html lang="en">
      <body>
        <Toaster richColors />
        {isLogin ? (
          children
        ) : (
          <div className="flex h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col">
              <Navbar />
              <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
                {children}
              </main>
            </div>
          </div>
        )}
      </body>
    </html>
  )
}

function Sidebar() {
  const pathname = usePathname()
  const [role, setRole] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setRole(payload.role)
      } catch {}
    }
  }, [])

  const menus = [
    { href: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard', roles: ['ADMIN', 'STAFF', 'MANAGER'] },
    { href: '/products', label: 'Products', icon: 'Package', roles: ['ADMIN', 'STAFF'] },
    { href: '/suppliers', label: 'Suppliers', icon: 'Truck', roles: ['ADMIN'] },
    { href: '/warehouses', label: 'Warehouses', icon: 'Warehouse', roles: ['ADMIN'] },
    { href: '/stock', label: 'Stock', icon: 'ClipboardList', roles: ['ADMIN', 'STAFF', 'MANAGER'] },
    { href: '/transactions', label: 'Transactions', icon: 'ArrowUpDown', roles: ['ADMIN', 'STAFF', 'MANAGER'] },
    { href: '/purchase-orders', label: 'PO', icon: 'ShoppingCart', roles: ['ADMIN', 'STAFF'] },
    { href: '/sales-orders', label: 'SO', icon: 'FileText', roles: ['ADMIN', 'STAFF'] },
    { href: '/reports', label: 'Reports', icon: 'BarChart3', roles: ['ADMIN', 'MANAGER'] },
    { href: '/audit-logs', label: 'Audit Logs', icon: 'Shield', roles: ['ADMIN'] },
  ]

  const iconMap: Record<string, any> = {
    LayoutDashboard: () => (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>
    ),
    Package: () => (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16.5 9.4 7.55 4.24M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/></svg>
    ),
    Truck: () => (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
    ),
    Warehouse: () => (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z"/><path d="M6 18h12"/><path d="M6 14h12"/><rect x="6" y="10" width="12" height="4"/></svg>
    ),
    ClipboardList: () => (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>
    ),
    ArrowUpDown: () => (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="m21 8-4-4-4 4"/><path d="M17 4v16"/></svg>
    ),
    ShoppingCart: () => (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
    ),
    FileText: () => (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
    ),
    BarChart3: () => (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
    ),
    Shield: () => (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
    ),
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-4">
      <div className="text-xl font-bold mb-8 px-2">WarehouseApp</div>
      <nav className="space-y-1">
        {menus.filter(m => m.roles.includes(role)).map(m => {
          const Icon = iconMap[m.icon] || (() => null)
          return (
            <Link
              key={m.href}
              href={m.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                pathname.startsWith(m.href) ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon />
              {m.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

function Navbar() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setUser(payload)
      } catch {}
    }
  }, [])

  const logout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div />
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">{user?.email}</span>
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{user?.role}</span>
        <button onClick={logout} className="text-sm text-red-600 hover:underline">Logout</button>
      </div>
    </header>
  )
}
