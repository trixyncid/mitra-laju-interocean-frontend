/** Lines the server pulled into a sales job because they're linked to the one you added. */
export type AutoLinked = { costings: number; sellings: number }

const plural = (count: number, noun: string) => `${count} linked ${noun}${count === 1 ? "" : "s"}`

/** Toast description for auto-added lines, or undefined when nothing came along. */
export function autoLinkedNote(result: unknown) {
  const auto = (result as { autoLinked?: AutoLinked } | null | undefined)?.autoLinked
  if (!auto || (!auto.costings && !auto.sellings)) return undefined
  const parts = [auto.costings ? plural(auto.costings, "costing") : "", auto.sellings ? plural(auto.sellings, "selling") : ""]
  return `Also added ${parts.filter(Boolean).join(" and ")} to the sales job.`
}
