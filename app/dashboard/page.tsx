"use client"

import Link from "next/link"
import { differenceInCalendarDays, format, subDays } from "date-fns"
import { useMemo, useState, useSyncExternalStore, type ReactNode } from "react"
import { motion } from "motion/react"
import { IconBriefcase, IconPlus, IconShip } from "@tabler/icons-react"

import { AttentionCard } from "@/components/dashboard/business/attention-card"
import { BusinessKpis } from "@/components/dashboard/business/business-kpis"
import { CashCard } from "@/components/dashboard/business/cash-card"
import { CustomerProfitCard, JobHealthCard } from "@/components/dashboard/business/customer-profit-card"
import { ProfitTrendCard } from "@/components/dashboard/business/profit-trend-card"
import { DashboardContainerMix } from "@/components/dashboard/dashboard-container-mix"
import { DashboardRankings } from "@/components/dashboard/dashboard-rankings"
import { DashboardShipmentsByVoyage } from "@/components/dashboard/dashboard-shipments-by-voyage"
import { OverviewPipelineCard } from "@/components/dashboard/overview-pipeline-card"
import { OverviewStats } from "@/components/dashboard/overview-stats"
import { OverviewVolumeChart } from "@/components/dashboard/overview-volume-chart"
import { OverviewVoyageTracker } from "@/components/dashboard/overview-voyage-tracker"
import ErrorPage from "@/components/error-page"
import { DashboardPage } from "@/components/layout/dashboard-page"
import DashboardSkeleton from "@/components/loading/dashboard-skeleton"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { DateRangePicker, type TableDateRange } from "@/components/ui/date-range-picker"
import { useBusinessOverview, useDashboard } from "@/hooks/use-dashboard"
import { usePermissions } from "@/hooks/use-permissions"
import { authClient } from "@/lib/auth-client"
import { parseLocalDate } from "@/lib/date-input"
import { BUSINESS_OVERVIEW_ENABLED, VENDOR_INVOICE_MODULE_ENABLED } from "@/lib/feature-flags"

const ISO = "yyyy-MM-dd"
const easeOut = [0.22, 1, 0.36, 1] as const

function getDefaultDashboardDateRange(): TableDateRange {
  const end = new Date()
  return { from: format(subDays(end, 30), ISO), to: format(end, ISO) }
}

/** The equally long window that ends the day before `range` starts. */
function previousRange(range: TableDateRange) {
  const from = range.from ? parseLocalDate(range.from) : null
  const to = range.to ? parseLocalDate(range.to) : null
  if (!from || !to) return null
  const length = differenceInCalendarDays(to, from) + 1
  const prevEnd = subDays(from, 1)
  return { startDate: format(subDays(prevEnd, length - 1), ISO), endDate: format(prevEnd, ISO) }
}

function greetingFor(hour: number) {
  if (hour < 11) return "Good Morning"
  if (hour < 15) return "Good Afternoon"
  if (hour < 19) return "Good Evening"
  return "Good Night"
}

function useGreeting() {
  // Server render falls back to a neutral greeting so hydration matches.
  return useSyncExternalStore(
    () => () => {},
    () => greetingFor(new Date().getHours()),
    () => "Welcome back"
  )
}

const reveal = (delay: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: easeOut },
})

