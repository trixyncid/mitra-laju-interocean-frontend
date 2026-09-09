export type FetchedAttachment = {
  url: string
  contentType?: string | null
  fileName?: string | null
}

/** True when the browser may safely preview this MIME type in a new tab. */
export function isInlinePreviewContentType(contentType?: string | null): boolean {
  if (!contentType) return false
  const normalized = contentType.split(";")[0]?.trim().toLowerCase() ?? ""
  if (normalized === "application/pdf") return true
  return normalized.startsWith("image/")
}

function downloadUrl(url: string, fileName?: string | null) {
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = fileName?.trim() || "download"
  anchor.rel = "noopener noreferrer"
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
}

/**
 * Open a URL fetched asynchronously without losing the user-gesture context.
 * Calling `window.open(url)` after `await` is often blocked in production browsers.
 *
 * Opens a blank tab synchronously on click, then navigates it once the URL resolves.
 */
export async function openFetchedUrl(
  fetchUrl: () => Promise<string | null | undefined>
): Promise<void> {
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

/** Preview PDFs/images inline; download other allowed attachment types. */
export async function openFetchedAttachment(
  fetchAttachment: () => Promise<FetchedAttachment | null | undefined>
): Promise<void> {
  const popup = window.open("about:blank", "_blank")

  try {
    const attachment = await fetchAttachment()

    if (!attachment?.url) {
      popup?.close()
      throw new Error("No file URL was returned.")
    }

    if (!isInlinePreviewContentType(attachment.contentType)) {
      popup?.close()
      downloadUrl(attachment.url, attachment.fileName)
      return
    }

    if (popup && !popup.closed) {
      popup.opener = null
      popup.location.replace(attachment.url)
      return
    }

    const anchor = document.createElement("a")
    anchor.href = attachment.url
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
