import express from 'express'
import 'express-async-errors'
import cors from 'cors'
import helmet from 'helmet'
import { errorHandler } from './middleware/error-handler'
import authRoutes from './routes/auth'
import healthRoutes from './routes/health'
import productRoutes from './routes/products'
import supplierRoutes from './routes/suppliers'
import warehouseRoutes from './routes/warehouses'
import stockRoutes from './routes/stock'
import transactionRoutes from './routes/transactions'
import purchaseOrderRoutes from './routes/purchase-orders'
import salesOrderRoutes from './routes/sales-orders'
import reportRoutes from './routes/reports'
import auditLogRoutes from './routes/audit-logs'
import exportRoutes from './routes/export'
import apiKeyRoutes from './routes/api-keys'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
}))
app.use(helmet())
app.use(express.json())

// Routes
app.use('/api/health', healthRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/suppliers', supplierRoutes)
app.use('/api/warehouses', warehouseRoutes)
app.use('/api/stock', stockRoutes)
app.use('/api/transactions', transactionRoutes)
app.use('/api/purchase-orders', purchaseOrderRoutes)
app.use('/api/sales-orders', salesOrderRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/audit-logs', auditLogRoutes)
app.use('/api/export', exportRoutes)
app.use('/api/api-keys', apiKeyRoutes)

app.use(errorHandler)

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

export default app