function SectionHeading({ id, icon, title, description }: { id: string; icon: ReactNode; title: string; description: string }) {
  return (
    <div id={id} className="flex scroll-mt-24 items-center gap-3 pt-2">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full brand-fill text-white">{icon}</span>
      <div className="min-w-0">
        <h2 className="text-xl font-medium tracking-[-0.02em] text-foreground">{title}</h2>
        <p className="text-[13px] text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

function BusinessSkeleton() {
  return (
    <div className="space-y-4 lg:space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:gap-5 xl:grid-cols-4">
        {[0, 1, 2, 3].map((key) => (
          <Skeleton key={key} className="h-[168px] rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:gap-5 xl:grid-cols-12">
        <Skeleton className="h-[420px] rounded-2xl xl:col-span-8" />
        <Skeleton className="h-[420px] rounded-2xl xl:col-span-4" />
      </div>
    </div>
  )
}

export default function DashboardHomePage() {
  const defaultDateRange = useMemo(() => getDefaultDashboardDateRange(), [])
  const [dateRange, setDateRange] = useState<TableDateRange>(defaultDateRange)
  const { data: session } = authClient.useSession()
  const { can } = usePermissions()
  const greeting = useGreeting()
  const firstName = session?.user?.name?.split(" ")[0] ?? ""

  const queryParams = useMemo(
    () => ({ startDate: dateRange.from, endDate: dateRange.to }),
    [dateRange.from, dateRange.to]
  )
  const previousParams = useMemo(() => previousRange(dateRange), [dateRange])

  const { data, isLoading, error } = useDashboard(queryParams)
  const business = useBusinessOverview(queryParams, BUSINESS_OVERVIEW_ENABLED)
  const money = business.data
  const showBusiness =
    BUSINESS_OVERVIEW_ENABLED &&
    (business.isLoading ||
    Boolean(money && (money.profit || money.receivables || money.payables || Object.values(money.attention).some((v) => v !== null))))
  const { data: previous } = useDashboard(previousParams ?? undefined, {
    enabled: previousParams !== null,
  })
  const previousData = previousParams ? previous : undefined

  if (error) {
    return (
      <ErrorPage
        title="Failed to load dashboard"
        message={error.message || "Could not fetch analytics. Please try again."}
      />
    )
  }

  return (
    <DashboardPage>
      <header className="mb-6 flex flex-col gap-5 lg:mb-8 lg:flex-row lg:items-end lg:justify-between">
        <motion.div {...reveal(0)}>
          <p className="text-xl text-foreground lg:text-2xl">
            Hello{firstName ? ` ${firstName}` : ""},
          </p>
          <h1 className="mt-1 text-[44px] font-medium leading-[1.05] tracking-[-0.035em] text-foreground sm:text-[56px]">
            {greeting}
          </h1>
        </motion.div>

        <motion.div
          {...reveal(0.05)}
          className="flex flex-wrap items-center gap-1.5 rounded-[28px] bg-card/60 p-1 sm:rounded-full"
        >
          <DateRangePicker
            layout="timeframe"
            label="Timeframe"
            value={dateRange}
            showAllOption={false}
            onChange={(next) => setDateRange(next.from || next.to ? next : defaultDateRange)}
          />
          {can("SHIPMENT", "view") ? (
            <Button asChild variant="outline">
              <Link href="/dashboard/shipments">View shipments</Link>
            </Button>
          ) : null}
          {can("SHIPMENT", "create") ? (
            <Button asChild>
              <Link href="/dashboard/shipments/new">
                <IconPlus />
                Add new shipment
              </Link>
            </Button>
          ) : null}
        </motion.div>
      </header>

      <div className="min-w-0 space-y-4 lg:space-y-5">
        {showBusiness ? (
          <>
            <motion.div {...reveal(0.06)}>
              <SectionHeading
                id="business"
                icon={<IconBriefcase className="size-5" />}
                title="How the business is doing"
                description="Sales jobs opened in this timeframe, and money still owed both ways."
              />
            </motion.div>
            {!money ? (
              <BusinessSkeleton />
            ) : (
              <>
                <motion.div {...reveal(0.1)}>
                  <BusinessKpis
                    data={money}
                    links={{
                      sales: can("SALES", "view") ? "/dashboard/sales" : undefined,
                      receivables: can("CUSTOMER_INVOICE", "view") ? "/dashboard/customer-invoices" : undefined,
                      payables: can("VENDOR_INVOICE", "view") ? "/dashboard/vendor-invoices" : undefined,
                    }}
                  />
                </motion.div>

                <motion.div {...reveal(0.14)} className="grid min-w-0 grid-cols-1 gap-4 lg:gap-5 xl:grid-cols-12">
                  {money.profit ? (
                    <div className="min-w-0 xl:col-span-8">
                      <ProfitTrendCard profit={money.profit} />
                    </div>
                  ) : null}
                  <div className={money.profit ? "min-w-0 xl:col-span-4" : "min-w-0 xl:col-span-12"}>
                    <AttentionCard attention={money.attention} />
                  </div>
                </motion.div>

                <motion.div {...reveal(0.18)} className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 lg:gap-5 xl:grid-cols-12">
                  {money.receivables || money.payables ? (
                    <div className="min-w-0 md:col-span-2 xl:col-span-6">
                      <CashCard receivables={money.receivables} payables={money.payables} />
                    </div>
                  ) : null}
                  {money.profit ? (
                    <>
                      <div className="min-w-0 xl:col-span-3">
                        <CustomerProfitCard customers={money.profit.customers} />
                      </div>
                      <div className="min-w-0 xl:col-span-3">
                        <JobHealthCard health={money.profit.health} />
                      </div>
                    </>
                  ) : null}
                </motion.div>
              </>
            )}
          </>
        ) : null}

        {/* The heading only separates the two sections; alone it adds nothing. */}
        {showBusiness ? (
          <motion.div {...reveal(0.22)}>
            <SectionHeading
              id="shipments"
              icon={<IconShip className="size-5" />}
              title="Shipment activity"
              description="What is moving, what is waiting, and on which vessel."
            />
          </motion.div>
        ) : null}

        {isLoading || !data ? (
          <DashboardSkeleton />
        ) : (
          <>
            <div className="grid min-w-0 grid-cols-1 gap-4 lg:gap-5 xl:grid-cols-12">
              <motion.div {...reveal(0.26)} className="flex min-w-0 flex-col gap-4 lg:gap-5 xl:col-span-6">
                <OverviewStats data={data} previous={previousData} />
                <div className="flex-1">
                  <OverviewVolumeChart data={data} />
                </div>
              </motion.div>

              <motion.div {...reveal(0.3)} className="min-w-0 xl:col-span-3">
                <OverviewPipelineCard data={data} />
              </motion.div>

              <motion.div {...reveal(0.34)} className="min-w-0 xl:col-span-3">
                <OverviewVoyageTracker />
              </motion.div>
            </div>

            <motion.div {...reveal(0.38)}>
              <DashboardShipmentsByVoyage />
            </motion.div>

            <motion.div
              {...reveal(0.42)}
              className={
                VENDOR_INVOICE_MODULE_ENABLED
                  ? "grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-5 xl:grid-cols-4"
                  : "grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-5"
              }
            >
              <DashboardContainerMix data={data} />
              <DashboardRankings data={data} />
            </motion.div>
          </>
        )}
      </div>
    </DashboardPage>
  )
}
