# Mitra Laju Interocean — Frontend

Next.js dashboard for freight forwarding operations. Authentication uses [Better Auth](https://www.better-auth.com/) against the backend API (proxied from the browser). Business rules and API contracts are documented in [README-Backend.md](./README-Backend.md).

## Getting started

```bash
bun install
bun dev
```

Open [http://localhost:3000](http://localhost:3000). Set `NEXT_PUBLIC_BACKEND_URL` in `.env` to your API origin (see [README-Backend.md](./README-Backend.md)).

Other scripts: `bun run build`, `bun run lint`, `bun test lib/permissions.test.ts`.

## Project layout

| Area | Path |
|------|------|
| App routes | `app/dashboard/*` |
| Permission logic | `lib/permissions.ts`, `lib/role-home.ts` |
| Route guard | `components/dashboard-route-guard.tsx` |
| Sidebar filtering | `components/app-sidebar.tsx` |
| Write UI gates | `components/permission-gate.tsx`, `components/write-gates.tsx` |
| Session / login | `lib/auth-client.ts`, `components/forms/login-form.tsx` |
| API client | `lib/api-client.ts` |

## Roles & permissions

Permissions are loaded from the backend (`GET /me/permissions` and session `permissions` / `roleDetails`). The UI no longer hardcodes a role matrix.

- **Modules:** `DASHBOARD`, `CUSTOMER`, `VENDOR`, `PORT`, `VESSEL`, `SHIPMENT`, `COSTING`, `SELLING`, `USER`, `ROLE`
- **Actions:** `view` | `create` | `edit` | `delete`
- **System roles:** `admin` / `superadmin` always have full access and can manage roles at `/dashboard/roles`
- **Seeded roles** (`viewer`, `costing_admin`, `domestic_admin`, `export_admin`, `operational_admin`) keep prior behavior via DB seed

### Screen access

1. **Sidebar** — items shown when the user has `view` on that module (`components/app-sidebar.tsx`).
2. **Route guard** — redirects when `canAccessRoute` fails (`components/dashboard-route-guard.tsx`).
3. **Write gates** — `PermissionGate` / `*WriteGate` check create/edit/delete (or write-any) as needed.

**Profile** (`/dashboard/profile`) is available to every signed-in user. **Roles** (`/dashboard/roles`) is admin/superadmin only.

Landing path after login uses the first module the user can view (`lib/role-home.ts`), with admin → `/dashboard`.

### Shipment type limits

Each role may define `allowedShipmentTypes`. Empty = all types. Write UI uses `canWriteShipmentType`.

### Costing form dependencies

Roles that can write costings may load vendor/shipment/container lists for dropdowns even without master-data page access (`canReadVendorsForCosting`, etc.). API calls still require matching backend permissions.

## User accounts (`isActive`)

User management is gated by the `user` module (seeded for admin/superadmin). Users can be **deactivated** (`isActive: false`). Deactivation is a soft delete (sessions revoked on the backend).

## How to change permissions

1. Prefer **Admin → Role** in the UI (`/dashboard/roles`) to edit the permission matrix.
2. Or call the backend Roles API (`POST/PUT /roles`).
3. Run `bun test lib/permissions.test.ts` for helper smoke tests.
4. Keep this README and the backend README Authorization section in sync.

## Related docs

- [README-Backend.md](./README-Backend.md) — API endpoints, auth, backend role matrix, `isActive` behavior
- [DESIGN.md](./DESIGN.md) — UI tokens and layout conventions
