import { Router, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../prisma'
import { authenticate, JWT_SECRET } from '../middleware/auth'
import { AuthRequest } from '../types'

const router = Router()

router.post('/register', async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, role } = req.body
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return res.status(400).json({ success: false, error: 'Email already registered' })
    }
    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role: role || 'STAFF' },
      select: { id: true, name: true, email: true, role: true },
    })
    res.status(201).json({ success: true, data: user })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.post('/login', async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' })
    }
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' })
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    )
    res.json({
      success: true,
      data: {
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      },
    })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, name: true, email: true, role: true },
    })
    res.json({ success: true, data: user })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

export default router
