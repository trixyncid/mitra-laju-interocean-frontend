# Mitra Laju Interocean — Backend API Documentation

> **Runtime:** Bun · **Framework:** Elysia · **Database:** PostgreSQL (Prisma ORM) · **Auth:** Better Auth · **Storage:** DigitalOcean Spaces (S3-compatible)

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Environment Variables](#environment-variables)
3. [Authentication](#authentication)
4. [Response Format](#response-format)
5. [Error Handling](#error-handling)
6. [Data Types & Enums](#data-types--enums)
7. [Endpoints](#endpoints)
   - [Health](#health)
   - [Ports](#ports)
   - [Vessels](#vessels)
   - [Customers](#customers)
   - [Vendors](#vendors)
   - [Shipments](#shipments)
   - [Containers](#containers)
   - [Costings](#costings)
   - [Sellings](#sellings)
   - [Dashboard](#dashboard)
8. [File Uploads](#file-uploads)
9. [Data Model Overview](#data-model-overview)

---

## Getting Started

```bash
# Install dependencies
bun install

# Generate Prisma client
bunx prisma generate

# Run database migrations
bunx prisma migrate dev

# Start development server (hot-reload)
bun run dev

# Build production binary
bun run build

# Start production server
bun run start
```

The server listens on `PORT` (default `3000`).

---

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Server port (default `3000`) |
| `DATABASE_URL` | PostgreSQL connection string |
| `FRONTEND_URL` | Frontend origin for CORS and trusted origins |
| `BETTER_AUTH_SECRET` | Secret key for Better Auth session signing |
| `BETTER_AUTH_URL` | Public base URL of this API (e.g. `https://api.example.com`) |
| `DO_SPACES_REGION` | DigitalOcean Spaces region (e.g. `sgp1`) |
| `DO_SPACES_ACCESS_KEY_ID` | Spaces access key |
| `DO_SPACES_SECRET_ACCESS_KEY` | Spaces secret key |
| `DO_SPACES_BUCKET_NAME` | Spaces bucket name |
| `DO_SPACES_CDN_DOMAIN` | (Optional) CDN domain to prefix uploaded file URLs |

---

## Authentication

Authentication is handled by [Better Auth](https://better-auth.com). The auth handler is mounted at `/auth/*`.

### Sign Up

```
POST /auth/sign-up/email
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "yourpassword",
  "role": "user"
}
```

`role` is one of: `user` | `admin` | `superadmin`. Defaults to `user`.

### Sign In

```
POST /auth/sign-in/email
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "yourpassword"
}
```

A session cookie is set on success. All subsequent requests to protected endpoints must include this cookie (or the `Authorization` header if using token-based flows).

### Sign Out

```
POST /auth/sign-out
```

### Get Current Session

```
GET /auth/get-session
```

### Protected Endpoints

Every endpoint outside of `/auth/*` and the health routes requires a valid session. Requests without a valid session receive:

```json
{
  "data": null,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Unauthorized user."
  }
}
```

---

## Response Format

All responses follow a unified envelope:

```typescript
{
  "data": T | null,
  "error"?: {
    "code": string,
    "message": string,
    "details"?: unknown
  },
  "meta"?: {
    "pagination"?: {
      "page": number,
      "pageSize": number,
      "total": number,
      "totalPages": number
    }
  }
}
```

On success, `data` contains the result and `error` is absent. On failure, `data` is `null` and `error` is populated.

---

## Error Handling

| HTTP Status | Error Code | Cause |
|---|---|---|
| `401` | — | No valid session (middleware) |
| `404` | `*_NOT_FOUND` | Resource does not exist |
| `409` | `*_ALREADY_EXISTS` | Unique constraint violation (duplicate code/name) |
| `409` | `FOREIGN_KEY_CONSTRAINT` | Deleting a record that still has related children |
| `422` | `ZOD_VALIDATION_ERROR` | Request body failed schema validation; `message` lists each failing field |
| `500` | `INTERNAL_SERVER_ERROR` | Unexpected server error |

**Example 404:**
```json
{
  "data": null,
  "error": {
    "code": "SHIPMENT_NOT_FOUND",
    "message": "Shipment with ID abc-123 not found."
  }
}
```

**Example 422:**
```json
{
  "data": null,
  "error": {
    "code": "ZOD_VALIDATION_ERROR",
    "message": "portName: Required, portCountry: Required"
  }
}
```

---

## Data Types & Enums

### Container Size
```
RF_20 | RF_40 | DRY_20 | DRY_40
```

### Shipment Type
```
EXPORT | IMPORT | DOMESTIC
```

### Payment Status (Shipment Operational, Costing, Selling)
```
paid | unpaid
```

### User Role
```
user | admin | superadmin
```

### Decimal Fields
`price`, `currency`, `vatPercentage`, `pph23Percentage`, `amount` are stored as `DECIMAL(12, 2)`. Send them as **numbers** (e.g. `12.50`). They are returned as **strings** from Prisma to preserve precision — parse with `parseFloat()` or a Decimal library on the frontend.

### DateTime Fields
All datetime fields (`etd`, `closingReefer`, `eta`, `createdAt`, `updatedAt`) are **ISO 8601 strings** (e.g. `"2025-06-15T08:00:00.000Z"`).

---

## Endpoints

All endpoints below require authentication unless stated otherwise.

Base URL: `http://localhost:3000` (or your deployed domain)

---

### Health

#### `GET /`
Returns a welcome message. No auth required.

#### `GET /health`
Returns server health status. No auth required.

**Response:**
```json
{ "data": { "status": "ok" } }
```

---

### Ports

Ports represent departure and destination points for shipment operations.

#### `GET /ports`
List all ports.

**Response `data`:**
```json
[
  {
    "id": "uuid",
    "portName": "Tanjung Priok",
    "portCountry": "Indonesia",
    "isActive": true,
    "createdById": "cuid",
    "updatedById": "cuid",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

#### `GET /ports/:id`
Get a single port by ID.

#### `POST /ports`
Create a new port.

**Request body:**
```json
{
  "portName": "Tanjung Priok",
  "portCountry": "Indonesia"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `portName` | string | Yes | min 1 char |
| `portCountry` | string | Yes | min 1 char |

#### `PUT /ports/:id`
Update a port.

**Request body (all fields optional):**
```json
{
  "portName": "Tanjung Priok Updated",
  "portCountry": "Indonesia",
  "isActive": false
}
```

#### `DELETE /ports/:id`
Delete a port by ID.

---

### Vessels

Vessels carry containers between ports.

#### `GET /vessels`
List all vessels.

**Response `data` item:**
```json
{
  "id": "uuid",
  "vesselName": "MV Nusantara",
  "voyageNumber": "NU-001",
  "etd": "2025-06-15T08:00:00.000Z",
  "closingReefer": "2025-06-14T18:00:00.000Z",
  "isActive": true,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

#### `GET /vessels/:id`
Get a single vessel by ID.

#### `POST /vessels`
Create a new vessel.

**Request body:**
```json
{
  "vesselName": "MV Nusantara",
  "voyageNumber": "NU-001",
  "etd": "2025-06-15T08:00:00.000Z",
  "closingReefer": "2025-06-14T18:00:00.000Z"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `vesselName` | string | Yes | min 1 char |
| `voyageNumber` | string | Yes | min 1 char |
| `etd` | ISO 8601 datetime \| null | Yes | Estimated time of departure |
| `closingReefer` | ISO 8601 datetime \| null | Yes | Reefer closing deadline |

#### `PUT /vessels/:id`
Update a vessel. All fields optional; also accepts `isActive: boolean`.

#### `DELETE /vessels/:id`
Delete a vessel by ID.

---

### Customers

Customers are the companies that book shipments. Each customer can have multiple **shippers**, each shipper can have multiple **locations**, and each location can have multiple **contacts**.

#### `GET /customers`
List all customers.

**Response `data` item:**
```json
{
  "id": "uuid",
  "customerCode": "CUST-001",
  "customerName": "PT Maju Bersama",
  "npwp": "12.345.678.9-000.000",
  "isActive": true,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

#### `GET /customers/:id`
Get a single customer by ID.

#### `POST /customers`
Create a new customer.

**Request body:**
```json
{
  "customerName": "PT Maju Bersama",
  "customerCode": "CUST-001",
  "npwp": "12.345.678.9-000.000"
}
```

| Field | Type | Required |
|---|---|---|
| `customerName` | string | Yes |
| `customerCode` | string | Yes (unique) |
| `npwp` | string \| null | No |

#### `PUT /customers/:id`
Update a customer. All fields optional; also accepts `isActive: boolean`.

#### `DELETE /customers/:id`
Delete a customer.

---

#### Customer Shippers

A shipper is a party (e.g. exporter) linked to a customer.

#### `GET /customers/:id/shippers`
List all shippers for a customer.

#### `POST /customers/:id/shippers`
Create a shipper for a customer.

**Request body:**
```json
{
  "name": "PT Ekspor Jaya",
  "phoneNumber": "+628123456789",
  "country": "Indonesia"
}
```

| Field | Type | Required |
|---|---|---|
| `name` | string | Yes |
| `phoneNumber` | string \| null | No |
| `country` | string | Yes |

#### `PUT /customers/:id/shippers/:shipperId`
Update a shipper. All fields optional.

#### `DELETE /customers/:id/shippers/:shipperId`
Delete a shipper.

---

#### Customer Locations

#### `GET /customers/:id/locations`
List all locations across all shippers for a customer.

#### `POST /customers/:id/shippers/:shipperId/locations`
Create a location for a shipper.

**Request body:**
```json
{
  "addressLine1": "Jl. Industri No. 1",
  "addressLine2": null,
  "addressLine3": null,
  "city": "Jakarta",
  "province": "DKI Jakarta",
  "country": "Indonesia",
  "postalCode": "14350"
}
```

| Field | Type | Required |
|---|---|---|
| `addressLine1` | string | Yes |
| `addressLine2` | string \| null | No |
| `addressLine3` | string \| null | No |
| `city` | string | Yes |
| `province` | string | Yes |
| `country` | string | Yes |
| `postalCode` | string \| null | No |

#### `PUT /customers/:id/shippers/:shipperId/locations/:locationId`
Update a location. All fields optional.

#### `DELETE /customers/:id/shippers/:shipperId/locations/:locationId`
Delete a location.

---

#### Customer Contacts

#### `POST /customers/:id/shippers/:shipperId/locations/:locationId/contacts`
Create a contact for a location.

**Request body:**
```json
{
  "contactName": "Budi Santoso",
  "phoneNumber": "+628123456789",
  "email": "budi@example.com"
}
```

| Field | Type | Required |
|---|---|---|
| `contactName` | string | Yes |
| `phoneNumber` | string \| null | No |
| `email` | string \| null | No |

#### `PUT /customers/:id/shippers/:shipperId/locations/:locationId/contacts/:contactId`
Update a contact. All fields optional.

#### `DELETE /customers/:id/shippers/:shipperId/locations/:locationId/contacts/:contactId`
Delete a contact.

---

### Vendors

Vendors are service providers (e.g. trucking, customs brokers) linked to costings. Structure mirrors Customers: vendor → locations → contacts.

#### `GET /vendors`
List all vendors.

**Response `data` item:**
```json
{
  "id": "uuid",
  "vendorCode": "VEND-001",
  "vendorName": "PT Logistik Cepat",
  "npwp": "98.765.432.1-000.000",
  "isActive": true,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

#### `GET /vendors/:id`
Get a single vendor by ID.

#### `POST /vendors`
Create a new vendor.

**Request body:**
```json
{
  "vendorName": "PT Logistik Cepat",
  "vendorCode": "VEND-001",
  "npwp": "98.765.432.1-000.000"
}
```

| Field | Type | Required |
|---|---|---|
| `vendorName` | string | Yes |
| `vendorCode` | string | Yes (unique) |
| `npwp` | string \| null | No |

#### `PUT /vendors/:id`
Update a vendor. All fields optional; also accepts `isActive: boolean`.

#### `DELETE /vendors/:id`
Delete a vendor.

---

#### Vendor Locations

#### `POST /vendors/:id/locations`
Create a location for a vendor.

**Request body:**
```json
{
  "addressLine1": "Jl. Gudang No. 5",
  "addressLine2": null,
  "city": "Surabaya",
  "province": "Jawa Timur",
  "country": "Indonesia",
  "postalCode": "60100"
}
```

Same fields as [Customer Locations](#customer-locations).

#### `PUT /vendors/:id/locations/:locationId`
Update a vendor location.

#### `DELETE /vendors/:id/locations/:locationId`
Delete a vendor location.

---

#### Vendor Contacts

#### `POST /vendors/:id/locations/:locationId/contacts`
Create a contact for a vendor location.

**Request body:**
```json
{
  "contactName": "Andi Wijaya",
  "phoneNumber": "+628211112222",
  "email": "andi@logistik.com"
}
```

| Field | Type | Required |
|---|---|---|
| `contactName` | string | Yes |
| `phoneNumber` | string | Yes (required for vendors) |
| `email` | string \| null | No |

#### `PUT /vendors/:id/locations/:locationId/contacts/:contactId`
Update a vendor contact.

#### `DELETE /vendors/:id/locations/:locationId/contacts/:contactId`
Delete a vendor contact.

---

### Shipments

A shipment is the top-level booking record. It contains one optional **operational** record (routing, vessel, containers) and can have **attachments** (documents).

#### `GET /shipments`
List all shipments.

**Response `data` item:**
```json
{
  "id": "uuid",
  "orderNumber": "ORD-2025-001",
  "customerCodeId": "uuid",
  "customerShipperId": "uuid",
  "isActive": true,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z",
  "customerCode": { "...": "Customer object" },
  "customerShipper": { "...": "CustomerShipper object" }
}
```

#### `GET /shipments/:id`
Get a single shipment by ID (includes operational data, attachments, costings).

#### `POST /shipments`
Create a new shipment.

**Request body:**
```json
{
  "orderNumber": "ORD-2025-001",
  "customerCodeId": "uuid-of-customer",
  "customerShipperId": "uuid-of-shipper"
}
```

| Field | Type | Required |
|---|---|---|
| `orderNumber` | string | Yes |
| `customerCodeId` | string (UUID) | Yes |
| `customerShipperId` | string (UUID) | Yes |

#### `PUT /shipments/:id`
Update a shipment. All fields optional; also accepts `isActive: boolean`.

#### `DELETE /shipments/:id`
Delete a shipment.

---

#### Shipment Attachments

Attachments are uploaded as `multipart/form-data`.

#### `GET /shipments/:id/attachments/:attachmentId`
Get a single attachment. Returns the record **plus a presigned URL** for temporary download access (valid 1 hour).

**Response `data`:**
```json
{
  "id": "uuid",
  "shipmentId": "uuid",
  "attachmentName": "Bill of Lading",
  "contentType": "application/pdf",
  "fileName": "bl-2025.pdf",
  "filePath": "mitra-laju-interocean/...",
  "size": 204800,
  "url": "https://presigned-url..."
}
```

#### `POST /shipments/:id/attachments`
Upload a new attachment.

**Request:** `multipart/form-data`

| Field | Type | Required |
|---|---|---|
| `attachmentName` | string | Yes |
| `shipmentId` | string (UUID) | Yes |
| `document` | File | Yes |

#### `PUT /shipments/:id/attachments/:attachmentId`
Update attachment metadata (does not re-upload the file).

**Request body (all optional):**
```json
{
  "attachmentName": "Updated Name",
  "shipmentId": "uuid"
}
```

#### `DELETE /shipments/:id/attachments/:attachmentId`
Delete an attachment and remove the file from storage.

---

#### Shipment Operational

Each shipment has at most **one** operational record containing routing details and containers.

#### `POST /shipments/:id/operational`
Create an operational record for a shipment.

**Request body:**
```json
{
  "shipmentType": "EXPORT",
  "shipmentId": "uuid-of-shipment",
  "eta": "2025-07-01T00:00:00.000Z",
  "blNumber": "BLMLI2025001",
  "vesselId": "uuid-of-vessel",
  "bookingNumber": "BK-2025-001",
  "portDepartureId": "uuid-of-port",
  "portDestinationId": "uuid-of-port",
  "loadingLocationId": "uuid-of-customer-location",
  "unloadingLocationId": "uuid-of-customer-location",
  "customerChargeAmount": 5000000
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `shipmentType` | `EXPORT` \| `IMPORT` \| `DOMESTIC` | Yes | |
| `shipmentId` | string (UUID) | Yes | Must match URL `:id` |
| `eta` | ISO 8601 \| null | No | Estimated time of arrival |
| `blNumber` | string | No | Bill of lading number |
| `vesselId` | string (UUID) | Yes | |
| `bookingNumber` | string | No | |
| `portDepartureId` | string (UUID) | Yes | |
| `portDestinationId` | string (UUID) | Yes | |
| `loadingLocationId` | string (UUID) | Yes | CustomerLocation |
| `unloadingLocationId` | string (UUID) | Yes | CustomerLocation |
| `customerChargeAmount` | integer | No | Amount charged to customer |

#### `PUT /shipments/:id/operational/:operationalId`
Update an operational record. All fields optional; also accepts `status: "paid" | "unpaid"`.

#### `DELETE /shipments/:id/operational/:operationalId`
Delete an operational record (cascades to containers).

---

#### Shipment Operational Containers

#### `POST /shipments/:id/operational/:operationalId/containers`
Add a container to a shipment operational.

**Request body:**
```json
{
  "size": "DRY_20",
  "containerNumber": "TCKU1234567",
  "sealNumber": "SL-001",
  "shipmentOperationalId": "uuid-of-operational"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `size` | `RF_20` \| `RF_40` \| `DRY_20` \| `DRY_40` | Yes | Container type/size |
| `containerNumber` | string | Yes | |
| `sealNumber` | string | Yes | |
| `shipmentOperationalId` | string (UUID) | Yes | Must match URL `:operationalId` |

#### `PUT /shipments/:id/operational/:operationalId/containers/:containerId`
Update a container. All fields optional; also accepts `isActive: boolean`.

#### `DELETE /shipments/:id/operational/:operationalId/containers/:containerId`
Delete a container.

---

### Containers

#### `GET /containers`
List all containers across all shipment operationals. Useful for dropdown selectors when creating costings.

**Response `data` item:**
```json
{
  "id": "uuid",
  "containerNumber": "TCKU1234567",
  "sealNumber": "SL-001",
  "size": "DRY_20",
  "shipmentOperationalId": "uuid",
  "isActive": true,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

---

### Costings

Costings record vendor charges against a shipment and/or container.

#### `GET /costings`
List all costings (includes vendor, shipment relations).

**Response `data` item:**
```json
{
  "id": "uuid",
  "costingNumber": "CST-2025-001",
  "description": "Trucking fee",
  "status": "unpaid",
  "shipmentId": "uuid",
  "price": "1500000.00",
  "currency": "1.00",
  "containerId": "uuid",
  "vatPercentage": "11.00",
  "pph23Percentage": "2.00",
  "vendorInvoiceNumber": "INV-VENDOR-001",
  "vendorId": "uuid",
  "sellingId": "uuid",
  "isActive": true,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z",
  "vendor": { "...": "Vendor object" },
  "shipment": { "...": "Shipment object" },
  "selling": { "...": "Selling object" }
}
```

#### `GET /costings/:id`
Get a single costing by ID (includes container, attachments, selling).

#### `POST /costings`
Create a new costing.

**Request body:**
```json
{
  "costingNumber": "CST-2025-001",
  "description": "Trucking fee",
  "shipmentId": "uuid-of-shipment",
  "price": 1500000,
  "currency": 1,
  "containerId": "uuid-of-container",
  "vatPercentage": 11,
  "pph23Percentage": 2,
  "vendorInvoiceNumber": "INV-VENDOR-001",
  "vendorId": "uuid-of-vendor",
  "sellingId": "uuid-of-selling"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `costingNumber` | string | Yes | Must be unique |
| `description` | string | Yes | |
| `shipmentId` | string (UUID) | No | |
| `price` | number | Yes | Stored as `DECIMAL(12,2)` |
| `currency` | number | Yes | Exchange rate multiplier |
| `containerId` | string (UUID) | Yes | |
| `vatPercentage` | number | Yes | e.g. `11` for 11% |
| `pph23Percentage` | number | Yes | e.g. `2` for 2% |
| `vendorInvoiceNumber` | string | Yes | |
| `vendorId` | string (UUID) | Yes | |
| `sellingId` | string (UUID) | No | Link costing to a selling record |

#### `PUT /costings/:id`
Update a costing. All fields optional; also accepts `status: "paid" | "unpaid"` and `sellingId: null` to unlink from a selling.

#### `DELETE /costings/:id`
Delete a costing.

---

#### Costing Attachments

Same pattern as Shipment Attachments. Files are stored under `mitra-laju-interocean/costings/`.

#### `GET /costings/:id/attachments/:attachmentId`
Get a costing attachment with a presigned download URL (valid 1 hour).

#### `POST /costings/:id/attachments`
Upload a costing attachment.

**Request:** `multipart/form-data`

| Field | Type | Required |
|---|---|---|
| `attachmentName` | string | Yes |
| `costingId` | string (UUID) | Yes |
| `document` | File | Yes |

#### `PUT /costings/:id/attachments/:attachmentId`
Update attachment metadata.

**Request body (all optional):**
```json
{
  "attachmentName": "Updated Invoice",
  "costingId": "uuid"
}
```

#### `DELETE /costings/:id/attachments/:attachmentId`
Delete a costing attachment and remove the file from storage.

---

### Sellings

Sellings record the revenue side of a shipment — what is charged to the customer. One selling can have **many** costings (the `sellingId` foreign key lives on `Costing`).

#### `GET /sellings`
List all sellings (includes shipment and related costings).

**Response `data` item:**
```json
{
  "id": "uuid",
  "sellingNumber": "SL-2025-001",
  "description": "Customer invoice for EXPORT shipment",
  "status": "unpaid",
  "shipmentId": "uuid",
  "amount": "2000000.00",
  "vatPercentage": "11.00",
  "pph23Percentage": "2.00",
  "isActive": true,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z",
  "shipment": { "...": "Shipment object" },
  "costings": [{ "...": "Costing object" }]
}
```

#### `GET /sellings/:id`
Get a single selling by ID.

#### `POST /sellings`
Create a new selling.

**Request body:**
```json
{
  "sellingNumber": "SL-2025-001",
  "description": "Customer invoice for EXPORT shipment",
  "shipmentId": "uuid-of-shipment",
  "amount": 2000000,
  "vatPercentage": 11,
  "pph23Percentage": 2
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `sellingNumber` | string | Yes | Must be unique |
| `description` | string | Yes | |
| `shipmentId` | string (UUID) | No | |
| `amount` | number | Yes | Stored as `DECIMAL(12,2)` |
| `vatPercentage` | number | Yes | e.g. `11` for 11% |
| `pph23Percentage` | number | Yes | e.g. `2` for 2% |

To attach costings to a selling, set `sellingId` when creating or updating a [Costing](#costings).

#### `PUT /sellings/:id`
Update a selling. All fields optional; also accepts `status: "paid" | "unpaid"`.

**Request body example:**
```json
{
  "status": "paid",
  "amount": 2100000
}
```

#### `DELETE /sellings/:id`
Delete a selling.

---

### Dashboard

Aggregated analytics for the admin dashboard. All metrics are filtered by a date range using each record's `createdAt`.

**Default date range:** if query params are omitted, `endDate` = today (end of day) and `startDate` = 30 days before `endDate` (start of day).

#### `GET /dashboard`

**Query parameters:**

| Param | Type | Required | Notes |
|---|---|---|---|
| `startDate` | string (ISO 8601 or parseable date) | No | Inclusive start; defaults to 30 days before `endDate` |
| `endDate` | string (ISO 8601 or parseable date) | No | Inclusive end; defaults to today |

**Example:**
```
GET /dashboard?startDate=2025-04-01&endDate=2025-05-01
```

**Response `data`:**
```json
{
  "dateRange": {
    "startDate": "2025-04-01T00:00:00.000Z",
    "endDate": "2025-05-01T23:59:59.999Z"
  },
  "shipmentTypeCounts": {
    "EXPORT": 12,
    "IMPORT": 8,
    "DOMESTIC": 3
  },
  "topCustomersByShipments": [
    {
      "customerId": "uuid",
      "customerName": "PT Maju Bersama",
      "customerCode": "CUST-001",
      "shipmentCount": 15
    }
  ],
  "topCustomersByChargeAmount": [
    {
      "customerId": "uuid",
      "customerName": "PT Maju Bersama",
      "customerCode": "CUST-001",
      "totalChargeAmount": 50000000
    }
  ],
  "topVendorsByCostingCount": [
    {
      "vendorId": "uuid",
      "vendorName": "PT Logistik Cepat",
      "vendorCode": "VEND-001",
      "costingCount": 20
    }
  ],
  "topVendorsByTotalAmount": [
    {
      "vendorId": "uuid",
      "vendorName": "PT Logistik Cepat",
      "vendorCode": "VEND-001",
      "totalAmount": "15000000.00"
    }
  ],
  "totalNetSelling": "18500000.00",
  "totalNetCosting": "12000000.00",
  "netRevenue": "6500000.00"
}
```

**Net amount formula (per record):**

```
gross = price × currency          (Selling uses amount as gross)
vat   = gross × (vatPercentage / 100)
pph23 = gross × (pph23Percentage / 100)
net   = gross - vat - pph23
```

`netRevenue` = `totalNetSelling` − `totalNetCosting` (computed in the API response).

**Metric definitions:**

| Field | Source | Filter field | Notes |
|---|---|---|---|
| `shipmentTypeCounts` | `ShipmentOperational` | `createdAt` | Counts active operationals grouped by `EXPORT`, `IMPORT`, `DOMESTIC` |
| `topCustomersByShipments` | `Shipment` | `createdAt` | Top 10 customers by number of active shipments |
| `topCustomersByChargeAmount` | `ShipmentOperational.customerChargeAmount` | `createdAt` | Top 10 customers by sum of charge amounts (via shipment → customer) |
| `topVendorsByCostingCount` | `Costing` | `createdAt` | Top 10 vendors by number of active costings |
| `topVendorsByTotalAmount` | `Costing.price * Costing.currency` | `createdAt` | Top 10 vendors by total gross spend (`price` × `currency` per row, summed) |
| `totalNetSelling` | `Selling` | `createdAt` | Sum of net selling amounts across all active sellings in range |
| `totalNetCosting` | `Costing` | `createdAt` | Sum of net costing amounts across all active costings in range |
| `netRevenue` | Derived | — | `totalNetSelling` minus `totalNetCosting` |

**Example (JavaScript / fetch):**
```javascript
const params = new URLSearchParams({
  startDate: "2025-04-01",
  endDate: "2025-05-01",
});

const response = await fetch(`/dashboard?${params}`, {
  credentials: "include",
});
const { data } = await response.json();
```

---

## File Uploads

Endpoints that accept file uploads use `multipart/form-data`. Set the `Content-Type` header to `multipart/form-data` (most HTTP clients do this automatically when using `FormData`).

**Supported MIME types:** PDF, Word (doc/docx), Excel (xls/xlsx), PNG, JPG/JPEG, GIF, WebP, SVG, TXT, CSV, ZIP, JSON.

Files are stored in DigitalOcean Spaces. Download URLs returned by `GET` attachment endpoints are **presigned** and expire after **1 hour**. Do not cache them permanently — re-fetch the attachment record to get a fresh URL.

**Example (JavaScript / fetch):**
```javascript
const formData = new FormData();
formData.append("attachmentName", "Bill of Lading");
formData.append("shipmentId", "uuid-here");
formData.append("document", file); // File object from <input type="file">

const response = await fetch("/shipments/:id/attachments", {
  method: "POST",
  credentials: "include",
  body: formData,
});
```

---

## Data Model Overview

```
User
├── sessions (Session[])
└── accounts (Account[])

Customer
├── customerShippers (CustomerShipper[])
│   └── customerLocations (CustomerLocation[])
│       └── customerContacts (CustomerContact[])
└── shipments (Shipment[])

Vendor
└── vendorLocations (VendorLocation[])
    └── vendorContacts (VendorContact[])

Port

Vessel
└── shipmentOperationals (ShipmentOperational[])

Shipment
├── shipmentOperational (ShipmentOperational?) — 1-to-1
│   └── shipmentOperationalContainers (ShipmentOperationalContainer[])
│       └── costings (Costing[])
├── shipmentOperationalAttachments (ShipmentOperationalAttachment[])
├── costings (Costing[])
└── sellings (Selling[])

Costing
├── costingsAttachments (CostingAttachment[])
└── selling (Selling?) — optional FK via sellingId

Selling
├── shipment (Shipment?) — optional
└── costings (Costing[]) — one selling, many costings
```

### Key Relationships

| From | To | Type | Notes |
|---|---|---|---|
| Shipment | ShipmentOperational | 1-to-1 (optional) | One shipment has at most one operational record |
| ShipmentOperational | ShipmentOperationalContainer | 1-to-many | Deleted when operational is deleted |
| ShipmentOperationalContainer | Costing | 1-to-many | Container used in costing |
| Costing | CostingAttachment | 1-to-many | |
| Selling | Shipment | many-to-1 (optional) | |
| Selling | Costing | 1-to-many | FK `sellingId` on Costing |
