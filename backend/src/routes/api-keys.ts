import { Router, Response } from 'express'
import crypto from 'crypto'
import prisma from '../prisma'
import { authenticate, authorize } from '../middleware/auth'
import { AuthRequest } from '../types'
import { z } from 'zod'
import { validate } from '../lib/validate'

const router = Router()
router.use(authenticate)
router.use(authorize('ADMIN'))

const createSchema = z.object({
  name: z.string().min(1).max(200),
})

router.get('/', async (req: AuthRequest, res: Response) => {
  const keys = await prisma.apiKey.findMany({
    where: { userId: req.user!.id },
    select: { id: true, name: true, key: true, active: true, lastUsed: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })
  res.json({ success: true, data: keys })
})

router.post('/', validate(createSchema), async (req: AuthRequest, res: Response) => {
  const key = `wak-${crypto.randomBytes(24).toString('hex')}`
  const { name } = req.body
  const apiKey = await prisma.apiKey.create({
    data: { key, name, userId: req.user!.id },
    select: { id: true, name: true, key: true, active: true, createdAt: true },
  })
  res.status(201).json({ success: true, data: apiKey })
})

router.put('/:id/toggle', async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id)
  const existing = await prisma.apiKey.findFirst({ where: { id, userId: req.user!.id } })
  if (!existing) return res.status(404).json({ success: false, error: 'API key not found' })
  const updated = await prisma.apiKey.update({
    where: { id },
    data: { active: !existing.active },
    select: { id: true, name: true, key: true, active: true, lastUsed: true, createdAt: true },
  })
  res.json({ success: true, data: updated })
})

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id)
  const existing = await prisma.apiKey.findFirst({ where: { id, userId: req.user!.id } })
  if (!existing) return res.status(404).json({ success: false, error: 'API key not found' })
  await prisma.apiKey.delete({ where: { id } })
  res.json({ success: true, data: null })
})

export default router
