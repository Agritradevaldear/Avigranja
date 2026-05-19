interface KPICardProps {
  title: string
  value: string
  subtitle?: string
  icon: React.ReactNode
  iconBgClass: string
}

export default function KPICard({ title, value, subtitle, icon, iconBgClass }: KPICardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-gray-500 font-medium truncate">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1 leading-tight">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`${iconBgClass} p-3 rounded-xl shrink-0`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
