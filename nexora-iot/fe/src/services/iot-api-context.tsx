import { createContext, useContext, useState, type ReactNode } from 'react'
import { createIotApi } from './create-iot-api'
import type { IotApi } from './iot-api'

/**
 * Provides ONE IotApi instance for the whole app (single simulator timer in
 * mock mode, one axios client in http mode). Pages/hooks get it via useIotApi().
 */
const IotApiContext = createContext<IotApi | null>(null)

export function IotApiProvider({ children }: { children: ReactNode }) {
  const [api] = useState<IotApi>(() => createIotApi())
  return <IotApiContext.Provider value={api}>{children}</IotApiContext.Provider>
}

export function useIotApi(): IotApi {
  const api = useContext(IotApiContext)
  if (!api) throw new Error('useIotApi must be used within <IotApiProvider>')
  return api
}
