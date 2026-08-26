type Step = 'destinations' | 'packages' | 'review' | 'success'

const STEPS: Step[] = ['destinations', 'packages', 'review', 'success']

const TITLES: Record<Step, string> = {
  destinations: 'Destinations',
  packages: 'Packages',
  review: 'Review',
  success: 'Success',
}

const ICONS: Record<Step, string> = {
  destinations: 'icon-es-globe',
  packages: 'icon-es-box',
  review: 'icon-es-receipt',
  success: 'icon-es-check-circle',
}

type Props = {
  step: Step
  className?: string
  onStepChange?: (s: Step) => void
}

const Sidebar = ({ step, className = '', onStepChange }: Props) => {
  const stepIndex = STEPS.indexOf(step)

  return (
    <aside
      className={`w-56 flex-shrink-0 flex flex-col border-r bg-white shadow-sm py-6 pb-8 px-3 max-h-screen flex-shrink-0 hidden md:flex ${className}`}
      style={{ borderColor: 'var(--color-hairline)' }}
    >
      <div className="flex flex-col items-start gap-1 mb-8 px-2">
        <div className="flex items-center gap-2 px-2 py-1">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-brand-wash)' }}
          >
            <i className="icon-es-sim-mgmt text-[18px]" style={{ color: 'var(--color-brand)' }} />
          </div>
          <div>
            <h2 className="text-xs font-medium text-slate uppercase tracking-wider">eSIM Flow</h2>
            <p className="text-[10px] text-slate-2">Manage your travel data</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-0.5 px-1">
        {STEPS.map((s, i) => {
          const isActive = step === s
          const isBelow = i > stepIndex
          const isCompleted = i < stepIndex

          return (
            <button
              key={s}
              disabled={isBelow || !onStepChange}
              onClick={() => onStepChange?.(s)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-brand/10 text-brand'
                  : isBelow
                    ? 'text-slate-2 bg-transparent cursor-not-allowed'
                    : 'text-slate hover:bg-mist hover:text-ink'
              } ${isCompleted ? 'text-brand/70' : ''}`}
              style={{ opacity: isBelow ? 0.5 : 1 }}
            >
              <i
                className={`${ICONS[s]} text-[16px] flex-shrink-0 transition-colors`}
                style={{
                  color: isActive
                    ? 'var(--color-brand)'
                    : isCompleted
                      ? 'var(--color-brand)'
                      : 'var(--color-slate)',
                }}
              />
              <span className="truncate">{TITLES[s]}</span>
              {isCompleted && (
                <i className="icon-es-check ml-auto text-[14px]" style={{ color: 'var(--color-brand)' }} />
              )}
            </button>
          )
        })}
      </nav>

      <div className="mt-6 pt-4 px-2 border-t" style={{ borderColor: 'var(--color-hairline)' }}>
        <p className="text-xxs text-slate-2 text-center">
          Step {stepIndex + 1} of {STEPS.length}
        </p>
        <div className="mt-2 flex items-center justify-center gap-1">
          {STEPS.map((s) => (
            <span
              key={s}
              className="w-1.5 h-1.5 rounded-full transition-all duration-200"
              style={{
                backgroundColor: step === s ? 'var(--color-brand)' : 'transparent',
                border: step === s ? 'none' : '1px solid var(--color-hairline)',
                transform: step === s ? 'scale(1.2)' : 'scale(1)',
              }}
            />
          ))}
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
