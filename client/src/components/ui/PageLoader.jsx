export default function PageLoader() {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center">
      <div
        className="h-10 w-10 animate-spin rounded-full border-[3px] border-bg-secondary"
        style={{ borderTopColor: 'var(--accent)' }}
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}
