import request from 'supertest'
import { app, adminToken, staffToken, managerToken } from './setup'

describe('Products Routes', () => {
  let productId: number

  describe('POST /api/products', () => {
    it('should create a product as admin', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          sku: 'TEST-' + Date.now(),
          name: 'Test Product',
          category: 'Testing',
          unit: 'pcs',
          minStock: 5,
          price: 25000,
        })
      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data.sku).toBeDefined()
      productId = res.body.data.id
    })

    it('should create a product as staff', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ sku: 'TEST-STAFF-' + Date.now(), name: 'Staff Product', price: 10000 })
      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
    })

    it('should reject duplicate SKU', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ sku: 'BRG-001', name: 'Duplicate', price: 10000 })
      expect(res.status).toBe(400)
    })

    it('should reject without auth', async () => {
      const res = await request(app)
        .post('/api/products')
        .send({ sku: 'TEST-NOAUTH', name: 'No Auth', price: 1000 })
      expect(res.status).toBe(401)
    })

    it('should reject negative price', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ sku: 'TEST-NEG-' + Date.now(), name: 'Neg Price', price: -100 })
      expect(res.status).toBe(400)
    })
  })

  describe('GET /api/products', () => {
    it('should list products', async () => {
      const res = await request(app)
        .get('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(Array.isArray(res.body.data.data)).toBe(true)
    })

    it('should search products by name', async () => {
      const res = await request(app)
        .get('/api/products?search=Test')
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.status).toBe(200)
      expect(res.body.data.data.length).toBeGreaterThanOrEqual(1)
    })

    it('should paginate results', async () => {
      const res = await request(app)
        .get('/api/products?page=1&limit=2')
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.status).toBe(200)
      expect(res.body.data.data.length).toBeLessThanOrEqual(2)
      expect(res.body.data.totalPages).toBeGreaterThanOrEqual(1)
    })
  })

  describe('GET /api/products/:id', () => {
    it('should get product by id', async () => {
      const res = await request(app)
        .get(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.status).toBe(200)
      expect(res.body.data.id).toBe(productId)
    })

    it('should return 404 for non-existent product', async () => {
      const res = await request(app)
        .get('/api/products/999999')
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.status).toBe(404)
    })

    it('should reject invalid id format', async () => {
      const res = await request(app)
        .get('/api/products/abc')
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.status).toBe(400)
    })
  })

  describe('PUT /api/products/:id', () => {
    it('should update a product', async () => {
      const res = await request(app)
        .put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ sku: 'TEST-UPD-' + Date.now(), name: 'Updated Product', price: 30000 })
      expect(res.status).toBe(200)
      expect(res.body.data.name).toBe('Updated Product')
    })
  })

  describe('DELETE /api/products/:id (cleanup)', () => {
    it('should delete the test product', async () => {
      const res = await request(app)
        .delete(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.status).toBe(200)
    })

    it('should reject delete as manager', async () => {
      const res = await request(app)
        .delete('/api/products/1')
        .set('Authorization', `Bearer ${managerToken}`)
      expect(res.status).toBe(403)
    })
  })
})
