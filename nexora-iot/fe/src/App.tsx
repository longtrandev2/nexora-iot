import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '@/components/routing/protected-route'
import { DashboardPage } from '@/pages/dashboard-page'
import { DeviceControlPage } from '@/pages/device-control-page'
import { LoginPage } from '@/pages/login-page'
import { OnoffHistoryPage } from '@/pages/onoff-history-page'
import { ProfilePage } from '@/pages/profile-page'
import { SensorHistoryPage } from '@/pages/sensor-history-page'

/** Route map: /login public, everything else behind ProtectedRoute + AppShell. */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/devices" element={<DeviceControlPage />} />
          <Route path="/sensor-history" element={<SensorHistoryPage />} />
          <Route path="/onoff-history" element={<OnoffHistoryPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
