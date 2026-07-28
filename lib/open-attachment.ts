/**
 * Open a URL fetched asynchronously without losing the user-gesture context.
 * Calling `window.open(url)` after `await` is often blocked in production browsers.
 *
 * Opens a blank tab synchronously on click, then navigates it once the URL resolves.
 */
export async function openFetchedUrl(
  fetchUrl: () => Promise<string | null | undefined>
): Promise<void> {
  // Do not pass "noopener" here — it makes window.open return null in modern browsers.
  const popup = window.open("about:blank", "_blank")

  try {
    const url = await fetchUrl()

    if (!url) {
      popup?.close()
      throw new Error("No file URL was returned.")
    }

    if (popup && !popup.closed) {
      popup.opener = null
      popup.location.replace(url)
      return
    }

    // Fallback when the blank tab was blocked.
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.target = "_blank"
    anchor.rel = "noopener noreferrer"
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
  } catch (error) {
    popup?.close()
    throw error
  }
}
