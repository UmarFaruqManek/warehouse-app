import express from 'express'
import 'express-async-errors'
import cors from 'cors'
import { errorHandler } from './middleware/error-handler'
import authRoutes from './routes/auth'
import productRoutes from './routes/products'
import supplierRoutes from './routes/suppliers'
import warehouseRoutes from './routes/warehouses'
import stockRoutes from './routes/stock'
import transactionRoutes from './routes/transactions'
import purchaseOrderRoutes from './routes/purchase-orders'
import salesOrderRoutes from './routes/sales-orders'
import reportRoutes from './routes/reports'
import auditLogRoutes from './routes/audit-logs'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Routes
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

app.use(errorHandler)

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

export default app
