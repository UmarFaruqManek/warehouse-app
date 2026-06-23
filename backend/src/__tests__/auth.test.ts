import request from 'supertest'
import { app, adminToken } from './setup'

describe('Auth Routes', () => {
  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@warehouse.com', password: 'admin123' })
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.token).toBeDefined()
      expect(res.body.data.user.email).toBe('admin@warehouse.com')
    })

    it('should reject invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@warehouse.com', password: 'wrongpass' })
      expect(res.status).toBe(401)
      expect(res.body.success).toBe(false)
    })

    it('should reject non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@test.com', password: 'test123' })
      expect(res.status).toBe(401)
      expect(res.body.success).toBe(false)
    })

    it('should reject invalid email format', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'notanemail', password: 'test123' })
      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
    })

    it('should reject short password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: '12345' })
      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
    })
  })

  describe('GET /api/auth/me', () => {
    it('should return current user with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.status).toBe(200)
      expect(res.body.data.email).toBe('admin@warehouse.com')
    })

    it('should reject without token', async () => {
      const res = await request(app).get('/api/auth/me')
      expect(res.status).toBe(401)
    })

    it('should reject invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalidtoken123')
      expect(res.status).toBe(401)
    })
  })

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test User', email: 'test-' + Date.now() + '@test.com', password: 'test123456' })
      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data.email).toBeDefined()
    })

    it('should reject duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Admin', email: 'admin@warehouse.com', password: 'test123456' })
      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
    })

    it('should reject empty name', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'foo@test.com', password: 'test123456' })
      expect(res.status).toBe(400)
    })
  })
})
