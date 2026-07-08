"use client"

import ProfileForm from "@/components/forms/profile-form"
import ErrorPage from "@/components/error-page"
import TableSkeleton from "@/components/loading/table-skeleton"
import { ProfileMetadataCard } from "@/components/profile-metadata-card"
import {
  DashboardPage,
  DashboardPageCard,
  DashboardPageHeader,
} from "@/components/layout/dashboard-page"
import { authClient } from "@/lib/auth-client"
import { useUserProfile } from "@/hooks/use-profile"

export default function ProfilePage() {
  const { data: session, isPending: isSessionPending } = authClient.useSession()
  const userId = session?.user?.id

  const { data: user, isLoading, error } = useUserProfile(userId)

  if (isSessionPending || isLoading) {
    return (
      <DashboardPage>
        <DashboardPageCard>
          <TableSkeleton />
        </DashboardPageCard>
      </DashboardPage>
    )
  }

  if (error) {
    return <ErrorPage message={error.message} />
  }

  if (!user) {
    return <ErrorPage title="Profile not found" message="Unable to load your profile." />
  }

  return (
    <DashboardPage>
      <DashboardPageHeader
        title="My Profile"
        description="Manage your account details, profile photo, and password."
      />
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(280px,360px)_1fr]">
        <aside className="lg:sticky lg:top-6">
          <ProfileMetadataCard user={user} />
        </aside>
        <DashboardPageCard>
          <ProfileForm user={user} />
        </DashboardPageCard>
      </div>
    </DashboardPage>
  )
}
