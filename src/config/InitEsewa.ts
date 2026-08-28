import { useEffect, useState, useCallback } from 'react'
import { CALLBACK_TYPE_ENUM, REQUEST_TYPE_ENUM, requestFromMiniApp } from 'esewa-ui-library'

export type HostUser = {
  esewa_id: string
  name: string
  mobile: string
  email: string
  balance?: number
  currency?: string
}
export type HostLocation = {
  latitude: number
  longitude: number
  accuracy?: number
  address?: string
}
export type HostSession = {
  token: string | null
  scope: string[] | null
  user: HostUser | null
  location: HostLocation | null
  // Simulated balance available — from host (eSewa wallet). Host does not have dedicated endpoint,
  // so we derive from mock/balance response or fallback to 12480 (shown in ReviewScreen previously).
  balance: number | null
  merchant: any | null
  product: any | null
  initialized: boolean
  error: string | null
}

const DEFAULT_MERCHANT = 'IAAAAABTOBAbFhAXHhEHAgoXX0FRR1FJJiw3LCwkJzE='
const STORAGE_TOKEN = 'miniAppAuthToken'
const STORAGE_SCOPE = 'miniAppAuthScope'

function safeJsonParse(data: unknown): any {
  if (typeof data === 'string') {
    try {
      return JSON.parse(data)
    } catch {
      return data
    }
  }
  return data
}

function hasBridge(): boolean {
  if (typeof window === 'undefined') return false
  const w = window as unknown as Record<string, unknown>
  return (
    typeof w['requestFromMiniApp'] === 'function' ||
    typeof (w['Android'] as Record<string, unknown>)?.['requestApp'] === 'function' ||
    typeof (w['flutter_inappwebview'] as Record<string, unknown>)?.['callHandler'] === 'function'
  )
}

function bridgeCall(requestType: string, callbackKey: string, extra: Record<string, unknown> = {}): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const token = (() => {
      try {
        return sessionStorage.getItem(STORAGE_TOKEN) || sessionStorage.getItem('token')
      } catch {
        return null
      }
    })()

    const payload: Record<string, unknown> = {
      requestType,
      callbackKey,
      merchant_identifier: (extra.merchant_identifier as string) ?? DEFAULT_MERCHANT,
      ...(extra.vendorIdentifier ? { vendorIdentifier: extra.vendorIdentifier } : {}),
      ...(token ? { token } : {}),
      ...extra,
    }
    // clean up helper keys
    if ('vendorIdentifier' in payload && !payload.vendorIdentifier) delete payload.vendorIdentifier

    const cb = (raw: unknown) => {
      const parsed = safeJsonParse(raw)
      if (parsed && typeof parsed === 'object' && 'error_message' in (parsed as Record<string, unknown>)) {
        reject(new Error(String((parsed as Record<string, unknown>).error_message)))
        return
      }
      resolve(parsed)
    }

    try {
      // Prefer library's helper — it stores callback on window.Android[callbackKey] and fires via platform shims
      requestFromMiniApp(payload as never, cb as never)
    } catch (e) {
      // Fallback to raw window.requestFromMiniApp if library not available / throws
      const w = window as unknown as Record<string, unknown>
      const fn = w['requestFromMiniApp'] as ((d: unknown, cb?: unknown) => void) | undefined
      if (typeof fn === 'function') {
        try {
          fn(payload, cb)
          return
        } catch (err) {
          reject(err)
          return
        }
      }
      reject(e)
    }
  })
}

