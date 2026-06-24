import { Response, NextFunction } from 'express'
import prisma from '../prisma'
import { AuthRequest } from '../types'

export async function apiKeyAuthenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers['x-api-key'] as string
  if (!header) return next()

  const apiKey = await prisma.apiKey.findUnique({ where: { key: header } })
  if (!apiKey || !apiKey.active) {
    return res.status(401).json({ success: false, error: 'Invalid or inactive API key' })
  }
  await prisma.apiKey.update({ where: { id: apiKey.id }, data: { lastUsed: new Date() } })
  req.user = { id: apiKey.userId, email: '', role: 'ADMIN' }
  next()
}
