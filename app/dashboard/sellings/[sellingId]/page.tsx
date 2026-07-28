"use client"

import { use } from "react"
import Link from "next/link"
import {
    IconArrowLeft,
    IconCash,
    IconLink,
    IconLinkOff,
    IconPencil,
    IconReceipt,
    IconShip,
    IconTags,
    IconTrendingDown,
    IconTrendingUp,
} from "@tabler/icons-react"
import { Dot } from "lucide-react"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import SellingForm from "@/components/forms/selling-form"
import LinkSellingCostingForm from "@/components/forms/link-selling-costing-form"
import LinkSellingShipmentForm from "@/components/forms/link-selling-shipment-form"
import { useSellingById, useUpdateSelling } from "@/hooks/use-sellings"
import { useUpdateCosting } from "@/hooks/use-costings"
import { amountCalculation, cn, localDate, sellingNetAmount } from "@/lib/utils"
import SellingLoading from "@/components/loading/selling-loading"
import { DashboardPage, DashboardPageCard } from "@/components/layout/dashboard-page"
import { SellingWriteGate } from "@/components/write-gates"
import ErrorPage from "@/components/error-page"
import {
    PaymentStatusChip,
    UnlinkedChip,
    WarningChip,
} from "@/components/ui/status-chip"
import {
    brandLink,
    brandText,
    glassInset,
    glassPanel,
    glassShine,
} from "@/lib/design"

type LinkedCosting = {
    id: string
    costingNumber: string
    description: string
    price: number
    currency: number
    vatPercentage: number
    pph23Percentage: number
    vendor: { vendorName: string } | null
}

function SectionIntro({
    title,
    description,
    action,
}: {
    title: string
    description: string
    action?: React.ReactNode
}) {
    return (
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
                <h2 className="text-headline-md font-semibold tracking-tight">{title}</h2>
                <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
            </div>
            {action ? <div className="shrink-0">{action}</div> : null}
        </div>
    )
}

function OverviewField({
    label,
    children,
    className,
}: {
    label: string
    children: React.ReactNode
    className?: string
}) {
    return (
        <div className={cn("space-y-1.5", className)}>
            <p className="text-xs font-semibold tracking-[0.05em] text-muted-foreground uppercase">
                {label}
            </p>
            <div className="text-sm font-medium text-foreground">{children}</div>
        </div>
    )
}

function EmptyState({
    icon: Icon,
    title,
    description,
    action,
}: {
    icon: React.ComponentType<{ className?: string }>
    title: string
    description: string
    action?: React.ReactNode
}) {
    return (
        <div
            className={cn(
                glassInset,
                "flex flex-col items-center justify-center gap-3 px-6 py-14 text-center"
            )}
        >
            <div className="flex size-12 items-center justify-center rounded-md bg-[rgba(214,227,255,0.45)] text-[var(--mli-primary-container)]">
                <Icon className="size-6" />
            </div>
            <div className="space-y-1">
                <p className="font-semibold text-foreground">{title}</p>
                <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
            </div>
            {action ? <div className="pt-1">{action}</div> : null}
        </div>
    )
}

function SummaryRow({
    label,
    value,
    muted,
    emphasize,
}: {
    label: string
    value: React.ReactNode
    muted?: boolean
    emphasize?: boolean
}) {
    return (
        <div
            className={cn(
                "flex items-start justify-between gap-4 border-b border-[rgba(214,227,255,0.35)] py-3 last:border-b-0",
                emphasize && "pt-4"
            )}
        >
            <p
                className={cn(
                    "text-sm",
                    emphasize ? "font-medium text-foreground" : "text-muted-foreground"
                )}
            >
                {label}
            </p>
            <div
                className={cn(
                    "text-right text-sm font-medium tabular-nums",
                    muted ? "text-muted-foreground" : "text-foreground",
                    emphasize && "text-base font-semibold"
                )}
            >
                {value}
            </div>
        </div>
    )
}

function formatIdr(value: number) {
    return value.toLocaleString("id-ID", { style: "currency", currency: "IDR" })
}

