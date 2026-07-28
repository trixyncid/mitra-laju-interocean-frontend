export function DashboardAtmosphere() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 min-h-full">
      <div className="absolute inset-0 min-h-full bg-[linear-gradient(165deg,#e4ecf6_0%,#eef3f9_42%,#dde7f2_100%)]" />
      <div className="absolute -left-24 top-0 size-[28rem] rounded-full bg-[var(--chart-4)]/20 blur-3xl" />
      <div className="absolute right-0 top-32 size-[24rem] rounded-full bg-[var(--mli-primary-container)]/12 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 size-[22rem] rounded-full bg-[var(--chart-5)]/18 blur-3xl" />
    </div>
  )
}
