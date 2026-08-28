import { useRef } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { ESewaButton } from 'esewa-ui-library'
import EsimCard from '../components/EsimCard'
import {
  cashbackOn,
  isoPlusDays,
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
  onInstall: () => void
  onDone: () => void
  hostUser?: { name?: string; esewa_id?: string; mobile?: string; email?: string; balance?: number } | null
  hostLocation?: { address?: string; latitude?: number; longitude?: number } | null
  balance?: number | null
}

/** Three real steps, in order — the only place numbering earns its keep. */
const STEPS = [
  { title: 'Install the profile', detail: 'Scan the QR or download the voucher below.' },
  { title: 'Fly out', detail: 'Keep your Nepali SIM in for calls and OTPs.' },
  { title: 'Turn on the eSIM when you land', detail: 'Settings → Mobile data → eSIM.' },
]

/* Static placeholder activation payload (GSMA LPA format) until the RSP
   server is wired up — scanning it now will not install anything real. */
const ACTIVATION_CODE = 'LPA:1$esewa-rsp.example.com$A4F7-KQ92-MT31'
const orderId = (pack: Package) => `ESW-${pack.id.replace(/[^a-z0-9]/gi, '').slice(0, 12).toUpperCase()}`

const SuccessScreen = ({ destination, pack, startDate, onInstall, onDone, hostUser, hostLocation, balance }: Props) => {
  const qrRef = useRef<HTMLCanvasElement>(null)
  const cashback = cashbackOn(pack.price)

  const downloadVoucher = async () => {
    const qrData = qrRef.current?.toDataURL('image/png')
    if (!qrData) return

    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    const pageWidth = doc.internal.pageSize.getWidth()
    const left = 56
    const right = pageWidth - 56

    doc.setFillColor(41, 187, 0)
    doc.rect(0, 0, pageWidth, 8, 'F')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(20)
    doc.text('eSIM activation voucher', left, 64)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.setTextColor(110)
    doc.text(`${destination.name} · issued by eSewa`, left, 84)
    doc.setTextColor(0)

    const qrSize = 190
    doc.addImage(qrData, 'PNG', (pageWidth - qrSize) / 2, 108, qrSize, qrSize)

    doc.setFontSize(10)
    doc.setTextColor(110)
    doc.text('Scan this QR with your phone camera to install the eSIM.', pageWidth / 2, 322, {
      align: 'center',
    })
    doc.setTextColor(0)

    const userLine = hostUser ? `${hostUser.name ?? ''} (${hostUser.esewa_id ?? ''})`.trim() : '—'
    const balanceLine = typeof balance === 'number' ? rupees(balance) : typeof hostUser?.balance === 'number' ? rupees(hostUser.balance) : '—'
    const locationLine = hostLocation?.address ? `${hostLocation.address} (${hostLocation.latitude}, ${hostLocation.longitude})` : '—'
    const rows: [string, string][] = [
      ['Order ID', orderId(pack)],
      ['Activation code', ACTIVATION_CODE],
      ['User', userLine],
      ['eSewa ID', hostUser?.esewa_id ?? '—'],
      ['Mobile', hostUser?.mobile ?? '—'],
      ['Email', hostUser?.email ?? '—'],
      ['Wallet balance (from host)', balanceLine],
      ['User location (from host)', locationLine],
      ['Destination', destination.name],
      ['Data allowance', pack.data],
      ['Validity', `${validityLabel(pack.validity)} (${pack.validity} days)`],
      ['Starts on', longDate(startDate)],
      ['Ends on', longDate(isoPlusDays(startDate, pack.validity))],
      ['Networks', destination.networks.join(', ')],
      ['Speed', pack.speed],
      ['Hotspot', pack.hotspot ? 'Included' : 'Not included'],
      ['Total paid', rupees(pack.price - cashback)],
    ]

    let y = 366
    doc.setFontSize(12)
    rows.forEach(([label, value], i) => {
      if (i % 2 === 0) {
        doc.setFillColor(244, 246, 248)
        doc.rect(left - 8, y - 13, right - left + 16, 24, 'F')
      }
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10.5)
      doc.setTextColor(110)
      doc.text(label, left, y)
      doc.setTextColor(30)
      doc.setFont('helvetica', 'bold')
      doc.text(value, right, y, { align: 'right', maxWidth: 300 })
      y += 24
    })

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(140)
    doc.text(
      'Packs are non-refundable once installed. Keep this voucher private — anyone who scans it can install your eSIM.',
      pageWidth / 2,
      800,
      { align: 'center', maxWidth: pageWidth - 112 },
    )

    doc.save(`esim-voucher-${orderId(pack)}.pdf`)
  }

  return (
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

      {(hostUser || hostLocation) && (
        <section className="mt-6 px-4">
          <div className="eyebrow">Billed to (from host)</div>
          <div className="mx-4 mt-3 rounded-2xl border border-hairline bg-card px-4 py-3">
            {hostUser?.name && <div className="text-[13px] font-medium text-ink">{hostUser.name} <span className="text-slate">· {hostUser.esewa_id}</span></div>}
            {hostUser?.mobile && <div className="text-[12px] text-slate">{hostUser.mobile} · {hostUser.email ?? ''}</div>}
            {typeof balance === 'number' && <div className="mt-2 text-[12px] text-slate">Wallet balance from host: <span className="font-medium text-ink">{rupees(balance)}</span></div>}
            {hostLocation?.address && <div className="text-[11px] text-slate-2">Location from host: {hostLocation.address} ({hostLocation.latitude}, {hostLocation.longitude})</div>}
          </div>
        </section>
      )}

      <section className="mt-7">
        <div className="eyebrow px-4">Scan to activate</div>
        <div className="mx-4 mt-3 rounded-2xl border border-hairline bg-card p-5">
          <div className="mx-auto w-fit rounded-xl border border-hairline bg-white p-3">
            <QRCodeCanvas
              ref={qrRef}
              value={ACTIVATION_CODE}
              size={168}
              marginSize={2}
              level="M"
            />
          </div>

          <p className="mt-3 text-center text-[12px] leading-relaxed text-slate">
            Scan with your phone camera to install the profile.
          </p>

          <div className="mt-3 rounded-xl bg-mist px-3 py-2.5">
            <p className="text-[10px] font-semibold tracking-[0.12em] text-slate-2 uppercase">
              Activation code
            </p>
            <p className="mt-1 truncate text-[12px] font-medium text-ink">{ACTIVATION_CODE}</p>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-brand-wash px-3 py-2.5">
            <span className="min-w-0">
              <span className="block text-[10px] font-semibold tracking-[0.12em] text-brand-dark uppercase">
                Order ID
              </span>
              <span className="tnum block truncate text-[12px] font-medium text-ink">
                {orderId(pack)}
              </span>
            </span>
            <i className="icon-es-receipt shrink-0 text-[16px] text-brand-dark" aria-hidden="true" />
          </div>

          <div className="mt-4">
            <ESewaButton
              variant="primary"
              outlined
              size="large"
              fullwidth
              className="border-radius-8"
              onClick={downloadVoucher}
            >
              {`Download voucher (PDF)`}
            </ESewaButton>
          </div>
        </div>
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
}

export default SuccessScreen
