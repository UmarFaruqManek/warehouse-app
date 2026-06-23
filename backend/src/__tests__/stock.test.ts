import request from 'supertest'
import { app, adminToken } from './setup'

describe('Stock Routes', () => {
  let stockItemId: number

  describe('GET /api/stock', () => {
    it('should list stock', async () => {
      const res = await request(app)
        .get('/api/stock')
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(Array.isArray(res.body.data.data)).toBe(true)
    })

    it('should filter by warehouse', async () => {
      const res = await request(app)
        .get('/api/stock?warehouseId=1')
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.status).toBe(200)
    })
  })

  describe('GET /api/stock/alerts', () => {
    it('should return stock alerts', async () => {
      const res = await request(app)
        .get('/api/stock/alerts')
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.status).toBe(200)
      expect(Array.isArray(res.body.data)).toBe(true)
    })
  })

  describe('POST /api/transactions/in', () => {
    it('should add stock in', async () => {
      const res = await request(app)
        .post('/api/transactions/in')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ productId: 1, warehouseId: 1, quantity: 10, note: 'Test stock in' })
      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
    })

    it('should reject negative quantity', async () => {
      const res = await request(app)
        .post('/api/transactions/in')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ productId: 1, warehouseId: 1, quantity: -5 })
      expect(res.status).toBe(400)
    })

    it('should reject zero quantity', async () => {
      const res = await request(app)
        .post('/api/transactions/in')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ productId: 1, warehouseId: 1, quantity: 0 })
      expect(res.status).toBe(400)
    })
  })

  describe('POST /api/transactions/out', () => {
    it('should remove stock out', async () => {
      const res = await request(app)
        .post('/api/transactions/out')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ productId: 1, warehouseId: 1, quantity: 5, note: 'Test stock out' })
      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
    })

    it('should reject insufficient stock', async () => {
      const res = await request(app)
        .post('/api/transactions/out')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ productId: 1, warehouseId: 1, quantity: 99999 })
      expect(res.status).toBe(500)
    })
  })

  describe('GET /api/transactions', () => {
    it('should list transactions', async () => {
      const res = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.status).toBe(200)
      expect(Array.isArray(res.body.data.data)).toBe(true)
    })

    it('should filter by type', async () => {
      const res = await request(app)
        .get('/api/transactions?type=IN')
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.status).toBe(200)
      for (const t of res.body.data.data) {
        expect(t.type).toBe('IN')
      }
    })

    it('should filter by date range', async () => {
      const res = await request(app)
        .get('/api/transactions?startDate=2024-01-01&endDate=2030-12-31')
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.status).toBe(200)
    })
  })
})
