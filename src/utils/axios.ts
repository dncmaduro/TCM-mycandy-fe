import axios, { AxiosRequestConfig, AxiosResponse } from "axios"
import { useAuthStore } from "../stores/authState"

// Flag to avoid multiple simultaneous refresh calls
let refreshingPromise: Promise<string | null> | null = null

async function tryRefresh(): Promise<string | null> {
  const state = useAuthStore.getState()
  if (!state.refreshToken) return null
  if (state.isRefreshExpired()) {
    state.clearAuth()
    return null
  }
  // If already refreshing, reuse
  if (refreshingPromise) return refreshingPromise

  const backendUrl = import.meta.env.VITE_BACKEND_URL
  refreshingPromise = fetch(`${backendUrl}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ refreshToken: state.refreshToken })
  })
    .then(async (r) => {
      if (!r.ok) throw new Error("Refresh failed")
      return r.json() as Promise<{
        accessToken: string
        refreshToken?: string
        accessTokenTtlSec?: number
        refreshTokenTtlSec?: number
      }>
    })
    .then((data) => {
      state.setAuth({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresIn: data.accessTokenTtlSec,
        refreshExpiresIn: data.refreshTokenTtlSec
      })
      return data.accessToken
    })
    .catch(() => {
      state.clearAuth()
      return null
    })
    .finally(() => {
      refreshingPromise = null
    })

  return refreshingPromise
}

type AxiosCallApi<D> = {
  path: string
  data?: D
  token?: string
  customUrl?: string
  method: AxiosRequestConfig["method"]
  headers?: Record<string, string>
  params?: Record<string, any>
}

export async function callApi<D = unknown, T = unknown>({
  path,
  data,
  token,
  customUrl,
  method,
  headers,
  params
}: AxiosCallApi<D>): Promise<AxiosResponse<T>> {
  const convertedHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...headers
  }

  const state = useAuthStore.getState()
  let finalToken = token || state.accessToken || undefined

  // If caller not forcing token and token exists but expired -> attempt refresh first
  if (!token && finalToken && state.isTokenExpired()) {
    finalToken = (await tryRefresh()) || undefined
  }

  if (finalToken) {
    convertedHeaders["Authorization"] = `Bearer ${finalToken}`
  }

  const baseUrl = customUrl ?? import.meta.env.VITE_BACKEND_URL
  let url = baseUrl + path
  if (params) {
    const qs = toQueryString(params)
    if (qs) {
      url += (url.includes("?") ? "&" : "?") + qs
    }
  }

  const response = await axios<T>({
    url,
    headers: convertedHeaders,
    data,
    method,
    responseType:
      headers?.["Content-Type"] ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ? "blob"
        : "json"
  })

  // If unauthorized try one refresh attempt (if not already tried)
  if (response.status === 401) {
    const newToken = await tryRefresh()
    if (newToken) {
      convertedHeaders["Authorization"] = `Bearer ${newToken}`
      return axios<T>({
        url,
        headers: convertedHeaders,
        data,
        method
      })
    }
  }

  return response
}

export function toQueryString(params: Record<string, any>): string {
  const esc = encodeURIComponent
  return Object.entries(params)
    .filter(([_, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${esc(k)}=${esc(v)}`)
    .join("&")
}
