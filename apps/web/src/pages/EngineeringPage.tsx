const REPO = 'https://github.com/acamilateixeira/PulseOps'

const links = [
  { label: 'Architecture decisions (ADRs)', href: `${REPO}/tree/main/docs/adr` },
  { label: 'Engineering evidence matrix', href: `${REPO}/blob/main/ENGINEERING_EVIDENCE_MATRIX.md` },
  { label: 'AI-assisted engineering log', href: `${REPO}/blob/main/docs/ai-assisted-engineering.md` },
  { label: 'CI workflow', href: `${REPO}/actions` },
]

export function EngineeringPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Engineering evidence</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          How PulseOps is built and what is verified so far. Every item links to code, tests or CI runs.
        </p>
      </header>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <a
              className="text-accent underline-offset-4 hover:underline"
              href={link.href}
              target="_blank"
              rel="noreferrer"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
