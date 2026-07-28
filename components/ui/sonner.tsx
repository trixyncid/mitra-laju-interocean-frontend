"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      richColors
      closeButton
      visibleToasts={4}
      gap={12}
      offset={16}
      duration={4000}
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:border group-[.toaster]:shadow-[0_12px_40px_rgba(27,54,93,0.12)] group-[.toaster]:backdrop-blur-xl",
          title: "group-[.toast]:text-sm group-[.toast]:font-semibold group-[.toast]:tracking-tight",
          description: "group-[.toast]:text-xs group-[.toast]:leading-5",
          actionButton:
            "group-[.toast]:rounded-md group-[.toast]:bg-[var(--mli-primary-container)] group-[.toast]:text-primary-foreground group-[.toast]:text-xs group-[.toast]:font-semibold",
          cancelButton:
            "group-[.toast]:rounded-md group-[.toast]:bg-[rgba(247,249,251,0.85)] group-[.toast]:text-muted-foreground group-[.toast]:text-xs",
          closeButton:
            "group-[.toast]:border-[rgba(214,227,255,0.55)] group-[.toast]:bg-[rgba(247,249,251,0.95)] group-[.toast]:text-muted-foreground",
        },
      }}
      style={
        {
          "--normal-bg": "rgba(232, 238, 246, 0.94)",
          "--normal-bg-hover": "rgba(238, 243, 249, 0.98)",
          "--normal-text": "var(--foreground)",
          "--normal-border": "rgba(214, 227, 255, 0.65)",
          "--success-bg": "rgba(209, 247, 217, 0.92)",
          "--success-border": "rgba(13, 92, 46, 0.22)",
          "--success-text": "var(--mli-on-success-container)",
          "--info-bg": "rgba(214, 227, 255, 0.88)",
          "--info-border": "rgba(27, 54, 93, 0.22)",
          "--info-text": "var(--mli-primary-container)",
          "--warning-bg": "rgba(232, 238, 246, 0.96)",
          "--warning-border": "rgba(46, 71, 111, 0.28)",
          "--warning-text": "var(--mli-on-warning-container)",
          "--error-bg": "rgba(255, 218, 214, 0.92)",
          "--error-border": "rgba(147, 0, 10, 0.22)",
          "--error-text": "var(--mli-on-error-container)",
          "--border-radius": "0.75rem",
          "--width": "356px",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
