import request from 'supertest'
import { app, adminToken, staffToken } from './setup'

describe('Purchase Orders Routes', () => {
  let poId: number

  describe('POST /api/purchase-orders', () => {
    it('should create a PO as admin', async () => {
      const res = await request(app)
        .post('/api/purchase-orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          supplierId: 1,
          items: [{ productId: 1, quantity: 5, unitPrice: 10000 }],
        })
      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data.poNumber).toMatch(/^PO-/)
      poId = res.body.data.id
    })

    it('should create a PO as staff', async () => {
      const res = await request(app)
        .post('/api/purchase-orders')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          supplierId: 1,
          items: [{ productId: 2, quantity: 3, unitPrice: 15000 }],
        })
      expect(res.status).toBe(201)
    })

    it('should reject empty items', async () => {
      const res = await request(app)
        .post('/api/purchase-orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ supplierId: 1, items: [] })
      expect(res.status).toBe(400)
    })

    it('should reject without items field', async () => {
      const res = await request(app)
        .post('/api/purchase-orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ supplierId: 1 })
      expect(res.status).toBe(400)
    })
  })

  describe('GET /api/purchase-orders', () => {
    it('should list POs', async () => {
      const res = await request(app)
        .get('/api/purchase-orders')
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.status).toBe(200)
      expect(Array.isArray(res.body.data.data)).toBe(true)
    })

    it('should filter by status', async () => {
      const res = await request(app)
        .get('/api/purchase-orders?status=DRAFT')
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.status).toBe(200)
    })
  })

  describe('GET /api/purchase-orders/:id', () => {
    it('should get PO by id', async () => {
      const res = await request(app)
        .get(`/api/purchase-orders/${poId}`)
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.status).toBe(200)
      expect(res.body.data.id).toBe(poId)
    })
  })

  describe('PUT /api/purchase-orders/:id/status', () => {
    it('should update PO status to RECEIVED', async () => {
      const res = await request(app)
        .put(`/api/purchase-orders/${poId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'RECEIVED', warehouseId: 1 })
      expect(res.status).toBe(200)
      expect(res.body.data.status).toBe('RECEIVED')
    })

    it('should reject receiving already received PO', async () => {
      const res = await request(app)
        .put(`/api/purchase-orders/${poId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'RECEIVED', warehouseId: 1 })
      expect(res.status).toBe(400)
    })
  })
})
