import { redirect } from "next/navigation"

/** Costing lines are created from a dialog on the list; keep old links working. */
export default function NewCostingPage() {
  redirect("/dashboard/costings?new=1")
}
