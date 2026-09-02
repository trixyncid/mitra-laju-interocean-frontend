"use client"

import { use } from "react"
import Link from "next/link"
import {
    IconArrowLeft,
    IconBox,
    IconBuildingStore,
    IconEye,
    IconFile,
    IconLinkOff,
    IconPencil,
    IconReceipt,
    IconShip,
    IconTags,
} from "@tabler/icons-react"
import { Dot } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import DocumentUploadForm from "@/components/forms/document-upload-form"
import CostingForm from "@/components/forms/costing-form"
import { useCostingById, useUpdateCosting } from "@/hooks/use-costings"
import type { CostingAttachment } from "@/app/dashboard/costings/columns"
import { amountCalculation, cn, localDate } from "@/lib/utils"
import { costingCurrencyRequiresRate } from "@/lib/costing-currencies"
import { costingService } from "@/services/costing.service"
import CostingLoading from "@/components/loading/costing-loading"
import { DashboardPage, DashboardPageCard } from "@/components/layout/dashboard-page"
import { CostingWriteGate } from "@/components/write-gates"
import ErrorPage from "@/components/error-page"
import { PaymentStatusChip, UnlinkedChip, WarningChip } from "@/components/ui/status-chip"
import {
    brandLink,
    brandText,
    glassInset,
    glassPanel,
    glassShine,
} from "@/lib/design"

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
}: {
    label: string
    value: React.ReactNode
    muted?: boolean
}) {
    return (
        <div className="flex items-start justify-between gap-4 border-b border-[rgba(214,227,255,0.35)] py-3 last:border-b-0">
            <p className="text-sm text-muted-foreground">{label}</p>
            <div
                className={cn(
                    "text-right text-sm font-medium tabular-nums",
                    muted ? "text-muted-foreground" : "text-foreground"
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

export default function CostingDetailPage({
    params,
}: {
    params: Promise<{ costingId: string }>
}) {
    const { costingId } = use(params)
    const updateCosting = useUpdateCosting()
    const { data: costing, isLoading, error } = useCostingById(costingId)

    if (isLoading) return <CostingLoading />
    if (error) return <ErrorPage message={error.message} />
    if (!costing) {
        return (
            <ErrorPage
                title="Costing not found"
                message="Unable to load this costing."
            />
        )
    }

    const attachments = costing.costingsAttachments ?? []
    const price = Number(costing.price) || 0
    const currencyCode = costing.currencyCode ?? "IDR"
    const currency =
        Number(costing.currency) || (currencyCode === "IDR" ? 1 : 0)
    const vatPercentage = Number(costing.vatPercentage) || 0
    const pph23Percentage = Number(costing.pph23Percentage) || 0
    const netAmount = amountCalculation(
        price,
        currency,
        vatPercentage,
        pph23Percentage
    )
    const updatedByName = costing.updatedBy?.name
    const isPaid = costing.status === "PAID"
    const shipment = costing.shipment
    const selling = costing.selling

    return (
        <DashboardPage atmosphere>
            <div className="mb-6">
                <Button asChild variant="ghost" className="text-muted-foreground">
                    <Link href="/dashboard/costings">
                        <IconArrowLeft className="size-5" />
                        Back to costings
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
                                <IconReceipt className="size-8 text-[var(--mli-primary-container)] sm:size-9" />
                            </div>

                            <div className="min-w-0 space-y-3">
                                <div className="space-y-2">
                                    <div className="flex flex-wrap items-center gap-2.5">
                                        <h1 className="text-headline-lg tracking-tight">
                                            {costing.costingNumber}
                                        </h1>
                                        <PaymentStatusChip paid={isPaid} />
                                    </div>
                                    <p
                                        className={cn(
                                            "font-mono text-sm font-medium tracking-wide",
                                            brandText
                                        )}
                                    >
                                        {costing.vendor?.vendorName ?? "No vendor"}
                                    </p>
                                </div>

                                <p className="max-w-2xl text-sm text-muted-foreground">
                                    {costing.description}
                                </p>

                                <p className="flex flex-wrap items-center gap-x-1 text-sm text-muted-foreground">
                                    <span>
                                        Updated{" "}
                                        {costing.updatedAt
                                            ? localDate(costing.updatedAt)
                                            : "—"}
                                        {updatedByName ? ` by ${updatedByName}` : ""}
                                    </span>
                                    {costing.createdAt ? (
                                        <>
                                            <Dot className="hidden size-4 sm:inline" />
                                            <span>
                                                Created {localDate(costing.createdAt)}
                                            </span>
                                        </>
                                    ) : null}
                                </p>
                            </div>
                        </div>

                        <CostingWriteGate>
                            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                                <Button
                                    size="sm"
                                    variant={isPaid ? "outline" : "default"}
                                    onClick={() => {
                                        updateCosting.mutate(
                                            {
                                                id: costingId,
                                                costing: {
                                                    status: isPaid ? "UNPAID" : "PAID",
                                                },
                                            },
                                            {
                                                onSuccess: () => {
                                                    toast.success(
                                                        isPaid
                                                            ? "Costing marked as unpaid"
                                                            : "Costing marked as paid"
                                                    )
                                                },
                                                onError: (err: Error) =>
                                                    toast.error(err.message),
                                            }
                                        )
                                    }}
                                    disabled={updateCosting.isPending}
                                >
                                    {updateCosting.isPending
                                        ? "Updating..."
                                        : isPaid
                                          ? "Mark as Unpaid"
                                          : "Mark as Paid"}
                                </Button>
                                <CostingForm
                                    mode="edit"
                                    id={costing.id}
                                    costingNumber={costing.costingNumber}
                                    description={costing.description}
                                    price={price}
                                    currencyCode={currencyCode}
                                    currency={currency}
                                    containerNumber={
                                        costing.containerNumber ?? undefined
                                    }
                                    vatPercentage={vatPercentage}
                                    pph23Percentage={pph23Percentage}
                                    vendorInvoiceNumber={costing.vendorInvoiceNumber}
                                    vendorId={costing.vendorId}
                                    shipmentId={shipment?.id ?? null}
                                    trigger={
                                        <Button size="sm" variant="outline">
                                            <IconPencil className="size-4" />
                                            Edit
                                        </Button>
                                    }
                                />
                            </div>
                        </CostingWriteGate>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <div className={cn(glassInset, "flex flex-col gap-2 px-5 py-4")}>
                            <p className="text-xs font-semibold tracking-[0.05em] text-muted-foreground uppercase">
                                Net amount
                            </p>
                            <p className="text-xl font-semibold tracking-tight text-foreground tabular-nums break-words sm:text-2xl">
                                {formatIdr(netAmount)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                After VAT & PPH 23
                            </p>
                        </div>
                        <div className={cn(glassInset, "flex flex-col gap-2 px-5 py-4")}>
                            <p className="text-xs font-semibold tracking-[0.05em] text-muted-foreground uppercase">
                                Currency
                            </p>
                            <p className="text-xl font-semibold tracking-tight text-foreground tabular-nums sm:text-2xl">
                                {currencyCode}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {price.toLocaleString("id-ID")} {currencyCode}
                            </p>
                        </div>
                        <div className={cn(glassInset, "flex flex-col gap-2 px-5 py-4")}>
                            <p className="text-xs font-semibold tracking-[0.05em] text-muted-foreground uppercase">
                                Container
                            </p>
                            <p className="text-xl font-semibold tracking-tight text-foreground break-words sm:text-2xl">
                                {costing.containerNumber || "—"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Assigned container
                            </p>
                        </div>
                        <div className={cn(glassInset, "flex flex-col gap-2 px-5 py-4")}>
                            <p className="text-xs font-semibold tracking-[0.05em] text-muted-foreground uppercase">
                                Documents
                            </p>
                            <p className="text-xl font-semibold tracking-tight text-foreground tabular-nums sm:text-2xl">
                                {attachments.length}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Supporting files
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_22rem]">
                <div className="min-w-0 space-y-6">
                    <DashboardPageCard>
                        <SectionIntro
                            title="Costing details"
                            description="Vendor invoice reference and operational context for this charge."
                        />
                        <div className="grid gap-6 sm:grid-cols-2">
                            <OverviewField label="Vendor">
                                <span className="inline-flex items-center gap-2">
                                    <IconBuildingStore className="size-4 shrink-0 text-[var(--mli-primary-container)]" />
                                    {costing.vendor?.vendorName ?? "—"}
                                </span>
                            </OverviewField>
                            <OverviewField label="Vendor invoice">
                                {costing.vendorInvoiceNumber || "—"}
                            </OverviewField>
                            <OverviewField label="Container number">
                                {costing.containerNumber ? (
                                    <span className="inline-flex items-center gap-2 font-mono tracking-wide">
                                        <IconBox className="size-4 shrink-0 text-[var(--mli-primary-container)]" />
                                        {costing.containerNumber}
                                    </span>
                                ) : (
                                    <WarningChip>Not set</WarningChip>
                                )}
                            </OverviewField>
                            <OverviewField label="Description" className="sm:col-span-2">
                                {costing.description || "—"}
                            </OverviewField>
                        </div>
                    </DashboardPageCard>

                    <DashboardPageCard>
                        <SectionIntro
                            title="Linked records"
                            description="Shipment and selling associations for this costing."
                        />
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className={cn(glassInset, "space-y-3 p-4")}>
                                <div className="flex items-center gap-2 text-[var(--mli-primary-container)]">
                                    <IconShip className="size-4" />
                                    <p className="text-xs font-semibold tracking-[0.05em] uppercase">
                                        Shipment
                                    </p>
                                </div>
                                {shipment?.id ? (
                                    <div className="space-y-1">
                                        <Link
                                            href={`/dashboard/shipments/${shipment.id}`}
                                            className={cn(brandLink, "font-mono text-base")}
                                        >
                                            {shipment.orderNumber ?? "View shipment"}
                                        </Link>
                                        <p className="text-xs text-muted-foreground">
                                            Open linked shipment detail
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <UnlinkedChip />
                                        <IconLinkOff className="size-3.5" />
                                        <span>Not linked</span>
                                    </div>
                                )}
                            </div>

                            <div className={cn(glassInset, "space-y-3 p-4")}>
                                <div className="flex items-center gap-2 text-[var(--mli-primary-container)]">
                                    <IconTags className="size-4" />
                                    <p className="text-xs font-semibold tracking-[0.05em] uppercase">
                                        Selling
                                    </p>
                                </div>
                                {selling?.id ? (
                                    <div className="space-y-1">
                                        <Link
                                            href={`/dashboard/sellings/${selling.id}`}
                                            className={cn(brandLink, "font-mono text-base")}
                                        >
                                            {selling.sellingNumber}
                                        </Link>
                                        <p className="text-xs text-muted-foreground">
                                            Open linked selling detail
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <UnlinkedChip />
                                        <IconLinkOff className="size-3.5" />
                                        <span>Not linked</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </DashboardPageCard>

                    <DashboardPageCard>
                        <SectionIntro
                            title="Supporting documents"
                            description="Invoices and files attached to this costing."
                            action={
                                <CostingWriteGate>
                                    <DocumentUploadForm
                                        mode="create"
                                        module="costing"
                                        shipmentId={undefined}
                                        costingId={costingId}
                                        id={undefined}
                                        attachmentName={undefined}
                                        document={undefined}
                                    />
                                </CostingWriteGate>
                            }
                        />
                        {attachments.length === 0 ? (
                            <EmptyState
                                icon={IconFile}
                                title="No documents yet"
                                description="Upload vendor invoices or supporting files for this costing."
                                action={
                                    <CostingWriteGate>
                                        <DocumentUploadForm
                                            mode="create"
                                            module="costing"
                                            shipmentId={undefined}
                                            costingId={costingId}
                                            id={undefined}
                                            attachmentName={undefined}
                                            document={undefined}
                                        />
                                    </CostingWriteGate>
                                }
                            />
                        ) : (
                            <ul className="space-y-3">
                                {attachments.map((attachment: CostingAttachment) => (
                                    <li
                                        key={attachment.id}
                                        className={cn(
                                            glassInset,
                                            "flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                                        )}
                                    >
                                        <div className="flex min-w-0 items-start gap-3">
                                            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-[rgba(214,227,255,0.45)] text-[var(--mli-primary-container)]">
                                                <IconFile className="size-5" />
                                            </div>
                                            <div className="min-w-0 space-y-1">
                                                <p className="truncate font-medium text-foreground">
                                                    {attachment.attachmentName}
                                                </p>
                                                <p className="truncate text-xs text-muted-foreground">
                                                    {attachment.fileName}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Updated{" "}
                                                    {localDate(attachment.updatedAt)}
                                                    {attachment.updatedBy?.name
                                                        ? ` by ${attachment.updatedBy.name}`
                                                        : ""}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => {
                                                    void costingService
                                                        .viewCostingAttachment(
                                                            costingId,
                                                            attachment.id
                                                        )
                                                        .catch((err: unknown) => {
                                                            toast.error(
                                                                err instanceof Error
                                                                    ? err.message
                                                                    : "Unable to open attachment"
                                                            )
                                                        })
                                                }}
                                            >
                                                <IconEye className="size-4 text-muted-foreground" />
                                            </Button>
                                            <CostingWriteGate>
                                                <DocumentUploadForm
                                                    mode="edit"
                                                    module="costing"
                                                    shipmentId={undefined}
                                                    costingId={costingId}
                                                    id={attachment.id}
                                                    attachmentName={
                                                        attachment.attachmentName
                                                    }
                                                    document={undefined}
                                                />
                                            </CostingWriteGate>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </DashboardPageCard>
                </div>

                <aside className="lg:sticky lg:top-6">
                    <DashboardPageCard>
                        <SectionIntro
                            title="Amount summary"
                            description="Breakdown used to calculate the net IDR amount."
                        />

                        <div
                            className={cn(
                                glassInset,
                                "mb-5 space-y-1 px-5 py-5 text-center"
                            )}
                        >
                            <p className="text-xs font-semibold tracking-[0.05em] text-muted-foreground uppercase">
                                Total cost
                            </p>
                            <p
                                className={cn(
                                    "text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl",
                                    brandText
                                )}
                            >
                                {formatIdr(netAmount)}
                            </p>
                        </div>

                        <div>
                            <SummaryRow label="Currency" value={currencyCode} />
                            <SummaryRow
                                label={`Price (${currencyCode})`}
                                value={price.toLocaleString("id-ID")}
                            />
                            {costingCurrencyRequiresRate(currencyCode) ? (
                                <SummaryRow
                                    label="Exchange rate"
                                    value={currency.toLocaleString("id-ID")}
                                />
                            ) : null}
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
                        </div>
                    </DashboardPageCard>
                </aside>
            </div>
        </DashboardPage>
    )
}
