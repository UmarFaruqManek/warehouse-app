import { Request } from 'express'

export interface AuthRequest extends Request {
  user?: {
    id: number
    email: string
    role: string
  }
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

export type Role = 'ADMIN' | 'STAFF' | 'MANAGER'
