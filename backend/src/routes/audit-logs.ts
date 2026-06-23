import { Router, Response } from 'express'
import prisma from '../prisma'
import { authenticate, authorize } from '../middleware/auth'
import { AuthRequest } from '../types'

const router = Router()
router.use(authenticate)
router.use(authorize('ADMIN'))

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { userId, entityType, action, dateFrom, dateTo } = req.query
    const where: any = {}
    if (userId) where.userId = Number(userId)
    if (entityType) where.entityType = entityType
    if (action) where.action = action
    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) where.createdAt.gte = new Date(dateFrom as string)
      if (dateTo) where.createdAt.lte = new Date(dateTo as string)
    }
    const logs = await prisma.auditLog.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 500,
    })
    res.json({ success: true, data: logs })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

export default router
