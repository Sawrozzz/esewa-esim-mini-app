import { useMemo, useState } from 'react'
import { ESewaChipGroup, ESewaInputField } from 'esewa-ui-library'
import SimChip from '../components/SimChip'
import DestinationRow from '../components/DestinationRow'
import { REGIONS, destinations, rupees, startingPrice, type Destination } from '../data/esim'

type Props = {
  onSelect: (destination: Destination) => void
}

const DestinationsScreen = ({ onSelect }: Props) => {
  const [query, setQuery] = useState('')
  const [regionIndex, setRegionIndex] = useState(0)

  const region = REGIONS[regionIndex]

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return destinations.filter((d) => {
      const matchesRegion = region === 'All' || d.region === region
      const matchesQuery =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.networks.some((n) => n.toLowerCase().includes(q))
      return matchesRegion && matchesQuery
    })
  }, [query, region])

  const trending = destinations.filter((d) => d.trending)

  return (
    <div className="pb-10">
      {/* Hero — the promise, stated once, over the coverage texture. */}
      <section
        className="relative overflow-hidden px-5 pt-7 pb-14 text-white"
        style={{ backgroundImage: 'linear-gradient(160deg, #12314c 0%, #1b4468 100%)' }}
      >
        <div className="dot-field pointer-events-none absolute inset-0 opacity-50" />
        <SimChip
          className="pointer-events-none absolute -top-6 -right-10 h-44 w-52 rotate-12 opacity-[0.10]"
          stroke="#ffffff"
          strokeWidth={1}
        />

        <div className="relative">
          <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.16em] text-white/60 uppercase">
            <SimChip className="h-4 w-5 text-[color:var(--color-contact)]" strokeWidth={1.75} />
            eSIM by eSewa
          </div>
          <h1 className="font-display mt-3 text-[28px] leading-[1.15] font-bold tracking-tight text-balance">
            Land with data
            <br />
            already on.
          </h1>
          <p className="mt-2.5 max-w-[19rem] text-[13px] leading-relaxed text-white/70">
            Buy a data pack for where you are going, pay from your eSewa balance, and skip the
            airport SIM queue.
          </p>
        </div>
      </section>

      {/* Search sits on the seam between the hero and the list. */}
      <div className="esim-field relative z-10 -mt-8 px-4">
        <div className="flex items-center gap-2.5 rounded-2xl border border-hairline bg-card px-3.5 py-1 shadow-[0_8px_20px_-14px_rgba(18,49,76,0.6)]">
          <i className="icon-es-search text-[16px] text-slate-2" aria-hidden="true" />
          <div className="flex-1">
            <ESewaInputField
              name="destination-search"
              placeholder="Search a country or network"
              value={query}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Trending — six destinations eSewa travellers actually buy. */}
      {!query && (
        <section className="mt-7">
          <div className="eyebrow px-4">Going soon</div>
          <div className="mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {trending.map((d, i) => (
              <button
                key={d.id}
                type="button"
                onClick={() => onSelect(d)}
                className="rise pressable w-[156px] shrink-0 snap-start rounded-2xl border border-hairline bg-card p-3.5 text-left"
                style={{ animationDelay: `${i * 45}ms` }}
              >
                <span className="text-[26px] leading-none" aria-hidden="true">
                  {d.flag}
                </span>
                <span className="mt-2.5 block truncate text-[14px] font-semibold text-ink">
                  {d.name}
                </span>
                <span className="mt-0.5 block text-[11px] leading-snug text-slate-2">
                  {d.blurb}
                </span>
                <span className="font-display mt-2.5 block text-[13px] font-semibold text-brand-dark tnum">
                  from {rupees(startingPrice(d))}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Full list, filtered by region. */}
      <section className="mt-6">
        <div className="eyebrow px-4">
          {query ? `${results.length} match${results.length === 1 ? '' : 'es'}` : 'All destinations'}
        </div>

        <div className="mt-1 px-2">
          <ESewaChipGroup
            selection="single"
            required
            defaultValue={regionIndex}
            onChange={(selected) => setRegionIndex(selected as number)}
            chips={REGIONS.map((r, i) => ({ id: i, text: r }))}
          />
        </div>

        <div className="mx-4 mt-3 overflow-hidden rounded-2xl border border-hairline bg-card">
          {results.length > 0 ? (
            results.map((d, i) => (
              <DestinationRow key={d.id} destination={d} index={i} onSelect={onSelect} />
            ))
          ) : (
            <div className="px-5 py-10 text-center">
              <p className="text-[14px] font-medium text-ink">No destination by that name yet.</p>
              <p className="mt-1 text-[12px] text-slate">
                Try the country name, or pick a region above.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default DestinationsScreen
