import prisma from './prisma'
import bcrypt from 'bcryptjs'

async function seed() {
  const hashed = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { email: 'admin@warehouse.com' },
    update: {},
    create: { name: 'Admin Gudang', email: 'admin@warehouse.com', password: hashed, role: 'ADMIN' },
  })
  const staffHashed = await bcrypt.hash('staff123', 10)
  await prisma.user.upsert({
    where: { email: 'staff@warehouse.com' },
    update: {},
    create: { name: 'Staff Gudang', email: 'staff@warehouse.com', password: staffHashed, role: 'STAFF' },
  })
  const mgrHashed = await bcrypt.hash('manager123', 10)
  await prisma.user.upsert({
    where: { email: 'manager@warehouse.com' },
    update: {},
    create: { name: 'Manager', email: 'manager@warehouse.com', password: mgrHashed, role: 'MANAGER' },
  })
  const gudang = await prisma.warehouse.upsert({
    where: { code: 'GDG-01' },
    update: {},
    create: { name: 'Gudang Utama', location: 'Jakarta', code: 'GDG-01' },
  })
  await prisma.zone.create({ data: { warehouseId: gudang.id, name: 'Rak A', code: 'A' } }).catch(() => {})
  await prisma.zone.create({ data: { warehouseId: gudang.id, name: 'Rak B', code: 'B' } }).catch(() => {})
  const supplier = await prisma.supplier.upsert({
    where: { id: 1 },
    update: {},
    create: { name: 'PT Supplier Jaya', contact: 'Budi', phone: '021-123456', email: 'budi@supplier.com', address: 'Jakarta' },
  })
  const produk = await prisma.product.upsert({
    where: { sku: 'BRG-001' },
    update: {},
    create: { sku: 'BRG-001', name: 'Kertas A4', category: 'ATK', unit: 'rim', minStock: 10, price: 45000, supplierId: supplier.id },
  })
  await prisma.product.upsert({
    where: { sku: 'BRG-002' },
    update: {},
    create: { sku: 'BRG-002', name: 'Tinta Printer', category: 'ATK', unit: 'pcs', minStock: 5, price: 120000, supplierId: supplier.id },
  })
  await prisma.stock.create({
    data: { productId: produk.id, warehouseId: gudang.id, quantity: 100 },
  })
  console.log('Seed complete: admin, staff, manager users + sample data created')
  await prisma.$disconnect()
}

seed().catch((e) => {
  console.error(e)
  process.exit(1)
})
