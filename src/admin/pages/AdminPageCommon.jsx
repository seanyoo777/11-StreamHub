/**
 * @param {{ title: string; description: string; children?: import('react').ReactNode }} props
 */
export function AdminPageFrame({ title, description, children }) {
  return (
    <article className="sh-admin-page">
      <h2>{title}</h2>
      <p className="sh-subtitle">{description}</p>
      {children}
    </article>
  )
}

/**
 * @param {{ label: string; onClick: () => void; disabled?: boolean; testId?: string }} props
 */
export function MockActionButton({ label, onClick, disabled = false, testId }) {
  return (
    <button
      type="button"
      className="sh-admin-mock-btn"
      onClick={onClick}
      disabled={disabled}
      data-testid={testId}
    >
      {label}
    </button>
  )
}
