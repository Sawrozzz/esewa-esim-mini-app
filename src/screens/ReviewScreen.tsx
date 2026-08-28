import { useState } from 'react'
import { ESewaAlertCard, ESewaButton, ESewaDialog, ESewaDivider } from 'esewa-ui-library'
import EsimCard from '../components/EsimCard'
import {
  cashbackOn,
  longDate,
  rupees,
  validityLabel,
  type Destination,
  type Package,
} from '../data/esim'

type Props = {
  destination: Destination
  pack: Package
  startDate: string
  onEdit: () => void
  onPay: () => void
  balance?: number | null
  hostUser?: { name?: string; esewa_id?: string; mobile?: string } | null
  hostLocation?: { address?: string; latitude?: number; longitude?: number } | null
}

const Line = ({
  label,
  value,
  tone = 'default',
}: {
  label: string
  value: string
  tone?: 'default' | 'credit'
}) => (
  <div className="flex items-baseline justify-between gap-4 py-2">
    <span className="text-[13px] text-slate">{label}</span>
    <span
      className={`text-[14px] font-medium tnum ${
        tone === 'credit' ? 'text-brand-dark' : 'text-ink'
      }`}
    >
      {value}
    </span>
  </div>
)

const ReviewScreen = ({ destination, pack, startDate, onEdit, onPay, balance, hostUser, hostLocation }: Props) => {
  const [confirming, setConfirming] = useState(false)
  const cashback = cashbackOn(pack.price)

  return (
    <div className="pb-32">
      <section className="px-4 pt-5">
        <EsimCard destination={destination} pack={pack} startDate={startDate} />
      </section>

      <section className="mt-7">
        <div className="eyebrow px-4">What you are buying</div>
        <div className="mx-4 mt-3 rounded-2xl border border-hairline bg-card px-4 py-2">
          <Line label="Destination" value={`${destination.flag}  ${destination.name}`} />
          <Line label="Data" value={pack.data} />
          <Line label="Validity" value={validityLabel(pack.validity)} />
          <Line label="Starts on" value={longDate(startDate)} />
          <Line label="Network" value={pack.speed} />
          <Line label="Hotspot" value={pack.hotspot ? 'Included' : 'Not included'} />
          <div className="pb-2">
            <button
              type="button"
              onClick={onEdit}
              className="text-[13px] font-semibold text-brand-dark underline underline-offset-2"
            >
              Change pack or date
            </button>
          </div>
        </div>
      </section>

      <section className="mt-6">
        <div className="eyebrow px-4">Payment</div>
        <div className="mx-4 mt-3 rounded-2xl border border-hairline bg-card px-4 py-2">
          <Line label="Pack price" value={rupees(pack.price)} />
          <Line label="eSewa cashback" value={`− ${rupees(cashback)}`} tone="credit" />
          <ESewaDivider color="var(--color-hairline)" margin="4px 0" />
          <div className="flex items-baseline justify-between gap-4 py-2.5">
            <span className="text-[14px] font-semibold text-ink">Total</span>
            <span className="font-display text-[22px] font-bold text-ink tnum">
              {rupees(pack.price - cashback)}
            </span>
          </div>
          <div className="flex items-center gap-2 pb-3 text-[12px] text-slate">
            <i className="icon-es-wallet text-[15px] text-brand-dark" aria-hidden="true" />
            Paid from eSewa balance · {rupees(balance ?? 12480)} available
            {hostUser?.name ? ` · ${hostUser.name}` : ''}
          </div>
          {hostLocation?.address && (
            <div className="pb-3 text-[11px] text-slate-2">Location from host: {hostLocation.address} ({hostLocation.latitude}, {hostLocation.longitude})</div>
          )}
        </div>
      </section>

      <section className="mx-4 mt-6">
        <ESewaAlertCard
          variant="info"
          title="Check your phone first"
          showDescriptionIcon
          descriptionIcon="icon-es-phone"
          description="Your phone must support eSIM and be carrier-unlocked. Dial *#06# — if an EID appears, you are set."
        />
      </section>

      <p className="mt-5 px-5 text-center text-[11px] leading-relaxed text-slate-2">
        Packs are non-refundable once installed. Coverage follows the local networks listed above.
      </p>

      <div className="sticky bottom-0 z-20 border-t border-hairline bg-card/95 px-4 pt-3 pb-4 backdrop-blur md:px-6">
        <ESewaButton
          variant="primary"
          size="large"
          fullwidth
          className="border-radius-8"
          onClick={() => setConfirming(true)}
        >
          {`Pay ${rupees(pack.price - cashback)}`}
        </ESewaButton>
      </div>

      {confirming && (
        <ESewaDialog
          isOpen={true}
          position="bottom"
          title="Confirm payment"
          okText={`Pay ${rupees(pack.price - cashback)}`}
          cancelText="Go back"
          onOk={() => {
            setConfirming(false)
            onPay()
          }}
          onCancel={() => setConfirming(false)}
        >
          <p className="text-[13px] leading-relaxed text-slate">
            {`${pack.data} for ${destination.name}, valid ${validityLabel(pack.validity)} from ${longDate(startDate)}.`}
          </p>
        </ESewaDialog>
      )}
    </div>
  )
}

export default ReviewScreen
