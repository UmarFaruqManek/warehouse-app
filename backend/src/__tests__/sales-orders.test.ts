import request from 'supertest'
import { app, adminToken, staffToken } from './setup'

describe('Sales Orders Routes', () => {
  let soId: number

  describe('POST /api/sales-orders', () => {
    it('should create an SO as admin', async () => {
      const res = await request(app)
        .post('/api/sales-orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerName: 'Test Customer',
          items: [{ productId: 1, quantity: 2, unitPrice: 25000 }],
        })
      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data.soNumber).toMatch(/^SO-/)
      soId = res.body.data.id
    })

    it('should create an SO as staff', async () => {
      const res = await request(app)
        .post('/api/sales-orders')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          customerName: 'Staff Customer',
          items: [{ productId: 1, quantity: 1, unitPrice: 25000 }],
        })
      expect(res.status).toBe(201)
    })

    it('should reject empty customer name', async () => {
      const res = await request(app)
        .post('/api/sales-orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ customerName: '', items: [{ productId: 1, quantity: 1, unitPrice: 1000 }] })
      expect(res.status).toBe(400)
    })

    it('should reject empty items', async () => {
      const res = await request(app)
        .post('/api/sales-orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ customerName: 'Test', items: [] })
      expect(res.status).toBe(400)
    })
  })

  describe('GET /api/sales-orders', () => {
    it('should list SOs', async () => {
      const res = await request(app)
        .get('/api/sales-orders')
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.status).toBe(200)
      expect(Array.isArray(res.body.data.data)).toBe(true)
    })
  })

  describe('GET /api/sales-orders/:id', () => {
    it('should get SO by id', async () => {
      const res = await request(app)
        .get(`/api/sales-orders/${soId}`)
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.status).toBe(200)
      expect(res.body.data.id).toBe(soId)
    })
  })

  describe('PUT /api/sales-orders/:id/status', () => {
    it('should update SO status to SHIPPED', async () => {
      const res = await request(app)
        .put(`/api/sales-orders/${soId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'SHIPPED', warehouseId: 1 })
      expect(res.status).toBe(200)
      expect(res.body.data.status).toBe('SHIPPED')
    })

    it('should reject shipping already shipped SO', async () => {
      const res = await request(app)
        .put(`/api/sales-orders/${soId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'SHIPPED', warehouseId: 1 })
      expect(res.status).toBe(400)
    })
  })
})
