"use client"

import { useCallback, useRef, useState } from "react"
import Cropper, { type Area } from "react-easy-crop"
import { IconCamera, IconTrash } from "@tabler/icons-react"
import { toast } from "sonner"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getCroppedImageBlob } from "@/lib/crop-image"
import { cn, getInitialContactName } from "@/lib/utils"
import { useRemoveAvatar, useUploadAvatar } from "@/hooks/use-profile"
import { useUserAvatarUrl } from "@/hooks/use-user-avatar"

type ProfileAvatarUploadProps = {
  userId: string
  name: string
  hasAvatar: boolean
  avatarVersion?: string
  /** "hero": just the photo with small camera and remove buttons on it, for page headers. */
  layout?: "stack" | "hero"
}

export function ProfileAvatarUpload({
  userId,
  name,
  hasAvatar,
  avatarVersion,
  layout = "stack",
}: ProfileAvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadAvatar = useUploadAvatar()
  const removeAvatar = useRemoveAvatar()
  const { data: avatarUrl } = useUserAvatarUrl(userId, hasAvatar, avatarVersion)

  const [cropOpen, setCropOpen] = useState(false)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  const resetCropState = useCallback(() => {
    setImageSrc(null)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPixels(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [])

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels)
  }, [])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be smaller than 10 MB")
      return
    }

    const reader = new FileReader()
    reader.addEventListener("load", () => {
      setImageSrc(reader.result as string)
      setCropOpen(true)
    })
    reader.readAsDataURL(file)
  }

  const handleCropSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return

    try {
      const blob = await getCroppedImageBlob(imageSrc, croppedAreaPixels)
      const file = new File([blob], "avatar.jpg", { type: "image/jpeg" })
      const formData = new FormData()
      formData.append("avatar", file)

      await uploadAvatar.mutateAsync({ id: userId, avatar: formData })
      setCropOpen(false)
      resetCropState()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload avatar")
    }
  }

  const handleRemove = () => {
    removeAvatar.mutate({ id: userId })
  }

  const isBusy = uploadAvatar.isPending || removeAvatar.isPending

  return (
    <>
      <div className={cn("flex flex-col items-center gap-4", layout === "hero" && "gap-0")}>
        <div className="relative">
          <Avatar
            className={cn(
              "size-28 rounded-full border-4 border-background shadow-ambient ring-1 ring-border",
              layout === "hero" && "size-24 border-card sm:size-28"
            )}
          >
            <AvatarImage
              key={avatarUrl ?? "no-avatar"}
              src={avatarUrl}
              alt={name}
              className="rounded-full object-cover"
            />
            <AvatarFallback className="rounded-full bg-primary text-3xl font-semibold text-primary-foreground">
              {getInitialContactName(name)}
            </AvatarFallback>
          </Avatar>
          <button
            type="button"
            disabled={isBusy}
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 flex size-10 cursor-pointer items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground shadow-md transition-transform hover:scale-105 disabled:opacity-50"
            aria-label="Change profile photo"
            title="Change photo"
          >
            <IconCamera className="size-4" />
          </button>
          {layout === "hero" && hasAvatar ? (
            <button
              type="button"
              disabled={isBusy}
              onClick={handleRemove}
              className="absolute -top-1 -right-1 flex size-8 cursor-pointer items-center justify-center rounded-full border-2 border-card bg-card text-[var(--mli-on-error-container)] shadow-md transition-transform hover:scale-105 disabled:opacity-50"
              aria-label="Remove profile photo"
              title="Remove photo"
            >
              <IconTrash className="size-3.5" />
            </button>
          ) : null}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className={cn("flex flex-wrap items-center justify-center gap-2", layout === "hero" && "hidden")}>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isBusy}
            onClick={() => fileInputRef.current?.click()}
          >
            Upload photo
          </Button>
          {hasAvatar ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isBusy}
              onClick={handleRemove}
              className="text-[var(--mli-on-error-container)] hover:text-[var(--mli-on-error-container)]"
            >
              <IconTrash className="size-4" />
              Remove
            </Button>
          ) : null}
        </div>
      </div>

      <Dialog
        open={cropOpen}
        onOpenChange={(open) => {
          setCropOpen(open)
          if (!open) resetCropState()
        }}
      >
        <DialogContent className="sm:max-w-md" showCloseButton>
          <DialogHeader>
            <DialogTitle>Crop your photo</DialogTitle>
            <DialogDescription>
              Drag to reposition and use the slider to zoom before saving.
            </DialogDescription>
          </DialogHeader>

          <div className="relative h-72 w-full overflow-hidden rounded-lg bg-muted">
            {imageSrc ? (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="avatar-zoom" className="text-xs font-medium text-muted-foreground">
              Zoom
            </label>
            <input
              id="avatar-zoom"
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-md bg-muted accent-primary"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCropOpen(false)
                resetCropState()
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!croppedAreaPixels || uploadAvatar.isPending}
              onClick={handleCropSave}
            >
              {uploadAvatar.isPending ? "Saving..." : "Save photo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
