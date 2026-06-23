import request from 'supertest'
import { app, adminToken, managerToken } from './setup'

describe('Warehouses Routes', () => {
  let warehouseId: number

  describe('POST /api/warehouses', () => {
    it('should create a warehouse as admin', async () => {
      const res = await request(app)
        .post('/api/warehouses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Test Warehouse', code: 'WH-TEST-' + Date.now(), location: 'Test Location' })
      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      warehouseId = res.body.data.id
    })

    it('should reject as non-admin', async () => {
      const res = await request(app)
        .post('/api/warehouses')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({ name: 'Should Fail', code: 'FAIL' })
      expect(res.status).toBe(403)
    })

    it('should reject empty name', async () => {
      const res = await request(app)
        .post('/api/warehouses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: '', code: 'WH-EMPTY' })
      expect(res.status).toBe(400)
    })
  })

  describe('GET /api/warehouses', () => {
    it('should list warehouses', async () => {
      const res = await request(app)
        .get('/api/warehouses')
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.status).toBe(200)
      expect(Array.isArray(res.body.data.data)).toBe(true)
    })
  })

  describe('GET /api/warehouses/:id', () => {
    it('should get warehouse by id', async () => {
      const res = await request(app)
        .get(`/api/warehouses/${warehouseId}`)
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.status).toBe(200)
      expect(res.body.data.id).toBe(warehouseId)
    })

    it('should return 404 for non-existent warehouse', async () => {
      const res = await request(app)
        .get('/api/warehouses/99999')
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.status).toBe(404)
    })
  })

  describe('PUT /api/warehouses/:id', () => {
    it('should update warehouse', async () => {
      const res = await request(app)
        .put(`/api/warehouses/${warehouseId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Warehouse', code: 'WH-UPD-' + Date.now() })
      expect(res.status).toBe(200)
      expect(res.body.data.name).toBe('Updated Warehouse')
    })
  })

  describe('DELETE /api/warehouses/:id', () => {
    it('should delete the test warehouse', async () => {
      const res = await request(app)
        .delete(`/api/warehouses/${warehouseId}`)
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.status).toBe(200)
    })
  })
})
