import { DataTable } from "./vendor-invoice-data-table"
import { columns } from "./vendor-invoice-column"
import { VendorInvoice } from "./vendor-invoice-column"

export default function VendorInvoiceHistoryPage({ vendorName, vendorVendorInvoices }: { vendorName: string, vendorVendorInvoices: VendorInvoice[] }) {
    return (
        <div className="container mx-auto">
            <h1 className="py-4">VendorInvoice History - {vendorName}</h1>
            <DataTable columns={columns} data={vendorVendorInvoices} />
        </div>
    )
}