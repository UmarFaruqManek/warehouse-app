import request from 'supertest'
import { app, adminToken, managerToken } from './setup'

describe('Suppliers Routes', () => {
  let supplierId: number

  describe('POST /api/suppliers', () => {
    it('should create a supplier as admin', async () => {
      const res = await request(app)
        .post('/api/suppliers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Test Supplier', contact: 'Test Contact', phone: '08123456789', email: 'supplier@test.com' })
      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      supplierId = res.body.data.id
    })

    it('should reject as non-admin', async () => {
      const res = await request(app)
        .post('/api/suppliers')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({ name: 'Should Fail' })
      expect(res.status).toBe(403)
    })

    it('should reject empty name', async () => {
      const res = await request(app)
        .post('/api/suppliers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: '' })
      expect(res.status).toBe(400)
    })
  })

  describe('GET /api/suppliers', () => {
    it('should list suppliers', async () => {
      const res = await request(app)
        .get('/api/suppliers')
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.status).toBe(200)
      expect(Array.isArray(res.body.data.data)).toBe(true)
    })

    it('should search suppliers', async () => {
      const res = await request(app)
        .get('/api/suppliers?search=Test')
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.status).toBe(200)
      expect(res.body.data.data.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('GET /api/suppliers/:id', () => {
    it('should get supplier by id', async () => {
      const res = await request(app)
        .get(`/api/suppliers/${supplierId}`)
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.status).toBe(200)
      expect(res.body.data.id).toBe(supplierId)
    })
  })

  describe('PUT /api/suppliers/:id', () => {
    it('should update supplier', async () => {
      const res = await request(app)
        .put(`/api/suppliers/${supplierId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Supplier' })
      expect(res.status).toBe(200)
      expect(res.body.data.name).toBe('Updated Supplier')
    })
  })

  describe('DELETE /api/suppliers/:id', () => {
    it('should delete the test supplier', async () => {
      const res = await request(app)
        .delete(`/api/suppliers/${supplierId}`)
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.status).toBe(200)
    })
  })
})
