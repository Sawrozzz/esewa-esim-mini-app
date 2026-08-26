import { ESewaButton } from 'esewa-ui-library'
import EsimCard from '../components/EsimCard'
import { longDate, type Destination, type Package } from '../data/esim'

type Props = {
  destination: Destination
  pack: Package
  startDate: string
  onInstall: () => void
  onDone: () => void
}

/** Three real steps, in order — the only place numbering earns its keep. */
const STEPS = [
  { title: 'Install the profile', detail: 'Takes about a minute over wifi, here in Nepal.' },
  { title: 'Fly out', detail: 'Keep your Nepali SIM in for calls and OTPs.' },
  { title: 'Turn on the eSIM when you land', detail: 'Settings → Mobile data → eSIM.' },
]

const SuccessScreen = ({ destination, pack, startDate, onInstall, onDone }: Props) => (
  <div className="pb-32">
    <section className="px-4 pt-6">
      <div className="flex items-center gap-2.5">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-brand">
          <i className="icon-es-check text-[12px] text-white" aria-hidden="true" />
        </span>
        <h2 className="font-display text-[20px] font-semibold text-ink">eSIM ready to install</h2>
      </div>
      <p className="mt-2 text-[13px] leading-relaxed text-slate">
        {`Your ${destination.name} pack is issued. It starts counting on ${longDate(startDate)}.`}
      </p>
    </section>

    <section className="mt-5 px-4">
      <EsimCard destination={destination} pack={pack} startDate={startDate} state="issued" />
    </section>

    <section className="mt-7">
      <div className="eyebrow px-4">Next</div>
      <ol className="mx-4 mt-3 overflow-hidden rounded-2xl border border-hairline bg-card">
        {STEPS.map((step, i) => (
          <li key={step.title} className="flex gap-3.5 border-b border-hairline px-4 py-3.5 last:border-b-0">
            <span className="font-display mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-mist text-[12px] font-semibold text-slate tnum">
              {i + 1}
            </span>
            <span>
              <span className="block text-[14px] font-medium text-ink">{step.title}</span>
              <span className="block text-[12px] text-slate-2">{step.detail}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>

    <p className="mt-5 px-5 text-center text-[11px] leading-relaxed text-slate-2">
      The install QR is saved in eSewa → My eSIMs. You can install it on one phone only.
    </p>

    <div className="sticky bottom-0 z-20 border-t border-hairline bg-card/95 px-4 pt-3 pb-4 backdrop-blur md:px-6">
      <div className="flex gap-2.5">
        <div className="flex-1">
          <ESewaButton variant="primary" size="large" fullwidth className="border-radius-8" onClick={onInstall}>
            Install now
          </ESewaButton>
        </div>
        <div className="flex-1">
          <ESewaButton
            variant="primary"
            size="large"
            outlined
            fullwidth
            className="border-radius-8"
            onClick={onDone}
          >
            Later
          </ESewaButton>
        </div>
      </div>
    </div>
  </div>
)

export default SuccessScreen
