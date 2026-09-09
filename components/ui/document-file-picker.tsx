"use client"

import { useRef, useState, type DragEvent } from "react"
import {
  IconFile,
  IconFileSpreadsheet,
  IconFileText,
  IconFileTypePdf,
  IconPhoto,
  IconTrash,
  IconUpload,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Field, FieldContent, FieldDescription, FieldLabel } from "@/components/ui/field"
import { glassInset, metadataIconWell } from "@/lib/design"
import { cn } from "@/lib/utils"

export const DOCUMENT_ACCEPT =
  ".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.webp,.txt,.csv"

export const DOCUMENT_MAX_BYTES = 25 * 1024 * 1024

const ALLOWED_EXTENSIONS = new Set([
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".txt",
  ".csv",
])

function fileExtension(name: string) {
  const index = name.lastIndexOf(".")
  return index >= 0 ? name.slice(index).toLowerCase() : ""
}

export function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes < 0) return "—"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function validateDocumentFile(file: File): string | null {
  const extension = fileExtension(file.name)
  if (!ALLOWED_EXTENSIONS.has(extension)) {
    return "Use PDF, image, or office document files."
  }
  if (file.size > DOCUMENT_MAX_BYTES) {
    return "File must be smaller than 25 MB."
  }
  return null
}

function FileTypeIcon({ fileName }: { fileName: string }) {
  const extension = fileExtension(fileName)
  const className = "size-5"

  if (extension === ".pdf") return <IconFileTypePdf className={className} />
  if ([".png", ".jpg", ".jpeg", ".gif", ".webp"].includes(extension)) {
    return <IconPhoto className={className} />
  }
  if ([".xls", ".xlsx", ".csv"].includes(extension)) {
    return <IconFileSpreadsheet className={className} />
  }
  if ([".doc", ".docx", ".txt"].includes(extension)) {
    return <IconFileText className={className} />
  }
  return <IconFile className={className} />
}

export function DocumentFilePicker({
  id,
  label = "Document File",
  required,
  value,
  error,
  description = "PDF, Word, Excel, images, TXT, or CSV · up to 25 MB",
  onChange,
  onInvalid,
}: {
  id?: string
  label?: string
  required?: boolean
  value: File | null
  error?: string
  description?: string
  onChange: (file: File | null) => void
  onInvalid?: (message: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const inputId = id ?? "document-file"
  const hasError = Boolean(error)

  const applyFile = (file: File | null | undefined) => {
    if (!file) return
    const message = validateDocumentFile(file)
    if (message) {
      onInvalid?.(message)
      if (inputRef.current) inputRef.current.value = ""
      return
    }
    onChange(file)
  }

  const clearFile = () => {
    onChange(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  const onDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragging(true)
  }

  const onDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return
    setIsDragging(false)
  }

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragging(false)
    applyFile(event.dataTransfer.files?.[0])
  }

  return (
    <Field data-invalid={hasError || undefined}>
      <FieldLabel htmlFor={inputId} className="cursor-default" required={required}>
        {label}
      </FieldLabel>
      <FieldContent>
        <input
          ref={inputRef}
          id={inputId}
          name={inputId}
          type="file"
          accept={DOCUMENT_ACCEPT}
          className="sr-only"
          aria-invalid={hasError || undefined}
          aria-required={required || undefined}
          onChange={(event) => {
            applyFile(event.target.files?.[0])
          }}
        />

        {value ? (
          <div
            className={cn(
              glassInset,
              "flex items-start gap-3 p-3.5 transition-[border-color,background-color] duration-150",
              hasError && "border-[var(--mli-error-container)]/70"
            )}
          >
            <div className={metadataIconWell} aria-hidden>
              <FileTypeIcon fileName={value.name} />
            </div>
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="truncate text-sm font-medium text-foreground" title={value.name}>
                {value.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(value.size)}
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => inputRef.current?.click()}
                >
                  Replace file
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearFile}
                  className="text-[var(--mli-on-error-container)] hover:text-[var(--mli-on-error-container)]"
                >
                  <IconTrash className="size-3.5" />
                  Remove
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault()
                inputRef.current?.click()
              }
            }}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            aria-label="Choose a document file"
            className={cn(
              "group relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-4 py-8 text-center transition-[border-color,background-color,box-shadow] duration-150 outline-none",
              "border-[rgba(214,227,255,0.75)] bg-[rgba(247,249,251,0.45)]",
              "hover:border-[var(--mli-primary-container)]/45 hover:bg-[rgba(247,249,251,0.75)]",
              "focus-visible:ring-[3px] focus-visible:ring-ring/20",
              isDragging &&
                "border-[var(--mli-primary-container)] bg-[rgba(214,227,255,0.45)] shadow-[inset_0_0_0_1px_rgba(27,54,93,0.08)]",
              hasError && "border-[var(--mli-error-container)]/80 bg-[rgba(255,236,236,0.35)]"
            )}
          >
            <div
              className={cn(
                metadataIconWell,
                "size-11 transition-transform duration-150 group-hover:scale-105",
                isDragging && "bg-[var(--mli-primary-container)] text-primary-foreground"
              )}
              aria-hidden
            >
              <IconUpload className="size-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                {isDragging ? "Drop file to upload" : "Drop a file here, or browse"}
              </p>
              <p className="text-xs text-muted-foreground">
                Click to choose from your computer
              </p>
            </div>
            <span className="rounded-md border border-[rgba(214,227,255,0.65)] bg-[rgba(247,249,251,0.85)] px-2.5 py-1 text-[11px] font-medium text-[var(--mli-primary-container)]">
              Browse files
            </span>
          </div>
        )}

        {hasError ? (
          <em
            role="alert"
            className="text-xs not-italic text-[var(--mli-on-error-container)]"
          >
            {error}
          </em>
        ) : description ? (
          <FieldDescription>{description}</FieldDescription>
        ) : null}
      </FieldContent>
    </Field>
  )
}
