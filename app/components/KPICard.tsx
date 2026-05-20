interface KPICardProps {
  title: string
  value: string
  subtitle?: string
  icon: React.ReactNode
  iconBgClass: string
  barColorClass: string
}

export default function KPICard({ title, value, subtitle, icon, iconBgClass, barColorClass }: KPICardProps) {
  return (
    <div className="relative bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6 shadow-sm overflow-hidden">
      <div className={`absolute left-0 inset-y-0 w-1 rounded-l-2xl ${barColorClass}`} />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium truncate">{title}</p>
          <p className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mt-1 leading-tight">{value}</p>
          {subtitle && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`${iconBgClass} p-3 rounded-xl shrink-0`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
