import { useEffect, useMemo, useState } from 'react'
import { ESewaButton, ESewaChipGroup, ESewaDatePicker } from 'esewa-ui-library'
import PackageOption from '../components/PackageOption'
import SimChip from '../components/SimChip'
import {
  VALIDITY_OPTIONS,
  isoPlusDays,
  isoToday,
  longDate,
  packagesFor,
  rupees,
  type Destination,
  type Package,
  type Validity,
} from '../data/esim'

type Props = {
  destination: Destination
  validity: Validity
  startDate: string
  selectedPack: Package | null
  onValidityChange: (validity: Validity) => void
  onStartDateChange: (iso: string) => void
  onPackChange: (pack: Package) => void
  onContinue: () => void
}

const PackageScreen = ({
  destination,
  validity,
  startDate,
  selectedPack,
  onValidityChange,
  onStartDateChange,
  onPackChange,
  onContinue,
}: Props) => {
  const packs = useMemo(() => packagesFor(destination, validity), [destination, validity])
  const [dateError, setDateError] = useState('')

  // Changing the validity replaces the whole shelf, so re-anchor the selection.
  useEffect(() => {
    if (!selectedPack || selectedPack.validity !== validity) {
      onPackChange(packs.find((p) => p.tag) ?? packs[0])
    }
  }, [packs, validity])

  const validityIndex = VALIDITY_OPTIONS.findIndex((o) => o.value === validity)
  const today = isoToday()
  const latest = isoPlusDays(today, 180)

  const handleDate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    onStartDateChange(value)
    setDateError(value && value < today ? 'Pick today or a later date.' : '')
  }

  return (
    <div className="pb-32">
      {/* Destination header — flag, coverage, and nothing else. */}
      <section className="border-b border-hairline bg-card px-4 py-4">
        <div className="flex items-center gap-3.5">
          <span
            className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-mist text-[24px] leading-none"
            aria-hidden="true"
          >
            {destination.flag}
          </span>
          <div className="min-w-0">
            <h2 className="font-display truncate text-[19px] font-semibold text-ink">
              {destination.name}
            </h2>
            <p className="truncate text-[12px] text-slate">
              Roams on {destination.networks.join(', ')}
            </p>
          </div>
        </div>
      </section>

      {/* Decision 1 — how long the traveller is away. */}
      <section className="mt-5">
        <div className="px-4">
          <div className="eyebrow">How long are you away?</div>
          <p className="mt-2 text-[13px] text-slate">
            The window starts on your chosen date and runs without a break.
          </p>
        </div>
        <div className="mt-2 px-2">
          <ESewaChipGroup
            selection="single"
            required
            defaultValue={validityIndex}
            onChange={(selected) =>
              onValidityChange(VALIDITY_OPTIONS[selected as number].value)
            }
            chips={VALIDITY_OPTIONS.map((o, i) => ({ id: i, text: o.label }))}
          />
        </div>
      </section>

      {/* Decision 2 — the pack itself. */}
      <section className="mt-6">
        <div className="eyebrow px-4">Data packs</div>
        <div className="mt-3 flex flex-col gap-2.5 px-4">
          {packs.map((pack, i) => (
            <PackageOption
              key={pack.id}
              pack={pack}
              index={i}
              selected={selectedPack?.id === pack.id}
              onSelect={onPackChange}
            />
          ))}
        </div>
      </section>

      {/* Decision 3 — the start date. */}
      <section className="mt-7">
        <div className="eyebrow px-4">Starts on</div>
        <div className="esim-field mx-4 mt-3 rounded-2xl border border-hairline bg-card p-4">
          <ESewaDatePicker
            name="start-date"
            value={startDate}
            min={today}
            max={latest}
            onChange={handleDate}
            validationMessage={dateError}
          />

          <div className="mt-3 flex items-start gap-2.5 rounded-xl bg-signal-wash px-3 py-2.5">
            <i
              className="icon-es-calender mt-0.5 text-[15px] text-signal"
              aria-hidden="true"
            />
            <p className="text-[12px] leading-relaxed text-ink/80">
              {selectedPack && startDate ? (
                <>
                  Data runs from{' '}
                  <span className="font-semibold tnum">{longDate(startDate)}</span> to{' '}
                  <span className="font-semibold tnum">
                    {longDate(isoPlusDays(startDate, selectedPack.validity))}
                  </span>
                  . Nothing is used before that.
                </>
              ) : (
                'Pick the day you land. Nothing is used before then.'
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Running total, pinned. The price only ever moves with a choice above. */}
      <div className="sticky bottom-0 z-20 border-t border-hairline bg-card/95 px-4 pt-3 pb-4 backdrop-blur md:px-6">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-2">
              <SimChip className="h-3.5 w-4.5 shrink-0" strokeWidth={2} />
              <span className="truncate">
                {selectedPack
                  ? `${selectedPack.data} · ${VALIDITY_OPTIONS[validityIndex].short} · ${destination.name}`
                  : 'Choose a pack'}
              </span>
            </div>
            <div className="font-display text-[22px] leading-tight font-bold text-ink tnum">
              {selectedPack ? rupees(selectedPack.price) : '—'}
            </div>
          </div>
          <div className="shrink-0">
            <ESewaButton
              variant="primary"
              size="large"
              className="border-radius-8"
              onClick={onContinue}
              disabled={!selectedPack || !startDate || Boolean(dateError)}
            >
              Review order
            </ESewaButton>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PackageScreen
