import { DataTable } from "./selling-data-table"
import { columns, type CustomerSelling } from "./selling-column"

export default function SellingHistoryPage({
  customerSellings,
}: {
  customerSellings: CustomerSelling[]
}) {
  return (
    <div className="container mx-auto">
      <DataTable columns={columns} data={customerSellings} />
    </div>
  )
}
