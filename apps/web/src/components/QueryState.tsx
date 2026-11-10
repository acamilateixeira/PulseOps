import { ApiRequestError } from '../api/client'

export function LoadingRows({ label, rows = 4 }: { label: string; rows?: number }) {
  return (
    <div role="status" aria-label={label} className="space-y-3">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="h-14 animate-pulse rounded-lg bg-panel" />
      ))}
    </div>
  )
}

export function ErrorPanel({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  const message = error instanceof Error ? error.message : 'Something went wrong.'
  const requestId = error instanceof ApiRequestError ? error.requestId : null
  return (
    <div role="alert" className="rounded-lg border border-danger/40 bg-danger/10 p-4">
      <p className="font-medium text-danger">{message}</p>
      {requestId && (
        <p className="mt-1 font-mono text-xs text-muted">
          Request ID: <span>{requestId}</span>
        </p>
      )}
      <button
        type="button"
        onClick={onRetry}
        className="mt-3 rounded-md border border-line px-3 py-1.5 text-sm hover:border-accent hover:text-accent"
      >
        Try again
      </button>
    </div>
  )
}
