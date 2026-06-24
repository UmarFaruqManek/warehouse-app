import { Router, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import rateLimit from 'express-rate-limit'
import prisma from '../prisma'
import { authenticate, JWT_SECRET } from '../middleware/auth'
import { AuthRequest } from '../types'
import { validate } from '../lib/validate'

const router = Router()

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Too many login attempts, try again later' },
  standardHeaders: true,
  legacyHeaders: false,
})

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password min 6 characters'),
})

const registerSchema = z.object({
  name: z.string().min(1, 'Name required').max(200),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password min 6 characters'),
  role: z.string().optional(),
})

router.post('/register', validate(registerSchema), async (req: AuthRequest, res: Response) => {
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
})

router.post('/login', loginLimiter, validate(loginSchema), async (req: AuthRequest, res: Response) => {
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
})

router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { id: true, name: true, email: true, role: true },
  })
  res.json({ success: true, data: user })
})

export default router