function costingTotal(costing: LinkedCosting) {
    return amountCalculation(
        costing.price,
        costing.currency,
        costing.vatPercentage,
        costing.pph23Percentage
    )
}

export default function SellingDetailPage({
    params,
}: {
    params: Promise<{ sellingId: string }>
}) {
    const { sellingId } = use(params)

    const { data: selling, isLoading, error } = useSellingById(sellingId)
    const updateSelling = useUpdateSelling()
    const updateCosting = useUpdateCosting()
    const queryClient = useQueryClient()

    if (isLoading) return <SellingLoading />
    if (error) return <ErrorPage message={error.message} />
    if (!selling) {
        return (
            <ErrorPage
                title="Selling not found"
                message="Unable to load this selling."
            />
        )
    }

    const costings = (selling.costings ?? []) as LinkedCosting[]
    const gross = Number(selling.amount) || 0
    const vatPercentage = Number(selling.vatPercentage) || 0
    const pph23Percentage = Number(selling.pph23Percentage) || 0
    const net = sellingNetAmount(gross, vatPercentage, pph23Percentage)
    const totalFromCostings = costings.reduce(
        (acc, costing) => acc + costingTotal(costing),
        0
    )
    const revenue = net - totalFromCostings
    const marginPercent = net > 0 ? (revenue / net) * 100 : null
    const isPaid = selling.status === "PAID"
    const shipment = selling.shipment
    const linkedShipmentId = shipment?.id ?? undefined
    const updatedByName =
        typeof selling.updatedBy === "string"
            ? selling.updatedBy
            : "name" in selling.updatedBy
              ? selling.updatedBy.name
              : undefined
    const isProfitable = revenue >= 0

    return (
        <DashboardPage atmosphere>
            <div className="mb-6">
                <Button asChild variant="ghost" className="text-muted-foreground">
                    <Link href="/dashboard/sellings">
                        <IconArrowLeft className="size-5" />
                        Back to sellings
                    </Link>
                </Button>
            </div>

            <section className={cn(glassPanel, "relative mb-8 overflow-hidden")}>
                <div aria-hidden className={glassShine} />

                <div className="relative space-y-8 p-6 lg:p-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex min-w-0 items-start gap-4 sm:gap-5">
                            <div
                                className={cn(
                                    glassInset,
                                    "flex size-14 shrink-0 items-center justify-center sm:size-16"
                                )}
                            >
                                <IconCash className="size-8 text-[var(--mli-primary-container)] sm:size-9" />
                            </div>

                            <div className="min-w-0 space-y-3">
                                <div className="space-y-2">
                                    <div className="flex flex-wrap items-center gap-2.5">
                                        <h1 className="text-headline-lg tracking-tight">
                                            {selling.sellingNumber}
                                        </h1>
                                        <PaymentStatusChip paid={isPaid} />
                                    </div>
                                    <p
                                        className={cn(
                                            "font-mono text-sm font-medium tracking-wide",
                                            brandText
                                        )}
                                    >
                                        Selling invoice
                                    </p>
                                </div>

                                <p className="max-w-2xl text-sm text-muted-foreground">
                                    {selling.description || "No description provided."}
                                </p>

                                <p className="flex flex-wrap items-center gap-x-1 text-sm text-muted-foreground">
                                    <span>
                                        Updated{" "}
                                        {selling.updatedAt
                                            ? localDate(selling.updatedAt)
                                            : "—"}
                                        {updatedByName ? ` by ${updatedByName}` : ""}
                                    </span>
                                    {selling.createdAt ? (
                                        <>
                                            <Dot className="hidden size-4 sm:inline" />
                                            <span>
                                                Created {localDate(selling.createdAt)}
                                            </span>
                                        </>
                                    ) : null}
                                </p>
                            </div>
                        </div>

                        <SellingWriteGate>
                            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                                <Button
                                    size="sm"
                                    variant={isPaid ? "outline" : "default"}
                                    onClick={() => {
                                        updateSelling.mutate(
                                            {
                                                id: sellingId,
                                                selling: {
                                                    status: isPaid ? "UNPAID" : "PAID",
                                                },
                                            },
                                            {
                                                onSuccess: () =>
                                                    toast.success(
                                                        isPaid
                                                            ? "Selling marked as unpaid"
                                                            : "Selling marked as paid"
                                                    ),
                                                onError: (err: Error) =>
                                                    toast.error(err.message),
                                            }
                                        )
                                    }}
                                    disabled={updateSelling.isPending}
                                >
                                    {updateSelling.isPending
                                        ? "Updating..."
                                        : isPaid
                                          ? "Mark as Unpaid"
                                          : "Mark as Paid"}
                                </Button>
                                <SellingForm
                                    mode="edit"
                                    id={sellingId}
                                    sellingNumber={selling.sellingNumber}
                                    description={selling.description}
                                    amount={selling.amount}
                                    vatPercentage={selling.vatPercentage}
                                    pph23Percentage={selling.pph23Percentage}
                                    trigger={
                                        <Button size="sm" variant="outline">
                                            <IconPencil className="size-4" />
                                            Edit
                                        </Button>
                                    }
                                />
                            </div>
                        </SellingWriteGate>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <div className={cn(glassInset, "flex flex-col gap-2 px-5 py-4")}>
                            <p className="text-xs font-semibold tracking-[0.05em] text-muted-foreground uppercase">
                                Net amount
                            </p>
                            <p className="text-xl font-semibold tracking-tight text-foreground tabular-nums break-words sm:text-2xl">
                                {formatIdr(net)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                After VAT & PPH 23
                            </p>
                        </div>

                        <div className={cn(glassInset, "flex flex-col gap-2 px-5 py-4")}>
                            <p className="text-xs font-semibold tracking-[0.05em] text-muted-foreground uppercase">
                                Revenue
                            </p>
                            <p
                                className={cn(
                                    "flex items-center gap-2 text-xl font-semibold tracking-tight tabular-nums break-words sm:text-2xl",
                                    isProfitable
                                        ? "text-[var(--mli-on-success-container)]"
                                        : "text-[var(--mli-on-error-container)]"
                                )}
                            >
                                {isProfitable ? (
                                    <IconTrendingUp className="size-5 shrink-0" />
                                ) : (
                                    <IconTrendingDown className="size-5 shrink-0" />
                                )}
                                {formatIdr(revenue)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {marginPercent != null
                                    ? `${marginPercent.toFixed(1)}% of net`
                                    : "Net minus linked costings"}
                            </p>
                        </div>

                        <div className={cn(glassInset, "flex flex-col gap-2 px-5 py-4")}>
                            <p className="text-xs font-semibold tracking-[0.05em] text-muted-foreground uppercase">
                                Linked costings
                            </p>
                            <p className="text-xl font-semibold tracking-tight text-foreground tabular-nums sm:text-2xl">
                                {costings.length}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {formatIdr(totalFromCostings)} total cost
                            </p>
                        </div>

                        <div className={cn(glassInset, "flex flex-col gap-2 px-5 py-4")}>
                            <p className="text-xs font-semibold tracking-[0.05em] text-muted-foreground uppercase">
                                Tax rates
                            </p>
                            <p className="text-xl font-semibold tracking-tight text-foreground tabular-nums sm:text-2xl">
                                {vatPercentage}% / {pph23Percentage}%
                            </p>
                            <p className="text-xs text-muted-foreground">
                                VAT / PPH 23
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_22rem]">
                <div className="min-w-0 space-y-6">
                    <DashboardPageCard>
                        <SectionIntro
                            title="Selling details"
                            description="Core invoice fields and tax configuration for this selling."
                        />
                        <div className="grid gap-6 sm:grid-cols-2">
                            <OverviewField label="Selling number">
                                <span className={cn(brandText, "font-mono tracking-wide")}>
                                    {selling.sellingNumber}
                                </span>
                            </OverviewField>
                            <OverviewField label="Payment status">
                                <PaymentStatusChip paid={isPaid} />
                            </OverviewField>
                            <OverviewField label="VAT">
                                {vatPercentage !== 0 ? (
                                    `${vatPercentage}%`
                                ) : (
                                    <WarningChip>Not applicable</WarningChip>
                                )}
                            </OverviewField>
                            <OverviewField label="PPH 23">
                                {`${pph23Percentage}%`}
                            </OverviewField>
                            <OverviewField label="Description" className="sm:col-span-2">
                                {selling.description || "—"}
                            </OverviewField>
                        </div>
                    </DashboardPageCard>

                    <DashboardPageCard>
                        <SectionIntro
                            title="Linked shipment"
                            description="Connect this selling to the operational shipment it belongs to."
                            action={
                                <SellingWriteGate>
                                    <LinkSellingShipmentForm
                                        sellingId={sellingId}
                                        shipmentId={linkedShipmentId}
                                        trigger={
                                            <Button variant="outline" size="sm">
                                                <IconLink className="size-4" />
                                                {linkedShipmentId
                                                    ? "Change shipment"
                                                    : "Link shipment"}
                                            </Button>
                                        }
                                    />
                                </SellingWriteGate>
                            }
                        />
                        {linkedShipmentId ? (
                            <div
                                className={cn(
                                    glassInset,
                                    "flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                                )}
                            >
                                <div className="flex min-w-0 items-start gap-3">
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-[rgba(214,227,255,0.45)] text-[var(--mli-primary-container)]">
                                        <IconShip className="size-5" />
                                    </div>
                                    <div className="min-w-0 space-y-1">
                                        <p className="text-xs font-semibold tracking-[0.05em] text-muted-foreground uppercase">
                                            Shipment order
                                        </p>
                                        <Link
                                            href={`/dashboard/shipments/${linkedShipmentId}`}
                                            className={cn(brandLink, "font-mono text-base")}
                                        >
                                            {shipment?.orderNumber ?? "View shipment"}
                                        </Link>
                                        <p className="text-xs text-muted-foreground">
                                            Open linked shipment detail
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <EmptyState
                                icon={IconShip}
                                title="No shipment linked"
                                description="Link a shipment so this selling stays connected to the right job."
                                action={
                                    <SellingWriteGate>
                                        <LinkSellingShipmentForm
                                            sellingId={sellingId}
                                            shipmentId={undefined}
                                            trigger={
                                                <Button variant="outline" size="sm">
                                                    <IconLink className="size-4" />
                                                    Link shipment
                                                </Button>
                                            }
                                        />
                                    </SellingWriteGate>
                                }
                            />
                        )}
                    </DashboardPageCard>

                    <DashboardPageCard>
                        <SectionIntro
                            title="Linked costings"
                            description="Vendor charges applied against this selling. Revenue is net amount minus these costs."
                            action={
                                <SellingWriteGate>
                                    <LinkSellingCostingForm sellingId={sellingId} />
                                </SellingWriteGate>
                            }
                        />
                        {costings.length === 0 ? (
                            <EmptyState
                                icon={IconReceipt}
                                title="No costings linked"
                                description="Add vendor costings to track true revenue for this selling."
                                action={
                                    <SellingWriteGate>
                                        <LinkSellingCostingForm sellingId={sellingId} />
                                    </SellingWriteGate>
                                }
                            />
                        ) : (
                            <ul className="space-y-3">
                                {costings.map((costing) => {
                                    const amount = costingTotal(costing)
                                    return (
                                        <li
                                            key={costing.id}
                                            className={cn(
                                                glassInset,
                                                "flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                                            )}
                                        >
                                            <div className="flex min-w-0 items-start gap-3">
                                                <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-[rgba(214,227,255,0.45)] text-[var(--mli-primary-container)]">
                                                    <IconTags className="size-5" />
                                                </div>
                                                <div className="min-w-0 space-y-1">
                                                    <Link
                                                        href={`/dashboard/costings/${costing.id}`}
                                                        className={cn(
                                                            brandLink,
                                                            "font-mono text-sm tracking-wide"
                                                        )}
                                                    >
                                                        {costing.costingNumber}
                                                    </Link>
                                                    <p className="truncate text-sm text-foreground">
                                                        {costing.description}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {costing.vendor?.vendorName ??
                                                            "No vendor"}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex shrink-0 items-center justify-between gap-3 self-end sm:self-center sm:justify-end">
                                                <p className="text-sm font-semibold tabular-nums text-foreground">
                                                    {formatIdr(amount)}
                                                </p>
                                                <SellingWriteGate>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="text-[var(--mli-on-error-container)] hover:bg-[var(--mli-error-container)] hover:text-red-600"
                                                        disabled={updateCosting.isPending}
                                                        aria-label={`Unlink ${costing.costingNumber}`}
                                                        onClick={() => {
                                                            updateCosting.mutate(
                                                                {
                                                                    id: costing.id,
                                                                    costing: {
                                                                        sellingId: null,
                                                                    },
                                                                },
                                                                {
                                                                    onSuccess: () => {
                                                                        queryClient.invalidateQueries(
                                                                            {
                                                                                queryKey: [
                                                                                    "sellings",
                                                                                    sellingId,
                                                                                ],
                                                                            }
                                                                        )
                                                                        toast.success(
                                                                            "Costing unlinked"
                                                                        )
                                                                    },
                                                                    onError: (
                                                                        err: Error
                                                                    ) =>
                                                                        toast.error(
                                                                            err.message
                                                                        ),
                                                                }
                                                            )
                                                        }}
                                                    >
                                                        <IconLinkOff className="size-3.5" />
                                                    </Button>
                                                </SellingWriteGate>
                                            </div>
                                        </li>
                                    )
                                })}
                            </ul>
                        )}
                    </DashboardPageCard>
                </div>

                <aside className="lg:sticky lg:top-6">
                    <DashboardPageCard>
                        <SectionIntro
                            title="Amount summary"
                            description="How net selling and linked costs produce revenue."
                        />

                        <div
                            className={cn(
                                glassInset,
                                "mb-5 space-y-1 px-5 py-5 text-center"
                            )}
                        >
                            <p className="text-xs font-semibold tracking-[0.05em] text-muted-foreground uppercase">
                                Revenue
                            </p>
                            <p
                                className={cn(
                                    "text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl",
                                    isProfitable
                                        ? brandText
                                        : "text-[var(--mli-on-error-container)]"
                                )}
                            >
                                {formatIdr(revenue)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {isProfitable ? "Positive margin" : "Cost exceeds net"}
                            </p>
                        </div>

                        <div>
                            <SummaryRow
                                label="Gross selling amount"
                                value={formatIdr(gross)}
                            />
                            <SummaryRow
                                label="VAT"
                                value={
                                    vatPercentage !== 0 ? (
                                        `${vatPercentage}%`
                                    ) : (
                                        <WarningChip>Not applicable</WarningChip>
                                    )
                                }
                            />
                            <SummaryRow
                                label="PPH 23"
                                value={`${pph23Percentage}%`}
                            />
                            <SummaryRow
                                label="Net selling amount"
                                value={formatIdr(net)}
                            />
                            <SummaryRow
                                label="Linked costings"
                                value={formatIdr(totalFromCostings)}
                                muted={costings.length === 0}
                            />
                            <SummaryRow
                                label="Revenue"
                                value={
                                    <span
                                        className={
                                            isProfitable
                                                ? undefined
                                                : "text-[var(--mli-on-error-container)]"
                                        }
                                    >
                                        {formatIdr(revenue)}
                                    </span>
                                }
                                emphasize
                            />
                        </div>

                        {costings.length === 0 ? (
                            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                                <UnlinkedChip />
                                <span>Link costings to refine revenue.</span>
                            </div>
                        ) : null}
                    </DashboardPageCard>
                </aside>
            </div>
        </DashboardPage>
    )
}
