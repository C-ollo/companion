import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react"

type ActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "quiet"
  leading?: ReactNode
  trailing?: ReactNode
}

export function ActionButton({
  variant = "primary",
  leading,
  trailing,
  className = "",
  children,
  type = "button",
  ...props
}: ActionButtonProps) {
  return (
    <button
      type={type}
      className={`ds-action ds-action--${variant} ${className}`.trim()}
      {...props}
    >
      {leading && <span className="ds-action__icon">{leading}</span>}
      <span>{children}</span>
      {trailing && <span className="ds-action__trailing">{trailing}</span>}
    </button>
  )
}

export function PageIntro({
  title,
  description,
  className = "",
}: {
  title: string
  description: string
  className?: string
}) {
  return (
    <header className={`ds-page-intro ${className}`.trim()}>
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
  )
}

export function SectionIntro({
  id,
  title,
  description,
}: {
  id?: string
  title: string
  description?: string
}) {
  return (
    <header className="ds-section-intro">
      <h2 id={id}>{title}</h2>
      {description && <p>{description}</p>}
    </header>
  )
}

export function StatusMessage({
  title,
  children,
  meta,
  tone = "calm",
  role,
  className = "",
}: {
  title: string
  children: ReactNode
  meta?: string
  tone?: "calm" | "success" | "neutral"
  role?: "status" | "alert"
  className?: string
}) {
  return (
    <aside
      className={`ds-status ds-status--${tone} ${className}`.trim()}
      role={role}
    >
      <span className="ds-status__mark" aria-hidden="true" />
      <span className="ds-status__copy">
        <strong>{title}</strong>
        <span>{children}</span>
      </span>
      {meta && <small>{meta}</small>}
    </aside>
  )
}

export function WayfindingChoice({
  title,
  description,
  meta,
  action,
  onAction,
  icon,
  emphasis = "primary",
}: {
  title: string
  description: string
  meta?: string
  action: string
  onAction: () => void
  icon: ReactNode
  emphasis?: "primary" | "secondary"
}) {
  return (
    <article
      className={`ds-wayfinding-choice ds-wayfinding-choice--${emphasis}`}
    >
      <span className="ds-wayfinding-choice__node" aria-hidden="true">
        {icon}
      </span>
      <div className="ds-wayfinding-choice__copy">
        {meta && <p>{meta}</p>}
        <h3>{title}</h3>
        <span>{description}</span>
      </div>
      <ActionButton
        variant={emphasis === "primary" ? "primary" : "secondary"}
        onClick={onAction}
      >
        {action}
      </ActionButton>
    </article>
  )
}

export function FlowHeader({
  title,
  onBack,
  onClose,
  profileIcon,
}: {
  title: string
  onBack: () => void
  onClose: () => void
  profileIcon?: ReactNode
}) {
  return (
    <header className="ds-flow-header">
      <ActionButton
        variant="quiet"
        className="ds-flow-header__round"
        onClick={onBack}
        aria-label="Go back"
      >
        <span aria-hidden="true">←</span>
      </ActionButton>
      <strong>{title}</strong>
      <span className="ds-flow-header__actions">
        <ActionButton
          variant="quiet"
          className="ds-flow-header__round"
          onClick={onClose}
          aria-label="Close this flow"
        >
          <span aria-hidden="true">×</span>
        </ActionButton>
        {profileIcon && (
          <ActionButton
            variant="quiet"
            className="ds-flow-header__profile"
            aria-label="Open profile"
          >
            {profileIcon}
          </ActionButton>
        )}
      </span>
    </header>
  )
}

export function ProgressPath({
  steps,
  current,
}: {
  steps: string[]
  current: number
}) {
  return (
    <nav
      className="ds-progress"
      aria-label={`Step ${current + 1} of ${steps.length}: ${steps[current]}`}
    >
      <ol>
        {steps.map((step, index) => {
          const state =
            index < current
              ? "complete"
              : index === current
                ? "current"
                : "next"
          return (
            <li className={`ds-progress__step is-${state}`} key={step}>
              <span aria-hidden="true">
                {index < current ? "✓" : index + 1}
              </span>
              <b>{step}</b>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export function ChecklistItem({
  checked,
  children,
  onToggle,
}: {
  checked: boolean
  children: ReactNode
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      className="ds-checklist-item"
      aria-pressed={checked}
      onClick={onToggle}
    >
      <span aria-hidden="true">{checked ? "✓" : ""}</span>
      <b>{children}</b>
    </button>
  )
}

export function ActionDock({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLElement>) {
  return (
    <nav
      className={`ds-action-dock ${className}`.trim()}
      aria-label="Step controls"
      {...props}
    >
      {children}
    </nav>
  )
}
