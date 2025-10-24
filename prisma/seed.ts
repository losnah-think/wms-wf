import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ============================================================================
// Mock Data Generators
// ============================================================================

const suppliers = [
  { name: 'ABC Supply Co.', code: 'SUPP001', email: 'contact@abcsupply.com' },
  { name: 'XYZ Corporation', code: 'SUPP002', email: 'info@xyzcorp.com' },
  { name: 'Global Logistics', code: 'SUPP003', email: 'sales@globallog.com' },
  { name: 'Premier Distributors', code: 'SUPP004', email: 'support@premier.com' },
  { name: 'Tech Distributors', code: 'SUPP005', email: 'contact@techdistr.com' },
  { name: 'Major Suppliers Inc', code: 'SUPP006', email: 'sales@majorsupply.com' },
  { name: 'Infinity Trading', code: 'SUPP007', email: 'info@infinity.com' },
  { name: 'NextGen Supply', code: 'SUPP008', email: 'support@nextgen.com' },
]

const products = [
  { code: 'PROD001', name: 'Product A', barcode: 'BAR001', sku: 'SKU001', price: 100 },
  { code: 'PROD002', name: 'Product B', barcode: 'BAR002', sku: 'SKU002', price: 200 },
  { code: 'PROD003', name: 'Product C', barcode: 'BAR003', sku: 'SKU003', price: 150 },
  { code: 'PROD004', name: 'Product D', barcode: 'BAR004', sku: 'SKU004', price: 300 },
  { code: 'PROD005', name: 'Product E', barcode: 'BAR005', sku: 'SKU005', price: 250 },
  { code: 'PROD006', name: 'Product F', barcode: 'BAR006', sku: 'SKU006', price: 500 },
  { code: 'PROD007', name: 'Product G', barcode: 'BAR007', sku: 'SKU007', price: 350 },
  { code: 'PROD008', name: 'Product H', barcode: 'BAR008', sku: 'SKU008', price: 400 },
  { code: 'PROD009', name: 'Product I', barcode: 'BAR009', sku: 'SKU009', price: 175 },
  { code: 'PROD010', name: 'Product J', barcode: 'BAR010', sku: 'SKU010', price: 275 },
]

const statuses = ['pending', 'on-schedule', 'delayed', 'arrived']
const carriers = ['FastShip Express', 'Premium Logistics', 'International Freight', 'Direct Delivery', 'Express Courier']

function generateRequestNumber(): string {
  return `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
}

function generateScheduleNumber(): string {
  return `SCH-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
}

