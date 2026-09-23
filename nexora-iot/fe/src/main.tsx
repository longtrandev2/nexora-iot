import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from '@/auth/auth-context'
import { ToastProvider } from '@/components/ui/toast'
import { IotApiProvider } from '@/services/iot-api-context'
import '@/styles/global.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <IotApiProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </IotApiProvider>
    </ToastProvider>
  </StrictMode>,
)