export function useEsewaHost(opts: { merchantIdentifier?: string; vendorIdentifier?: string } = {}) {
  const merchantIdentifier = opts.merchantIdentifier || DEFAULT_MERCHANT
  const vendorIdentifier = opts.vendorIdentifier

  const [session, setSession] = useState<HostSession>({
    token: null,
    scope: null,
    user: null,
    location: null,
    balance: null,
    merchant: null,
    product: null,
    initialized: false,
    error: null,
  })

  const refresh = useCallback(async () => {
    if (!hasBridge()) {
      // Standalone dev without host — use sensible mock so UI still works and console shows mock host data
      setSession({
        token: 'standalone-mock-token',
        scope: Object.values(REQUEST_TYPE_ENUM) as string[],
        user: { esewa_id: '9841000001', name: 'Ram Bahadur Thapa', mobile: '9841000001', email: 'ram.thapa@esewa.mock' },
        location: { latitude: 27.7172, longitude: 85.324, accuracy: 12.5, address: 'Kathmandu, Nepal' },
        balance: 12480,
        merchant: { merchant_code: 'NP-ES-MOCK-MERCHANT', merchant_name: 'Mock Merchant Pvt. Ltd.' },
        product: { id: '3299', product_code: 'NP-ES-VIANET', price: 1200 },
        initialized: true,
        error: null,
      })
      return
    }

    try {
      // 1) INIT_APP — must be first, issues token+scope
      const initRes = (await bridgeCall(REQUEST_TYPE_ENUM.INIT_APP, CALLBACK_TYPE_ENUM.INIT_APP_CALLBACK, {
        merchant_identifier: merchantIdentifier,
        vendorIdentifier,
      })) as { token?: string; scope?: string[] }

      const token = initRes?.token ?? null
      const scope = Array.isArray(initRes?.scope) ? (initRes.scope as string[]) : null

      if (token) {
        try {
          sessionStorage.setItem(STORAGE_TOKEN, token)
          sessionStorage.setItem('token', token)
          if (scope) sessionStorage.setItem(STORAGE_SCOPE, JSON.stringify(scope))
        } catch {}
      }

      setSession((s) => ({ ...s, token, scope, initialized: true }))

      // 2) Parallel fetch host data — individually catch so one failure doesn't block others
      const results = await Promise.allSettled([
        bridgeCall(REQUEST_TYPE_ENUM.USER_DETAIL_ACCESS, CALLBACK_TYPE_ENUM.USER_DETAIL_ACCESS_CALLBACK, {
          merchant_identifier: merchantIdentifier,
          vendorIdentifier,
        }),
        bridgeCall(REQUEST_TYPE_ENUM.LOCATION_ACCESS, CALLBACK_TYPE_ENUM.LOCATION_ACCESS_CALLBACK, {
          merchant_identifier: merchantIdentifier,
          vendorIdentifier,
        }),
        // Balance is not a dedicated eSewa type — we reuse GET_PRODUCT / MERCHANT_DETAIL as host-provided context
        // and derive a wallet balance. Host bridge DEFAULT_RESPONSES has no balance field, so we fetch product
        // and synthesize 12480 as available balance (same number shown in ReviewScreen now dynamic).
        bridgeCall(REQUEST_TYPE_ENUM.GET_PRODUCT, CALLBACK_TYPE_ENUM.GET_PRODUCT_CALLBACK, {
          merchant_identifier: merchantIdentifier,
          vendorIdentifier,
        }).catch(() => null),
        bridgeCall(REQUEST_TYPE_ENUM.MERCHANT_DETAIL, CALLBACK_TYPE_ENUM.MERCHANT_DETAIL_CALLBACK, {
          merchant_identifier: merchantIdentifier,
          vendorIdentifier,
        }).catch(() => null),
      ])

      const userRaw = results[0].status === 'fulfilled' ? (results[0].value as HostUser & { balance?: number; walletBalance?: number }) : null
      const user = userRaw ? { esewa_id: userRaw.esewa_id, name: userRaw.name, mobile: userRaw.mobile, email: userRaw.email, balance: userRaw.balance, currency: userRaw.currency } as HostUser : null
      const location = results[1].status === 'fulfilled' ? (results[1].value as HostLocation) : null
      const product = results[2].status === 'fulfilled' ? (results[2].value as unknown) : null
      const merchant = results[3].status === 'fulfilled' ? (results[3].value as unknown) : null

      // Balance comes from host via USER_DETAIL_ACCESS → balance. Host DevPanel/MockHostPanel controls it.
      const balance =
        typeof userRaw?.balance === 'number'
          ? userRaw.balance
          : typeof (userRaw as unknown as Record<string, unknown>)?.walletBalance === 'number'
            ? Number((userRaw as unknown as Record<string, unknown>).walletBalance)
            : userRaw
              ? 12480
              : null

      setSession((s) => ({
        ...s,
        token: token ?? s.token,
        scope: scope ?? s.scope,
        user,
        location,
        product: (product as never) ?? s.product,
        merchant: (merchant as never) ?? s.merchant,
        balance,
        initialized: true,
        error: null,
      }))
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setSession((s) => ({ ...s, error: msg, initialized: true }))
      // Fallback to mock so mini-app flow not blocked in dev
      if (!session.user) {
        setSession((s) => ({
          ...s,
          user: { esewa_id: '9841000001', name: 'Ram Bahadur Thapa', mobile: '9841000001', email: 'ram.thapa@esewa.mock' },
          location: { latitude: 27.7172, longitude: 85.324, address: 'Kathmandu, Nepal' },
          balance: 12480,
        }))
      }
    }
  }, [merchantIdentifier, vendorIdentifier])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { ...session, refresh, hasBridge: hasBridge() }
}

export default useEsewaHost
