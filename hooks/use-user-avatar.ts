import { useQuery } from "@tanstack/react-query"

import { usersService } from "@/services/users.service"

export function useUserAvatarUrl(
  userId: string | undefined,
  hasAvatar: boolean,
  version?: string
) {
  return useQuery({
    queryKey: ["user-avatar", userId, version],
    queryFn: () => usersService.getAvatarUrl(userId!),
    enabled: !!userId && hasAvatar,
    staleTime: 0,
    select: (data) => data.url,
  })
}
