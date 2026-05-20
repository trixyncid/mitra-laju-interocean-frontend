"use client"

import ProfileForm from "@/components/forms/profile-form"
import ErrorPage from "@/components/error-page"
import TableSkeleton from "@/components/loading/table-skeleton"
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
        description="Manage your account details and password."
      />
      <DashboardPageCard>
        <ProfileForm user={user} />
      </DashboardPageCard>
    </DashboardPage>
  )
}
