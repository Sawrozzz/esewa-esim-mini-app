import { rupees, startingPrice, type Destination } from '../data/esim'

type Props = {
  destination: Destination
  onSelect: (destination: Destination) => void
  index?: number
}

const DestinationRow = ({ destination, onSelect, index = 0 }: Props) => (
  <button
    type="button"
    onClick={() => onSelect(destination)}
    className="rise pressable flex w-full items-center gap-3.5 border-b border-hairline bg-card px-4 py-3.5 text-left last:border-b-0 active:bg-mist"
    style={{ animationDelay: `${Math.min(index, 10) * 22}ms` }}
  >
    <span
      className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-mist text-[20px] leading-none"
      aria-hidden="true"
    >
      {destination.flag}
    </span>

    <span className="min-w-0 flex-1">
      <span className="block truncate text-[15px] font-medium text-ink">{destination.name}</span>
      <span className="block truncate text-[12px] text-slate-2">
        {destination.networks.join(' · ')}
      </span>
    </span>

    <span className="shrink-0 text-right">
      <span className="block text-[10px] tracking-[0.1em] text-slate-2 uppercase">from</span>
      <span className="font-display block text-[15px] font-semibold text-ink tnum">
        {rupees(startingPrice(destination))}
      </span>
    </span>

    <i className="icon-es-arrow-right shrink-0 text-[14px] text-slate-2" aria-hidden="true" />
  </button>
)

export default DestinationRow
