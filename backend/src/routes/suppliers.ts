import { Router, Response } from 'express'
import prisma from '../prisma'
import { authenticate, authorize } from '../middleware/auth'
import { AuthRequest } from '../types'
import { getPagination, paginatedResponse } from '../lib/paginate'

const router = Router()
router.use(authenticate)

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { search } = req.query
    const pag = getPagination(req.query)
    const where: any = {}
    if (search) where.name = { contains: search as string }
    const [suppliers, total] = await Promise.all([
      prisma.supplier.findMany({ where, orderBy: { name: 'asc' }, skip: (pag.page - 1) * pag.limit, take: pag.limit }),
      prisma.supplier.count({ where }),
    ])
    res.json({ success: true, data: paginatedResponse(suppliers, total, pag) })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const supplier = await prisma.supplier.findUnique({
      where: { id: Number(req.params.id) },
      include: { Products: true },
    })
    if (!supplier) return res.status(404).json({ success: false, error: 'Supplier not found' })
    res.json({ success: true, data: supplier })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.post('/', authorize('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, contact, phone, email, address } = req.body
    const supplier = await prisma.supplier.create({ data: { name, contact, phone, email, address } })
    await prisma.auditLog.create({
      data: { userId: req.user!.id, action: 'CREATE', entityType: 'Supplier', entityId: supplier.id, newValue: JSON.stringify(supplier) },
    })
    res.status(201).json({ success: true, data: supplier })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.put('/:id', authorize('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const old = await prisma.supplier.findUnique({ where: { id: Number(req.params.id) } })
    if (!old) return res.status(404).json({ success: false, error: 'Supplier not found' })
    const { name, contact, phone, email, address } = req.body
    const supplier = await prisma.supplier.update({
      where: { id: Number(req.params.id) },
      data: { name, contact, phone, email, address },
    })
    await prisma.auditLog.create({
      data: { userId: req.user!.id, action: 'UPDATE', entityType: 'Supplier', entityId: supplier.id, oldValue: JSON.stringify(old), newValue: JSON.stringify(supplier) },
    })
    res.json({ success: true, data: supplier })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.delete('/:id', authorize('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const old = await prisma.supplier.findUnique({ where: { id: Number(req.params.id) } })
    if (!old) return res.status(404).json({ success: false, error: 'Supplier not found' })
    await prisma.supplier.delete({ where: { id: Number(req.params.id) } })
    await prisma.auditLog.create({
      data: { userId: req.user!.id, action: 'DELETE', entityType: 'Supplier', entityId: Number(req.params.id), oldValue: JSON.stringify(old) },
    })
    res.json({ success: true, data: null })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

export default router
