import { useState, useEffect } from 'react'
import { ESewaProvider } from 'esewa-ui-library'
import 'esewa-ui-library/dist/index.css'
import AppBar from './components/AppBar'
import DestinationsScreen from './screens/DestinationsScreen'
import PackageScreen from './screens/PackageScreen'
import ReviewScreen from './screens/ReviewScreen'
import SuccessScreen from './screens/SuccessScreen'
import Sidebar from './components/Sidebar'
import { isoPlusDays, isoToday, type Destination, type Package, type Validity } from './data/esim'

type Step = 'destinations' | 'packages' | 'review' | 'success'

const TITLES: Record<Step, string> = {
  destinations: 'eSIM',
  packages: 'Choose a pack',
  review: 'Review order',
  success: 'eSIM issued',
}

function MiniApp() {
  const [step, setStep] = useState<Step>('destinations')
  const [destination, setDestination] = useState<Destination | null>(null)
  const [validity, setValidity] = useState<Validity>(30)
  const [pack, setPack] = useState<Package | null>(null)
  // Defaults to a week out — most people buy before a trip, not on the day.
  const [startDate, setStartDate] = useState(isoPlusDays(isoToday(), 7))

  const [isWeb, setIsWeb] = useState(false)

  useEffect(() => {
    const checkWidth = () => setIsWeb(window.innerWidth >= 768)
    checkWidth()
    window.addEventListener('resize', checkWidth)
    return () => window.removeEventListener('resize', checkWidth)
  }, [])

  const goBack = () => {
    if (step === 'packages') setStep('destinations')
    else if (step === 'review') setStep('packages')
    else if (step === 'success') setStep('destinations')
    // From the first screen the host app takes over.
    else console.log('Exit mini app — hand back to eSewa')
  }

  return (
    <div className="flex min-h-dvh bg-[var(--color-paper)]">
      {isWeb && (
        <Sidebar
          onStepChange={setStep}
          step={step}
          className="fixed left-0 top-0 z-30 h-dvh max-h-screen"
        />
      )}

      <main className={isWeb ? 'flex-1 pl-[224px]' : 'flex-1 mx-auto max-w-[480px] w-full'}>
        <div className="flex flex-col min-h-dvh">
          <AppBar
            title={TITLES[step]}
            onBack={goBack}
            actionIcon={step === 'destinations' ? 'icon-es-sim-mgmt' : undefined}
            onAction={() => console.log('Open My eSIMs')}
          />

          <div className="flex-1 overflow-y-auto pt-4 pb-8">
            {step === 'destinations' && (
              <DestinationsScreen
                onSelect={(d) => {
                  setDestination(d)
                  setPack(null)
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
                onPay={() => setStep('success')}
              />
            )}

            {step === 'success' && destination && pack && (
              <SuccessScreen
                destination={destination}
                pack={pack}
                startDate={startDate}
                onInstall={() => console.log('Install eSIM profile')}
                onDone={() => setStep('destinations')}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <ESewaProvider>
      <MiniApp />
    </ESewaProvider>
  )
}