function generateApprovalNumber(): string {
  return `APR-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
}

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function getRandomDate(daysAgo: number = 90): Date {
  const date = new Date()
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo))
  return date
}

async function main() {
  console.log('🌱 Starting database seed...')

  try {
    // Clear existing data
    console.log('🗑️  Clearing existing data...')
    await prisma.inboundApproval.deleteMany()
    await prisma.inboundSchedule.deleteMany()
    await prisma.inboundRequestItem.deleteMany()
    await prisma.inboundRequest.deleteMany()
    await prisma.supplier.deleteMany()
    await prisma.product.deleteMany()
    await prisma.warehouse.deleteMany()

    // Create Suppliers
    console.log('📦 Creating suppliers...')
    const createdSuppliers = await Promise.all(
      suppliers.map(supplier =>
        prisma.supplier.create({
          data: {
            name: supplier.name,
            code: supplier.code,
            email: supplier.email,
            type: 'supplier',
            isActive: true,
          },
        })
      )
    )
    console.log(`✅ Created ${createdSuppliers.length} suppliers`)

    // Create Products
    console.log('🏷️  Creating products...')
    const createdProducts = await Promise.all(
      products.map(product =>
        prisma.product.create({
          data: {
            code: product.code,
            name: product.name,
            barcode: product.barcode,
            sku: product.sku,
            price: product.price,
            isActive: true,
          },
        })
      )
    )
    console.log(`✅ Created ${createdProducts.length} products`)

    // Create Warehouse
    console.log('🏭 Creating warehouse...')
    const warehouse = await prisma.warehouse.create({
      data: {
        name: 'Main Warehouse',
        code: 'WH001',
        address: '123 Warehouse St, Industrial Zone',
        isActive: true,
      },
    })
    console.log(`✅ Created warehouse: ${warehouse.name}`)

    // Create Zones
    console.log('🗂️  Creating zones...')
    const zones = await Promise.all(
      ['Zone A', 'Zone B', 'Zone C', 'Zone D'].map((name, idx) =>
        prisma.zone.create({
          data: {
            name,
            code: `Z${String.fromCharCode(65 + idx)}01`,
            warehouseId: warehouse.id,
            isActive: true,
          },
        })
      )
    )
    console.log(`✅ Created ${zones.length} zones`)

    // Create Locations
    console.log('📍 Creating locations...')
    for (const zone of zones) {
      for (let i = 1; i <= 5; i++) {
        await prisma.location.create({
          data: {
            name: `Loc-${zone.code}-${i}`,
            code: `LOC${i}`,
            zoneId: zone.id,
            capacity: 100,
            isActive: true,
          },
        })
      }
    }
    console.log(`✅ Created locations for all zones`)

    // Create 50,000 Inbound Requests and Schedules
    console.log('📥 Creating 50,000 inbound requests and schedules...')
    const batchSize = 1000
    const totalRecords = 50000

    for (let batch = 0; batch < totalRecords / batchSize; batch++) {
      const startIdx = batch * batchSize
      const endIdx = Math.min(startIdx + batchSize, totalRecords)

      const requestsData = []
      for (let i = startIdx; i < endIdx; i++) {
        const requestDate = getRandomDate(90)
        const expectedDate = new Date(requestDate)
        expectedDate.setDate(expectedDate.getDate() + Math.floor(Math.random() * 14) + 3)

        requestsData.push({
          requestNumber: generateRequestNumber(),
          supplierId: getRandomElement(createdSuppliers).id,
          status: Math.random() > 0.3 ? 'submitted' : 'approved',
          totalQuantity: Math.floor(Math.random() * 1000) + 100,
          totalAmount: Math.floor(Math.random() * 10000) + 1000,
          requestDate,
          expectedDate,
          notes: `Inbound request #${i}`,
        })
      }

      const createdRequests = await prisma.inboundRequest.createMany({
        data: requestsData,
      })

      // Create schedules for each request
      const requests = await prisma.inboundRequest.findMany({
        take: batchSize,
        skip: startIdx,
      })

      const schedulesData = requests.map(req => ({
        scheduleNumber: generateScheduleNumber(),
        requestId: req.id,
        supplierId: req.supplierId,
        status: getRandomElement(statuses),
        expectedDate: req.expectedDate,
        estimatedArrival: new Date(req.expectedDate.getTime() + Math.random() * 86400000),
        carrier: getRandomElement(carriers),
        trackingNumber: `TRK${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
        totalQuantity: req.totalQuantity,
        receivedQuantity: Math.random() > 0.5 ? req.totalQuantity : 0,
      }))

      await prisma.inboundSchedule.createMany({
        data: schedulesData,
      })

      // Create approvals
      const approvalsData = requests.map(req => ({
        approvalNumber: generateApprovalNumber(),
        requestId: req.id,
        status: Math.random() > 0.2 ? 'approved' : 'pending',
        approverName: `Approver ${Math.floor(Math.random() * 10) + 1}`,
        approvalDate: new Date(),
        allocatedZone: `Zone ${String.fromCharCode(65 + Math.floor(Math.random() * 4))}`,
      }))

      await prisma.inboundApproval.createMany({
        data: approvalsData,
      })

      const progress = Math.min(endIdx, totalRecords)
      console.log(`✅ Created batch ${batch + 1}: ${progress}/${totalRecords} records`)
    }

    console.log('✅ Successfully seeded database!')
    console.log(`📊 Total data created:`)
    console.log(`  - Suppliers: ${createdSuppliers.length}`)
    console.log(`  - Products: ${createdProducts.length}`)
    console.log(`  - Inbound Requests: 50,000`)
    console.log(`  - Inbound Schedules: 50,000`)
    console.log(`  - Inbound Approvals: 50,000`)
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  }
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
