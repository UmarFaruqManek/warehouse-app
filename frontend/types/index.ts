export interface User {
  id: number
  name: string
  email: string
  role: 'ADMIN' | 'STAFF' | 'MANAGER'
}

export interface Product {
  id: number
  sku: string
  name: string
  description: string
  category: string
  unit: string
  minStock: number
  price: number
  supplierId: number | null
  supplier?: Supplier
  createdAt: string
}

export interface Supplier {
  id: number
  name: string
  contact: string
  phone: string
  email: string
  address: string
}

export interface Warehouse {
  id: number
  name: string
  location: string
  code: string
  zones?: Zone[]
}

export interface Zone {
  id: number
  warehouseId: number
  name: string
  code: string
}

export interface StockItem {
  id: number
  productId: number
  warehouseId: number
  zoneId: number | null
  quantity: number
  product: Product
  warehouse: Warehouse
  zone?: Zone
}

export interface StockTransaction {
  id: number
  productId: number
  warehouseId: number
  zoneId: number | null
  type: string
  quantity: number
  referenceType: string
  note: string
  userId: number
  user?: User
  product: Product
  warehouse: Warehouse
  createdAt: string
}

export interface PurchaseOrder {
  id: number
  poNumber: string
  supplierId: number
  supplier: Supplier
  status: string
  orderDate: string
  receivedDate: string | null
  totalAmount: number
  items: POItem[]
}

export interface POItem {
  id: number
  poId: number
  productId: number
  product: Product
  quantity: number
  unitPrice: number
}

export interface SalesOrder {
  id: number
  soNumber: string
  customerName: string
  status: string
  orderDate: string
  shippedDate: string | null
  items: SOItem[]
}

export interface SOItem {
  id: number
  soId: number
  productId: number
  product: Product
  quantity: number
  unitPrice: number
}

export interface AuditLog {
  id: number
  userId: number | null
  user?: User
  action: string
  entityType: string
  entityId: number
  oldValue: string
  newValue: string
  createdAt: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

export interface DashboardStats {
  products: number
  warehouses: number
  lowStock: number
}

export interface StockAlert {
  id: number
  sku: string
  name: string
  minStock: number
  unit: string
  totalStock: number
}

export interface StockValue {
  id: number
  sku: string
  name: string
  price: number
  unit: string
  totalStock: number
  totalValue: number
}

export interface MovementReport {
  id: number
  productId: number
  warehouseId: number
  type: string
  quantity: number
  createdAt: string
  product: { id: number; name: string; sku: string }
  warehouse: { id: number; name: string }
}

export interface SlowMoving {
  id: number
  sku: string
  name: string
  category: string
  totalStock: number
  movementCount: number
}
