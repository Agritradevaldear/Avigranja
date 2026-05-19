import type { DashboardAlert, AlertSeverity } from '@/lib/dashboard-data'

interface Props {
  alerts: DashboardAlert[]
}

const severityConfig: Record<
  AlertSeverity,
  { bar: string; bg: string; icon: React.ReactNode }
> = {
  alta: {
    bar: 'bg-red-500',
    bg: 'bg-red-50',
    icon: (
      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
    ),
  },
  media: {
    bar: 'bg-yellow-400',
    bg: 'bg-yellow-50',
    icon: (
      <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  info: {
    bar: 'bg-blue-400',
    bg: 'bg-blue-50',
    icon: (
      <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
}

export default function AlertsPanel({ alerts }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-full">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-800">Alertas</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          {alerts.length > 0
            ? `${alerts.length} alerta${alerts.length !== 1 ? 's' : ''} activa${alerts.length !== 1 ? 's' : ''}`
            : 'Sin alertas'}
        </p>
      </div>

      {alerts.length === 0 ? (
        <div className="px-5 py-8 text-center text-sm text-gray-400">
          Todo en orden. No hay alertas activas.
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {alerts.map((alert) => {
            const config = severityConfig[alert.severity]
            return (
              <div key={alert.id} className={`flex gap-3 px-5 py-4 ${config.bg}`}>
                <div className={`w-1 rounded-full shrink-0 self-stretch ${config.bar}`} />
                <div className="flex gap-3 min-w-0">
                  <div className="shrink-0 mt-0.5">{config.icon}</div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{alert.title}</p>
                    <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{alert.description}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
