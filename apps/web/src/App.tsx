import { NavLink, Route, Routes } from 'react-router'
import { EngineeringPage } from './pages/EngineeringPage'
import { OverviewPage } from './pages/OverviewPage'

const nav = [
  { to: '/', label: 'Overview' },
  { to: '/engineering', label: 'Engineering' },
]

export function App() {
  return (
    <div className="min-h-screen md:grid md:grid-cols-[220px_1fr]">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4">
        Skip to content
      </a>
      <aside className="border-b border-line p-4 md:min-h-screen md:border-b-0 md:border-r">
        <p className="font-semibold tracking-tight">
          Pulse<span className="text-accent">Ops</span>
        </p>
        <nav aria-label="Main" className="mt-4 flex gap-2 md:flex-col">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm ${isActive ? 'bg-panel text-ink' : 'text-muted hover:text-ink'}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main id="main" className="mx-auto w-full max-w-5xl p-4 md:p-8">
        <Routes>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/engineering" element={<EngineeringPage />} />
          <Route path="*" element={<p className="text-muted">Page not found.</p>} />
        </Routes>
      </main>
    </div>
  )
}
