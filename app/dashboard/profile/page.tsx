"use client"

import { IconCalendar, IconLock, IconMail, IconUser } from "@tabler/icons-react"

import { ProfileDetailsForm, ProfilePasswordForm } from "@/components/forms/profile-form"
import ErrorPage from "@/components/error-page"
import TableSkeleton from "@/components/loading/table-skeleton"
import { ProfileAvatarUpload } from "@/components/profile-avatar-upload"
import { RoleChip } from "@/components/ui/role-chip"
import { DashboardPage, DashboardPageCard } from "@/components/layout/dashboard-page"
import { authClient } from "@/lib/auth-client"
import { useUserProfile } from "@/hooks/use-profile"
import { localDate } from "@/lib/utils"

const SECTIONS = [
  { id: "details", label: "My details", hint: "Name and email", icon: IconUser },
  { id: "password", label: "Password", hint: "Change how you sign in", icon: IconLock },
]

/** Soft wave lines for the banner. */
function Waves() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 600 120"
      preserveAspectRatio="none"
      className="absolute inset-0 size-full text-white/15"
    >
      {[30, 55, 80, 105].map((y, index) => (
        <path
          key={y}
          d={`M0 ${y} C 100 ${y - 18}, 200 ${y + 18}, 300 ${y} S 500 ${y - 18}, 600 ${y}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={index % 2 ? 1 : 1.5}
        />
      ))}
    </svg>
  )
}

function Section({
  id,
  icon: Icon,
  title,
  text,
  children,
}: {
  id: string
  icon: typeof IconUser
  title: string
  text: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="surface scroll-mt-24 rounded-3xl p-5 sm:p-7">
      <div className="mb-6 flex items-start gap-3">
        <span className="surface-inset flex size-10 shrink-0 items-center justify-center rounded-xl text-primary">
          <Icon className="size-5" />
        </span>
        <div>
          <h2 className="text-headline-md font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">{text}</p>
        </div>
      </div>
      {children}
    </section>
  )
}

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
    return <ErrorPage title="Profile not found" message="We could not load your profile." />
  }

  const firstName = user.name.trim().split(/\s+/)[0]

  return (
    <DashboardPage>
      <header className="surface relative mb-6 overflow-hidden rounded-3xl lg:mb-8">
        <div className="brand-fill relative h-32 sm:h-40">
          <Waves />
          <p className="relative px-5 pt-5 text-sm font-medium text-primary-foreground/85 sm:px-7 sm:pt-6">
            My account
          </p>
        </div>
        <div className="flex flex-col gap-3 px-5 pb-6 sm:flex-row sm:items-start sm:gap-6 sm:px-7">
          {/* Only the photo overlaps the banner; the text sits below it. */}
          <div className="relative z-10 -mt-12 self-start sm:-mt-14">
            <ProfileAvatarUpload
              userId={user.id}
              name={user.name}
              hasAvatar={!!user.image}
              avatarVersion={user.updatedAt}
              layout="hero"
            />
          </div>
          <div className="min-w-0 flex-1 space-y-2 sm:pt-4">
            <h1 className="truncate text-headline-lg">Hi, {firstName}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <span className="flex min-w-0 items-center gap-1.5">
                <IconMail className="size-4 shrink-0" />
                <span className="truncate">{user.email}</span>
              </span>
              {user.createdAt ? (
                <span className="flex items-center gap-1.5">
                  <IconCalendar className="size-4 shrink-0" />
                  Joined {localDate(user.createdAt)}
                </span>
              ) : null}
              <RoleChip role={user.roleRef?.name ?? user.role} />
            </div>
          </div>
        </div>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <nav aria-label="Account sections" className="lg:sticky lg:top-24">
          <ul className="flex gap-2 overflow-x-auto lg:flex-col">
            {SECTIONS.map((section) => (
              <li key={section.id} className="shrink-0 lg:shrink">
                <a
                  href={`#${section.id}`}
                  className="surface flex items-center gap-3 rounded-2xl px-4 py-3 transition-colors hover:bg-muted"
                >
                  <section.icon className="size-5 shrink-0 text-primary" />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-foreground">{section.label}</span>
                    <span className="hidden text-xs text-muted-foreground lg:block">{section.hint}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-4 hidden px-1 text-xs text-muted-foreground lg:block">
            To change your photo, press the camera on your picture. Your role is set by an
            administrator.
          </p>
        </nav>

        <div className="space-y-6">
          <Section
            id="details"
            icon={IconUser}
            title="My details"
            text="This is how your name shows to the team."
          >
            <ProfileDetailsForm user={user} />
          </Section>
          <Section
            id="password"
            icon={IconLock}
            title="Password"
            text="Type your current password first, then choose a new one of at least 8 characters."
          >
            <div className="grid gap-8 lg:grid-cols-[minmax(0,28rem)_minmax(0,1fr)]">
              <ProfilePasswordForm user={user} />
              <div className="surface-inset h-fit rounded-2xl p-4 text-sm text-muted-foreground">
                <p className="mb-2 font-medium text-foreground">A strong password</p>
                <ul className="space-y-1.5">
                  <li>• Has 12 or more characters</li>
                  <li>• Mixes big and small letters</li>
                  <li>• Has a number and a symbol, like ! or #</li>
                  <li>• Is not used on other websites</li>
                </ul>
              </div>
            </div>
          </Section>
        </div>
      </div>
    </DashboardPage>
  )
}
