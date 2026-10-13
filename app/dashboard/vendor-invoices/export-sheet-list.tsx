import { IconTable } from "@tabler/icons-react"

/** "What's in the file": one line per sheet, so finance knows what they'll get. */
export function ExportSheetList({ sheets }: { sheets: { name: string; detail: string }[] }) {
  return (
    <div className="rounded-xl border border-border bg-muted/40 p-4">
      <p className="text-xs font-medium text-muted-foreground">What&apos;s in the Excel file</p>
      <ul className="mt-2 space-y-1.5">
        {sheets.map((sheet) => (
          <li key={sheet.name} className="flex gap-2 text-sm">
            <IconTable className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            <span>
              <span className="font-medium text-foreground">{sheet.name}</span>
              <span className="text-muted-foreground"> — {sheet.detail}</span>
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted-foreground">
        Amounts are real numbers and dates are real dates, so you can sum, filter and build a PivotTable.
      </p>
    </div>
  )
}
