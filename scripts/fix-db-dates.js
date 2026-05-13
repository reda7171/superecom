const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('--- Database Date Fix Utility ---')
  try {
    // We use executeRaw because findMany/updateMany will fail if they even LOOK at a record with an invalid date
    console.log('Fixing invalid dates in "books" table...')
    
    // Check all tables that might have these columns
    const tables = [
      'books', 'users', 'packs', 'orders', 'coupons', 'exchanges', 'chats', 
      'notifications', 'expenses', 'advertisements', 'author_profiles', 
      'abandoned_carts', 'digital_products', 'digital_orders', 'site_settings'
    ]
    
    for (const table of tables) {
      try {
        console.log(`Checking table: ${table}...`)
        const updated = await prisma.$executeRawUnsafe(`
          UPDATE ${table} 
          SET 
            updatedAt = CASE WHEN updatedAt = '0000-00-00 00:00:00' OR updatedAt IS NULL THEN NOW() ELSE updatedAt END,
            createdAt = CASE WHEN createdAt = '0000-00-00 00:00:00' OR createdAt IS NULL THEN NOW() ELSE createdAt END
          WHERE 
            updatedAt = '0000-00-00 00:00:00' OR updatedAt IS NULL OR
            createdAt = '0000-00-00 00:00:00' OR createdAt IS NULL
        `)
        if (updated > 0) {
          console.log(`Successfully fixed ${updated} records in '${table}'.`)
        }
      } catch (err) {
        // Skip tables that don't have these columns OR use different names
        // console.log(`Skipping ${table}: ${err.message}`)
      }
    }


    console.log('Done.')
  } catch (error) {
    console.error('Error fixing dates:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
