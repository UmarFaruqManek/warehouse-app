import request from 'supertest'
import app from '../index'
import prisma from '../prisma'

let adminToken = ''
let staffToken = ''
let managerToken = ''

beforeAll(async () => {
  // Log in seeded users to get tokens
  const adminRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@warehouse.com', password: 'admin123' })
  adminToken = adminRes.body.data?.token || ''

  const staffRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'staff@warehouse.com', password: 'staff123' })
  staffToken = staffRes.body.data?.token || ''

  const managerRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'manager@warehouse.com', password: 'manager123' })
  managerToken = managerRes.body.data?.token || ''
})

afterAll(async () => {
  await prisma.$disconnect()
})

export { adminToken, staffToken, managerToken }
export { app }
