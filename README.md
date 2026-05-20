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

## Roles

The session user carries a `role` string. Legacy `"user"` is treated as `viewer`. Missing role defaults to `viewer`.

| Role | Description |
|------|-------------|
| `viewer` | Read-only on shipments, costings, and sellings |
| `costing_admin` | Full CRUD on costings only |
| `domestic_admin` | Shipments (DOMESTIC) + costings read/write |
| `export_admin` | Shipments (EXPORT) + costings read/write |
| `operational_admin` | Shipments (all types) + costings read/write |
| `admin` | Full access |
| `superadmin` | Full access |

## Screen access (sidebar & routes)

Access is enforced in two places:

1. **Sidebar** — nav items hidden when `canRead(role, resource)` is false (`components/app-sidebar.tsx`).
2. **Route guard** — direct URL visits redirect to the role home path when `canAccessRoute` fails (`components/dashboard-route-guard.tsx`).

**Profile** (`/dashboard/profile`) is available to every signed-in user.

### Navigation visibility

| Screen / route | viewer | costing_admin | domestic_admin | export_admin | operational_admin | admin / superadmin |
|----------------|:------:|:-------------:|:--------------:|:------------:|:-----------------:|:------------------:|
| **Dashboard** (`/dashboard`) — analytics KPIs & charts | — | — | — | — | — | ✓ |
| **Customers** (`/dashboard/customers`) | — | — | — | — | — | ✓ |
| **Vendors** (`/dashboard/vendors`) | — | — | — | — | — | ✓ |
| **Ports** (`/dashboard/ports`) | — | — | — | — | — | ✓ |
| **Vessels** (`/dashboard/vessels`) | — | — | — | — | — | ✓ |
| **Shipments** (`/dashboard/shipments`) | ✓ read | — | ✓ | ✓ | ✓ | ✓ |
| **Costings** (`/dashboard/costings`) | ✓ read | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Sellings** (`/dashboard/sellings`) | ✓ read | — | — | — | — | ✓ |
| **Users** (`/dashboard/users`) — Admin Panel | — | — | — | — | — | ✓ |
| **Profile** (`/dashboard/profile`) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

✓ = visible in sidebar and routable. — = hidden; visiting the URL redirects to the role home page.

Detail routes (e.g. `/dashboard/shipments/[id]`, `/dashboard/costings/[id]`) inherit the parent resource permission.

### Login landing page

After sign-in, users are sent to their role home (`lib/role-home.ts`):

| Role | Landing path |
|------|----------------|
| `admin`, `superadmin` | `/dashboard` |
| `viewer` | `/dashboard/shipments` |
| `costing_admin` | `/dashboard/costings` |
| `domestic_admin`, `export_admin`, `operational_admin` | `/dashboard/shipments` |

## Write access (buttons & forms)

Read access controls pages; **write** access controls create/edit/delete actions via `PermissionGate`, `*WriteGate` components, and action cells.

| Resource | viewer | costing_admin | domestic_admin | export_admin | operational_admin | admin / superadmin |
|----------|:------:|:-------------:|:--------------:|:------------:|:-----------------:|:------------------:|
| Master data (customers, vendors, ports, vessels) | — | — | — | — | — | ✓ |
| Shipments (booking record) | — | — | ✓* | ✓* | ✓ | ✓ |
| Shipment operational, containers, attachments | — | — | ✓* | ✓* | ✓ | ✓ |
| Costings | — | ✓ | ✓ | ✓ | ✓ | ✓ |
| Sellings | — | — | — | — | — | ✓ |
| Users | — | — | — | — | — | ✓ |

\*Shipment operational **write** is limited by `shipmentType` on the operational record (see below).

### Shipment type limits (operational write)

When editing shipment operationals, containers, or attachments, write UI is gated by `canWriteShipmentType(role, shipmentType)`:

| Role | Allowed `shipmentType` values |
|------|------------------------------|
| `domestic_admin` | `DOMESTIC` only |
| `export_admin` | `EXPORT` only |
| `operational_admin` | `EXPORT`, `IMPORT`, `DOMESTIC` |
| `admin`, `superadmin` | All types |
| `viewer`, `costing_admin` | No shipment write |

Creating a new operational on a shipment without a type yet is allowed when the role has general shipment write (`canWrite("shipments")`).

### Costing form dependencies

Roles that can write costings may load vendor/shipment/container lists for dropdowns even without master-data page access (`canReadVendorsForCosting`, `canReadShipmentsForCosting`, `canReadContainers` in `lib/permissions.ts`). API calls still require matching backend permissions.

## User accounts (`isActive`)

User management is admin-only. Users can be **deactivated** (`isActive: false`); the list shows active users only. Deactivation is a soft delete (sessions revoked on the backend). See [README-Backend.md — Users](./README-Backend.md#users).

## How to change permissions

1. Update matrices in `lib/permissions.ts` (`canRead`, `canWrite`, `canWriteShipmentType`, `allowedShipmentTypes`).
2. Adjust `lib/role-home.ts` if the post-login landing path should change.
3. Run `bun test lib/permissions.test.ts`.
4. Keep this README and [README-Backend.md](./README-Backend.md) in sync.

## Related docs

- [README-Backend.md](./README-Backend.md) — API endpoints, auth, backend role matrix, `isActive` behavior
- [DESIGN.md](./DESIGN.md) — UI tokens and layout conventions
