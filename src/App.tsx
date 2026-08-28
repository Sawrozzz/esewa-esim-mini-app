import { useState, useEffect } from 'react'
import { ESewaProvider, REQUEST_TYPE_ENUM, CALLBACK_TYPE_ENUM, requestFromMiniApp } from 'esewa-ui-library'
import 'esewa-ui-library/dist/index.css'
import AppBar from './components/AppBar'
import DestinationsScreen from './screens/DestinationsScreen'
import PackageScreen from './screens/PackageScreen'
import ReviewScreen from './screens/ReviewScreen'
import SuccessScreen from './screens/SuccessScreen'
import Sidebar from './components/Sidebar'
import { isoPlusDays, isoToday, type Destination, type Package, type Validity, cashbackOn } from './data/esim'
import { useEsewaHost } from './config/InitEsewa'

type Step = 'destinations' | 'packages' | 'review' | 'success'

const TITLES: Record<Step, string> = {
  destinations: 'eSIM',
  packages: 'Choose a pack',
  review: 'Review order',
  success: 'eSIM issued',
}

export type MiniAppProps = {
  merchantIdentifier?: string
  vendorIdentifier?: string
  embedded?: boolean
}

function MiniApp({ merchantIdentifier, vendorIdentifier, embedded }: MiniAppProps) {
  const [step, setStep] = useState<Step>('destinations')
  const [destination, setDestination] = useState<Destination | null>(null)
  const [validity, setValidity] = useState<Validity>(30)
  const [pack, setPack] = useState<Package | null>(null)
  // Defaults to a week out — most people buy before a trip, not on the day.
  const [startDate, setStartDate] = useState(isoPlusDays(isoToday(), 7))

  const [isWeb, setIsWeb] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [payError, setPayError] = useState<string | null>(null)

  // Same bridge as esewa-host-mock expects: INIT_APP -> token, USER_DETAIL, LOCATION, balance
  const host = useEsewaHost({ merchantIdentifier, vendorIdentifier })

  // Detect embedded in host PhoneShell — host sets window.__ESEWA_HOST__ before remote loads
  const isEmbedded =
    embedded ||
    (typeof window !== 'undefined' &&
      !!((window as unknown as Record<string, unknown>).__ESEWA_HOST__ ||
        (window as unknown as Record<string, unknown>).__ESEWA_HOST_BRIDGE_INSTALLED__))

  useEffect(() => {
    // Inside PhoneShell the viewport is still wide, but the phone frame is 390px — force phone layout
    if (isEmbedded) {
      setIsWeb(false)
      return
    }
    const checkWidth = () => setIsWeb(window.innerWidth >= 768)
    checkWidth()
    window.addEventListener('resize', checkWidth)
    return () => window.removeEventListener('resize', checkWidth)
  }, [isEmbedded])

  const goBack = () => {
    if (isProcessing) return
    setPayError(null)
    if (step === 'packages') setStep('destinations')
    else if (step === 'review') setStep('packages')
    else if (step === 'success') setStep('destinations')
    else {
      // Hand back to host — if in MF host, host's bridge will handle CLOSE_APP
      try {
        requestFromMiniApp(
          {
            requestType: REQUEST_TYPE_ENUM.CLOSE_APP,
            callbackKey: CALLBACK_TYPE_ENUM.CLOSE_APP_CALLBACK,
          } as never,
          (() => {}) as never,
        )
      } catch {}
      console.log('Exit mini app — hand back to eSewa')
    }
  }

  const handlePay = () => {
    if (!destination || !pack) return
    // Balance check — from host (USER_DETAIL_ACCESS → balance)
    if (typeof host.balance === 'number' && pack.price > host.balance) {
      const msg = `Insufficient balance. Available: Rs ${host.balance.toLocaleString('en-IN')}, required: Rs ${pack.price.toLocaleString('en-IN')}. Please top up your eSewa wallet.`
      setPayError(msg)
      console.error('[eSIM Mini App] ' + msg, { balance: host.balance, required: pack.price, user: host.user })
      return
    }
    setPayError(null)
    setIsProcessing(true)

    const token = host.token || (() => { try { return sessionStorage.getItem('miniAppAuthToken') || sessionStorage.getItem('token') } catch { return null } })()
    const mid = merchantIdentifier || 'IAAAAABTOBAbFhAXHhEHAgoXX0FRR1FJJiw3LCwkJzE='

    const doConsoleAndSuccess = (paymentRes: unknown) => {
      const cashback = cashbackOn(pack.price)
      const overall = {
        // Data that came from host via bridge (same as host's DEFAULT_RESPONSES / DevPanel)
        host: {
          token,
          scope: host.scope,
          balanceAmount: host.balance, // from host — wallet available (shown in ReviewScreen)
          userDetails: host.user,
          location: host.location,
          merchant: host.merchant,
          product: host.product,
        },
        // Data that lives in mini-app
        miniApp: {
          destination,
          package: pack,
          validity,
          startDate,
          cashback,
          totalPaid: pack.price - cashback,
          // for receipt
          destinationName: destination.name,
          destinationFlag: destination.flag,
          networks: destination.networks,
        },
        // Host payment response (if any)
        payment: paymentRes,
        meta: {
          merchantIdentifier: mid,
          vendorIdentifier: vendorIdentifier || null,
          hasBridge: host.hasBridge,
        },
      }
      console.log('[eSIM Mini App] Overall submission data (host + mini-app):', overall)
      // also make it visible for DevPanel copy
      try { (window as unknown as Record<string, unknown>).__ESIM_LAST_SUBMISSION__ = overall } catch {}
    }

    // Try real host payment via bridge — mirrors esewa-host-mock/src/miniapp/SampleMiniApp.tsx:129 REQUEST_PAYMENT
    let bridged = false
    try {
      const hasBridge =
        typeof window !== 'undefined' &&
        ((window as unknown as Record<string, unknown>).Android !== undefined ||
          (window as unknown as Record<string, unknown>).requestFromMiniApp !== undefined ||
          hasBridgeFn())
      function hasBridgeFn() {
        try {
          return typeof requestFromMiniApp === 'function'
        } catch {
          return false
        }
      }
      if (hasBridge) {
        bridged = true
        requestFromMiniApp(
          {
            requestType: REQUEST_TYPE_ENUM.REQUEST_PAYMENT,
            callbackKey: CALLBACK_TYPE_ENUM.REQUEST_PAYMENT_CALLBACK,
            merchant_identifier: mid,
            vendorIdentifier: vendorIdentifier || undefined,
            token: token || undefined,
            data: {
              product_code: pack.id,
              amount: pack.price,
              properties: {
                productId: pack.id,
                destinationId: destination.id,
                destinationName: destination.name,
                validity: pack.validity,
                data: pack.data,
                startDate,
                speed: pack.speed,
                hotspot: pack.hotspot,
              },
              channel: 'WEB_USER',
            },
          } as never,
          ((raw: unknown) => {
            let parsed: unknown = raw
            try { parsed = typeof raw === 'string' ? JSON.parse(raw as string) : raw } catch {}
            // Host may return {error_message} for insufficient balance
            const maybeErr = parsed as Record<string, unknown> | null
            if (maybeErr && typeof maybeErr.error_message === 'string') {
              const msg = String(maybeErr.error_message)
              setPayError(msg)
              console.error('[eSIM Mini App] Payment failed from host:', msg, parsed)
              window.setTimeout(() => setIsProcessing(false), 400)
              return
            }
            doConsoleAndSuccess(parsed)
            window.setTimeout(() => {
              setIsProcessing(false)
              setStep('success')
            }, 800)
          }) as never,
        )
      }
    } catch (e) {
      console.warn('[eSIM Mini App] bridge REQUEST_PAYMENT failed, falling back to mock', e)
      bridged = false
    }

    if (!bridged) {
      // Standalone fallback — still console overall data after simulated delay
      window.setTimeout(() => {
        doConsoleAndSuccess({ status: 'COMPLETE (mock - no host)', mock: true, amount: pack.price })
        setIsProcessing(false)
        setStep('success')
      }, 1800)
    }
  }

  return (
    <div className={`esim-mini-app-root flex ${isEmbedded ? 'min-h-full' : 'min-h-dvh'} bg-paper`}>
      {isWeb && !isEmbedded && (
        <Sidebar
          onStepChange={(s) => {
            if (!isProcessing) setStep(s)
          }}
          step={step}
          className="fixed left-0 top-0 z-20 h-dvh max-h-screen"
        />
      )}

      <main className={isWeb && !isEmbedded ? 'flex-1 ml-56' : `flex-1 mx-auto w-full ${isEmbedded ? 'max-w-full' : 'max-w-120'}`}>
        <div className={`flex flex-col ${isEmbedded ? 'min-h-full' : 'min-h-dvh'}`}>
          <AppBar
            title={isProcessing ? 'Processing payment' : TITLES[step]}
            onBack={goBack}
            actionIcon={!isProcessing && step === 'destinations' ? 'icon-es-sim-mgmt' : undefined}
            onAction={() => console.log('Open My eSIMs')}
          />

          <div className="flex-1 pt-4 pb-8">
            {payError && !isProcessing && (
              <div className="mx-4 mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <div className="flex items-start gap-2">
                  <i className="icon-es-close text-[16px] text-red-500 mt-0.5" aria-hidden="true" />
                  <div className="flex-1">
                    <div className="text-[13px] font-semibold text-red-700">Payment failed</div>
                    <div className="mt-1 text-[12px] leading-relaxed text-red-600">{payError}</div>
                  </div>
                  <button onClick={() => setPayError(null)} className="text-[11px] font-semibold text-red-600 underline">Dismiss</button>
                </div>
                <div className="mt-2 text-[11px] text-red-500">Balance from host: Rs {(host.balance ?? 0).toLocaleString('en-IN')} · User: {host.user?.name ?? '—'}</div>
              </div>
            )}
            {isProcessing ? (
              <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 py-16 text-center">
                <div className="relative">
                  <div className="h-14 w-14 animate-spin rounded-full border-4 border-mist border-t-brand" />
                  <div className="absolute inset-0 grid place-items-center">
                    <i className="icon-es-wallet text-[18px] text-brand" aria-hidden="true" />
                  </div>
                </div>
                <h2 className="font-display mt-6 text-[18px] font-semibold text-ink">
                  Your payment is processing
                </h2>
                <p className="mt-2 max-w-[28ch] text-[13px] leading-relaxed text-slate">
                  Please don&apos;t close the app. We&apos;re confirming with eSewa.
                </p>
                <p className="mt-4 text-[11px] tracking-[0.08em] text-slate-2 uppercase">
                  This takes a few seconds
                </p>
              </div>
            ) : (
              <>
                {step === 'destinations' && (
                  <DestinationsScreen
                    onSelect={(d) => {
                      setDestination(d)
                      setPack(null)
                      setPayError(null)
                      setStep('packages')
                    }}
                  />
                )}

                {step === 'packages' && destination && (
                  <PackageScreen
                    destination={destination}
                    validity={validity}
                    startDate={startDate}
                    selectedPack={pack}
                    onValidityChange={setValidity}
                    onStartDateChange={setStartDate}
                    onPackChange={setPack}
                    onContinue={() => setStep('review')}
                  />
                )}

                {step === 'review' && destination && pack && (
                  <ReviewScreen
                    destination={destination}
                    pack={pack}
                    startDate={startDate}
                    onEdit={() => setStep('packages')}
                    onPay={handlePay}
                    balance={host.balance ?? 12480}
                    hostUser={host.user}
                    hostLocation={host.location}
                  />
                )}

                {step === 'success' && destination && pack && (
                  <SuccessScreen
                    destination={destination}
                    pack={pack}
                    startDate={startDate}
                    hostUser={host.user}
                    hostLocation={host.location}
                    balance={host.balance ?? 12480}
                    onInstall={() => console.log('Install eSIM profile')}
                    onDone={() => {
                      // console again on done for convenience
                      console.log('[eSIM Mini App] Success done — last submission:', (window as unknown as Record<string, unknown>).__ESIM_LAST_SUBMISSION__)
                      setStep('destinations')
                    }}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default function App(props: MiniAppProps = {}) {
  return (
    <ESewaProvider>
      <MiniApp {...props} />
    </ESewaProvider>
  )
}

// For non-React hosts or direct mount
export { MiniApp }