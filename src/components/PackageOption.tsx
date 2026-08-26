import { ESewaTag } from 'esewa-ui-library'
import SimChip from './SimChip'
import { rupees, type Package } from '../data/esim'

type Props = {
  pack: Package
  selected: boolean
  onSelect: (pack: Package) => void
  index?: number
}

const PackageOption = ({ pack, selected, onSelect, index = 0 }: Props) => (
  <button
    type="button"
    onClick={() => onSelect(pack)}
    aria-pressed={selected}
    className={`rise pressable relative w-full overflow-hidden rounded-2xl border bg-card px-4 py-3.5 text-left ${
      selected
        ? 'border-brand shadow-[0_0_0_1px_var(--color-brand),0_8px_20px_-14px_rgba(41,187,0,0.8)]'
        : 'border-hairline'
    }`}
    style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
  >
    <span className="flex items-start gap-3.5">
      <span
        className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
          selected ? 'bg-brand-wash' : 'bg-mist'
        }`}
      >
        <SimChip
          className={`h-4 w-5 ${selected ? 'text-brand-dark' : 'text-slate-2'}`}
          strokeWidth={1.75}
        />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="font-display text-[20px] leading-none font-semibold text-ink tnum">
            {pack.data}
          </span>
          {pack.tag && <ESewaTag text={pack.tag} size="small" variant="success" />}
        </span>

        <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] text-slate">
          <span className="inline-flex items-center gap-1">
            <i className="icon-es-internet text-[13px] text-signal" aria-hidden="true" />
            {pack.speed}
          </span>
          <span className="text-hairline" aria-hidden="true">
            |
          </span>
          <span>{pack.hotspot ? 'Hotspot on' : 'No hotspot'}</span>
        </span>

        {pack.note && <span className="mt-1 block text-[11px] text-slate-2">{pack.note}</span>}
      </span>

      <span className="shrink-0 pt-0.5 text-right">
        <span className="font-display block text-[16px] font-semibold text-ink tnum">
          {rupees(pack.price)}
        </span>
        <span
          className={`mt-1.5 ml-auto grid h-[18px] w-[18px] place-items-center rounded-full border ${
            selected ? 'border-brand bg-brand' : 'border-slate-2/60'
          }`}
        >
          {selected && <i className="icon-es-check text-[9px] text-white" aria-hidden="true" />}
        </span>
      </span>
    </span>
  </button>
)

export default PackageOption
