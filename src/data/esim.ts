/**
 * Mock data for the eSIM mini app.
 *
 * Two things drive the whole flow: a destination and a package. A package is
 * an amount of data held against a validity window — 1, 3 or 6 months — and it
 * starts counting from a date the traveller picks, not from the day they pay.
 */

export type Region = 'Asia' | 'Middle East' | 'Europe' | 'Americas' | 'Oceania'

export type Validity = 30 | 90 | 180

export type Destination = {
  id: string
  name: string
  flag: string
  region: Region
  /** Local networks the eSIM roams onto. Shown as the coverage line. */
  networks: string[]
  /** Multiplier applied to the base pack prices. */
  priceIndex: number
  trending?: boolean
  /** One line of why a Nepali traveller ends up here. */
  blurb?: string
}

export type Package = {
  id: string
  destinationId: string
  validity: Validity
  /** Display label for the allowance: "5 GB" or "Unlimited". */
  data: string
  speed: '5G' | '4G LTE'
  hotspot: boolean
  price: number
  tag?: string
  note?: string
}

export const VALIDITY_OPTIONS: { value: Validity; label: string; short: string }[] = [
  { value: 30, label: '1 month', short: '30 days' },
  { value: 90, label: '3 months', short: '90 days' },
  { value: 180, label: '6 months', short: '180 days' },
]

export const REGIONS: ('All' | Region)[] = [
  'All',
  'Asia',
  'Middle East',
  'Europe',
  'Americas',
  'Oceania',
]

export const destinations: Destination[] = [
  {
    id: 'th',
    name: 'Thailand',
    flag: '🇹🇭',
    region: 'Asia',
    networks: ['AIS', 'TrueMove H', 'dtac'],
    priceIndex: 1,
    trending: true,
    blurb: 'Cheapest data in the region',
  },
  {
    id: 'my',
    name: 'Malaysia',
    flag: '🇲🇾',
    region: 'Asia',
    networks: ['Maxis', 'CelcomDigi'],
    priceIndex: 1.05,
    trending: true,
    blurb: 'Covers Sabah and Sarawak',
  },
  {
    id: 'ae',
    name: 'United Arab Emirates',
    flag: '🇦🇪',
    region: 'Middle East',
    networks: ['Etisalat', 'du'],
    priceIndex: 1.5,
    trending: true,
    blurb: 'Voice over WhatsApp works',
  },
  {
    id: 'jp',
    name: 'Japan',
    flag: '🇯🇵',
    region: 'Asia',
    networks: ['NTT Docomo', 'SoftBank', 'KDDI'],
    priceIndex: 1.45,
    trending: true,
    blurb: '5G in every prefecture',
  },
  {
    id: 'au',
    name: 'Australia',
    flag: '🇦🇺',
    region: 'Oceania',
    networks: ['Telstra', 'Optus'],
    priceIndex: 1.55,
    trending: true,
    blurb: 'Long stays for students',
  },
  {
    id: 'kr',
    name: 'South Korea',
    flag: '🇰🇷',
    region: 'Asia',
    networks: ['SKT', 'KT', 'LG U+'],
    priceIndex: 1.4,
    trending: true,
    blurb: 'Fastest average speeds',
  },
  { id: 'sg', name: 'Singapore', flag: '🇸🇬', region: 'Asia', networks: ['Singtel', 'StarHub', 'M1'], priceIndex: 1.3 },
  { id: 'in', name: 'India', flag: '🇮🇳', region: 'Asia', networks: ['Airtel', 'Jio'], priceIndex: 0.7 },
  { id: 'vn', name: 'Vietnam', flag: '🇻🇳', region: 'Asia', networks: ['Viettel', 'Vinaphone'], priceIndex: 0.95 },
  { id: 'cn', name: 'China', flag: '🇨🇳', region: 'Asia', networks: ['China Unicom', 'China Mobile'], priceIndex: 1.35 },
  { id: 'qa', name: 'Qatar', flag: '🇶🇦', region: 'Middle East', networks: ['Ooredoo', 'Vodafone'], priceIndex: 1.55 },
  { id: 'sa', name: 'Saudi Arabia', flag: '🇸🇦', region: 'Middle East', networks: ['STC', 'Mobily', 'Zain'], priceIndex: 1.5 },
  { id: 'tr', name: 'Türkiye', flag: '🇹🇷', region: 'Europe', networks: ['Turkcell', 'Vodafone'], priceIndex: 1.15 },
  { id: 'gb', name: 'United Kingdom', flag: '🇬🇧', region: 'Europe', networks: ['EE', 'Vodafone', 'Three'], priceIndex: 1.6 },
  { id: 'de', name: 'Germany', flag: '🇩🇪', region: 'Europe', networks: ['Telekom', 'Vodafone', 'O2'], priceIndex: 1.6 },
  { id: 'pt', name: 'Portugal', flag: '🇵🇹', region: 'Europe', networks: ['MEO', 'NOS', 'Vodafone'], priceIndex: 1.5 },
  { id: 'us', name: 'United States', flag: '🇺🇸', region: 'Americas', networks: ['AT&T', 'T-Mobile'], priceIndex: 1.7 },
  { id: 'ca', name: 'Canada', flag: '🇨🇦', region: 'Americas', networks: ['Rogers', 'Telus'], priceIndex: 1.7 },
]

