/** Whether a sidebar href matches the current pathname (including detail routes). */
export function isSidebarNavActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard"
  }
  return pathname === href || pathname.startsWith(`${href}/`)
}
