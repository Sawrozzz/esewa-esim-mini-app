import SimChip from './SimChip'
import {
  longDate,
  isoPlusDays,
  validityLabel,
  type Destination,
  type Package,
} from '../data/esim'

type Props = {
  destination: Destination
  pack: Package
  startDate: string
  /** `issued` adds the serial line and drops the sheen — used after payment. */
  state?: 'draft' | 'issued'
}

/**
 * The thing being bought, drawn as an object. It assembles from the choices the
 * traveller has already made, so the review screen shows the eSIM itself rather
 * than a receipt for one.
 */
const EsimCard = ({ destination, pack, startDate, state = 'draft' }: Props) => {
  const endDate = startDate ? isoPlusDays(startDate, pack.validity) : ''

  return (
    <div
      className={`relative overflow-hidden rounded-[20px] bg-ink px-5 pt-5 pb-4 text-white shadow-[0_12px_28px_-12px_rgba(18,49,76,0.7)] ${
        state === 'draft' ? 'sheen' : ''
      }`}
      style={{ backgroundImage: 'linear-gradient(135deg, #12314c 0%, #1b4468 58%, #12314c 100%)' }}
    >
      {/* Coverage texture, kept faint so the numbers stay the loudest thing. */}
      <div className="dot-field pointer-events-none absolute inset-0 opacity-40" />
      <SimChip
        className="pointer-events-none absolute -right-6 -bottom-8 h-40 w-48 opacity-[0.09]"
        stroke="#ffffff"
        strokeWidth={1}
      />

      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <SimChip className="h-6 w-7 text-[color:var(--color-contact)]" />
            <span className="font-display text-[13px] font-600 tracking-[0.22em] text-white/70">
              eSIM
            </span>
          </div>
          <div className="text-right">
            <div className="text-[13px] leading-tight font-500">
              <span className="mr-1.5">{destination.flag}</span>
              {destination.name}
            </div>
            <div className="text-[11px] text-white/55">{destination.networks.join(' · ')}</div>
          </div>
        </div>

        <div className="mt-6 flex items-end justify-between gap-4">
          <div>
            <div className="text-[10px] font-600 tracking-[0.16em] text-white/50 uppercase">
              Data
            </div>
            <div className="font-display text-[38px] leading-none font-700 tracking-tight tnum">
              {pack.data}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-600 tracking-[0.16em] text-white/50 uppercase">
              Valid for
            </div>
            <div className="font-display text-[22px] leading-tight font-600 tnum">
              {validityLabel(pack.validity)}
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-end justify-between gap-4 border-t border-white/12 pt-3">
          <div>
            <div className="text-[10px] font-600 tracking-[0.16em] text-white/50 uppercase">
              Starts
            </div>
            <div className="text-[13px] font-500 tnum">{longDate(startDate)}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-600 tracking-[0.16em] text-white/50 uppercase">
              Ends
            </div>
            <div className="text-[13px] font-500 tnum">{longDate(endDate)}</div>
          </div>
        </div>

        {state === 'issued' && (
          <div className="mt-3 font-display text-[11px] tracking-[0.18em] text-[color:var(--color-contact)] tnum">
            ICCID 8977 1102 4416 0093 271
          </div>
        )}
      </div>
    </div>
  )
}

export default EsimCard
