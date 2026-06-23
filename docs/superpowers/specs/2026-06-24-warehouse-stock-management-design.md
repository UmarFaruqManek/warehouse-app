# Aplikasi Manajemen Stok Pergudangan — Design Document

## 1. Project Overview

Web application for warehouse stock management with multi-role access (Admin, Staff, Manager). Supports multi-warehouse, inventory tracking, purchase/sales orders, reporting, and audit logging.

## 2. Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router) |
| UI | Tailwind CSS + shadcn/ui |
| Backend | Express.js |
| Database | PostgreSQL (SQLite for dev) |
| ORM | Prisma |
| Auth | JWT |

## 3. Project Structure

```
warehouse-app/
├── frontend/          # Next.js
├── backend/           # Express.js
└── docs/              # Documentation & specs
```

## 4. Entity Relationship

- **Users** — id, name, email, password, role (ADMIN/STAFF/MANAGER), createdAt
- **Warehouses** — id, name, location, code, createdAt
- **Zones** — id, warehouse_id, name, code
- **Suppliers** — id, name, contact, phone, email, address
- **Products** — id, sku, name, description, category, unit, min_stock, price, supplier_id, createdAt
- **Stock** — id, product_id, warehouse_id, zone_id, quantity
- **StockTransactions** — id, product_id, warehouse_id, zone_id, type (IN/OUT), quantity, reference_type (PO/SO/ADJUST), reference_id, note, user_id, createdAt
- **PurchaseOrders** — id, po_number, supplier_id, status, order_date, received_date, total_amount, user_id
- **POItems** — id, po_id, product_id, quantity, unit_price
- **SalesOrders** — id, so_number, customer_name, status, order_date, shipped_date, user_id
- **SOItems** — id, so_id, product_id, quantity, unit_price
- **AuditLogs** — id, user_id, action, entity_type, entity_id, old_value, new_value, ip_address, createdAt

## 5. Role & Permissions

| Feature | Admin | Staff | Manager |
|---------|-------|-------|---------|
| CRUD Products | ✓ | ✓* | ✗ |
| CRUD Suppliers | ✓ | ✗ | ✗ |
| CRUD Warehouses | ✓ | ✗ | ✗ |
| Stock In/Out | ✓ | ✓ | ✗ |
| View Stock | ✓ | ✓ | ✓ |
| Purchase Orders | ✓ | ✓ | ✗ |
| Sales Orders | ✓ | ✓ | ✗ |
| Reports | ✓ | ✗ | ✓ |
| Audit Logs | ✓ | ✗ | ✗ |
| Manage Users | ✓ | ✗ | ✗ |

*Staff can view and edit products but cannot delete.

## 6. Frontend Pages

```
/login
/dashboard                          — charts, stock alerts, trends
/warehouses                         — list warehouses
/warehouses/:id/zones               — manage racks/zones
/products                           — list products
/products/new                       — add product
/products/:id/edit                  — edit product
/suppliers                          — list suppliers
/suppliers/:id                      — supplier detail
/stock                              — view all stock (filterable)
/transactions                       — stock movement history
/purchase-orders                    — list PO
/purchase-orders/new                — create PO
/purchase-orders/:id                — PO detail
/sales-orders                       — list SO
/sales-orders/new                   — create SO
/sales-orders/:id                   — SO detail
/reports                            — stock reports, movement reports
/audit-logs                         — activity log (admin only)
```

## 7. API Endpoints

```
Auth:
  POST   /api/auth/login
  POST   /api/auth/register
  GET    /api/auth/me

Products:
  GET    /api/products ?search&category&warehouse_id
  POST   /api/products
  GET    /api/products/:id
  PUT    /api/products/:id
  DELETE /api/products/:id

Suppliers:
  GET    /api/suppliers ?search
  POST   /api/suppliers
  GET    /api/suppliers/:id
  PUT    /api/suppliers/:id
  DELETE /api/suppliers/:id

Warehouses:
  GET    /api/warehouses
  POST   /api/warehouses
  GET    /api/warehouses/:id
  PUT    /api/warehouses/:id
  DELETE /api/warehouses/:id
  PUT    /api/warehouses/:id/zones

Stock:
  GET    /api/stock ?warehouse_id&product_id&below_min
  GET    /api/stock/alerts

Transactions:
  GET    /api/transactions ?type&start_date&end_date&product_id
  POST   /api/stock/in
  POST   /api/stock/out

Purchase Orders:
  GET    /api/purchase-orders ?status&supplier_id
  POST   /api/purchase-orders
  GET    /api/purchase-orders/:id
  PUT    /api/purchase-orders/:id/status

Sales Orders:
  GET    /api/sales-orders ?status
  POST   /api/sales-orders
  GET    /api/sales-orders/:id
  PUT    /api/sales-orders/:id/status

Reports:
  GET    /api/reports/stock-value
  GET    /api/reports/movement ?start_date&end_date&warehouse_id
  GET    /api/reports/slow-moving ?months&threshold

Audit:
  GET    /api/audit-logs ?user_id&entity_type&action&date_from&date_to
```

## 8. Sequence: Stock In Transaction

```
User → POST /api/stock/in
  ├── Validate product, warehouse, zone
  ├── Create StockTransaction (type=IN)
  ├── Upsert Stock row (quantity +)
  ├── Create AuditLog
  └── Return updated stock
```

## 9. Sequence: Purchase Order to Stock

```
User → POST /api/purchase-orders
  ├── Create PO (status=DRAFT)
  └── Later: PUT /purchase-orders/:id/status → RECEIVED
       ├── For each POItem:
       │   ├── Create StockTransaction (type=IN, ref=PO)
       │   └── Update Stock quantity
       ├── Update PO status = RECEIVED
       └── Create AuditLog
```

## 10. Constraints & Rules

- Stock quantity cannot go negative
- Every stock mutation creates a StockTransaction record
- PO items can only be received once
- SO items reduce stock on status change to SHIPPED
- AuditLog captures all CUD operations on core entities
- SKU must be unique per product
- min_stock on Product triggers stock alert when stock ≤ min_stock

## 11. Future (Phase 2)

- Barcode / QR Code scanning
- API integrations
- Email notifications (PO received, stock alerts)
- Mobile responsive enhancements