type PackTemplate = Omit<Package, 'id' | 'destinationId' | 'price'> & { base: number }

const PACK_TEMPLATES: Record<Validity, PackTemplate[]> = {
  30: [
    { validity: 30, data: '1 GB', speed: '4G LTE', hotspot: false, base: 449 },
    { validity: 30, data: '3 GB', speed: '5G', hotspot: true, base: 799 },
    { validity: 30, data: '5 GB', speed: '5G', hotspot: true, base: 1099, tag: 'Most bought' },
    { validity: 30, data: '10 GB', speed: '5G', hotspot: true, base: 1799 },
    {
      validity: 30,
      data: 'Unlimited',
      speed: '5G',
      hotspot: true,
      base: 2699,
      note: '2 GB a day at full speed, slower after',
    },
  ],
  90: [
    { validity: 90, data: '6 GB', speed: '4G LTE', hotspot: true, base: 1999 },
    { validity: 90, data: '12 GB', speed: '5G', hotspot: true, base: 3299, tag: 'Most bought' },
    { validity: 90, data: '25 GB', speed: '5G', hotspot: true, base: 5299 },
    {
      validity: 90,
      data: 'Unlimited',
      speed: '5G',
      hotspot: true,
      base: 6999,
      note: '2 GB a day at full speed, slower after',
    },
  ],
  180: [
    { validity: 180, data: '15 GB', speed: '4G LTE', hotspot: true, base: 5299 },
    { validity: 180, data: '30 GB', speed: '5G', hotspot: true, base: 8299, tag: 'Best value' },
    { validity: 180, data: '60 GB', speed: '5G', hotspot: true, base: 12999 },
  ],
}

const priceFor = (base: number, priceIndex: number) => Math.round((base * priceIndex) / 10) * 10

export function packagesFor(destination: Destination, validity: Validity): Package[] {
  return PACK_TEMPLATES[validity].map(({ base, ...rest }) => ({
    ...rest,
    id: `${destination.id}-${validity}-${rest.data.replace(/\s+/g, '').toLowerCase()}`,
    destinationId: destination.id,
    price: priceFor(base, destination.priceIndex),
  }))
}

/** Cheapest pack across every validity — the "from" price on the list. */
export function startingPrice(destination: Destination): number {
  return Math.min(...PACK_TEMPLATES[30].map((p) => priceFor(p.base, destination.priceIndex)))
}

export const CASHBACK_RATE = 0.04
export const MAX_CASHBACK = 150

export function cashbackOn(price: number): number {
  return Math.min(Math.round((price * CASHBACK_RATE) / 5) * 5, MAX_CASHBACK)
}

/* --- formatting ---------------------------------------------------------- */

export const rupees = (amount: number) => `Rs ${amount.toLocaleString('en-IN')}`

export const isoToday = () => new Date().toISOString().slice(0, 10)

export function isoPlusDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00`)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export function longDate(iso: string): string {
  if (!iso) return '—'
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export const validityLabel = (v: Validity) =>
  VALIDITY_OPTIONS.find((o) => o.value === v)?.label ?? `${v} days`
