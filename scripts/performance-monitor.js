/**
 * Script de monitoring des performances
 * Usage: node scripts/performance-monitor.js
 */

const { performance } = require('perf_hooks')

// Couleurs pour le terminal
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
    bold: '\x1b[1m',
}

function formatTime(ms) {
    if (ms < 1) return `${(ms * 1000).toFixed(2)}μs`
    if (ms < 1000) return `${ms.toFixed(2)}ms`
    return `${(ms / 1000).toFixed(2)}s`
}

function getColor(ms, thresholds = { good: 100, warning: 500 }) {
    if (ms < thresholds.good) return colors.green
    if (ms < thresholds.warning) return colors.yellow
    return colors.red
}

async function measureQuery(name, queryFn, thresholds) {
    const start = performance.now()
    try {
        const result = await queryFn()
        const duration = performance.now() - start
        const color = getColor(duration, thresholds)

        console.log(
            `${color}✓${colors.reset} ${name.padEnd(40)} ${color}${formatTime(duration)}${colors.reset}`
        )

        return { name, duration, success: true, result }
    } catch (error) {
        const duration = performance.now() - start
        console.log(
            `${colors.red}✗${colors.reset} ${name.padEnd(40)} ${colors.red}${formatTime(duration)} - ${error.message}${colors.reset}`
        )

        return { name, duration, success: false, error: error.message }
    }
}

async function runPerformanceTests() {
    console.log(`\n${colors.bold}${colors.cyan}🚀 Performance Monitoring${colors.reset}\n`)

    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()

    const results = []

    // Test 1: Count queries
    console.log(`${colors.bold}📊 Count Queries${colors.reset}`)
    results.push(await measureQuery(
        'Count active books',
        () => prisma.book.count({ where: { active: true } }),
        { good: 50, warning: 200 }
    ))

    results.push(await measureQuery(
        'Count all orders',
        () => prisma.order.count(),
        { good: 50, warning: 200 }
    ))

    // Test 2: Simple queries
    console.log(`\n${colors.bold}📚 Simple Queries${colors.reset}`)
    results.push(await measureQuery(
        'Get 10 books',
        () => prisma.book.findMany({ take: 10, where: { active: true } }),
        { good: 100, warning: 300 }
    ))

    results.push(await measureQuery(
        'Get 10 packs with books',
        () => prisma.pack.findMany({
            take: 10,
            include: { books: { include: { book: true } } }
        }),
        { good: 150, warning: 400 }
    ))

    // Test 3: Complex queries
    console.log(`\n${colors.bold}🔍 Complex Queries${colors.reset}`)
    results.push(await measureQuery(
        'Get orders with items',
        () => prisma.order.findMany({
            take: 10,
            include: {
                items: {
                    include: {
                        book: true,
                        pack: true
                    }
                }
            }
        }),
        { good: 200, warning: 500 }
    ))

    results.push(await measureQuery(
        'Get best-selling books (aggregation)',
        () => prisma.orderItem.groupBy({
            by: ['bookId'],
            where: { type: 'BOOK', bookId: { not: null } },
            _sum: { quantity: true },
            orderBy: { _sum: { quantity: 'desc' } },
            take: 10
        }),
        { good: 300, warning: 800 }
    ))

    // Test 4: Transactions
    console.log(`\n${colors.bold}⚡ Transactions${colors.reset}`)
    results.push(await measureQuery(
        'Transaction with 3 counts',
        () => prisma.$transaction([
            prisma.book.count({ where: { active: true } }),
            prisma.user.count({ where: { role: 'USER' } }),
            prisma.order.count()
        ]),
        { good: 150, warning: 400 }
    ))

    await prisma.$disconnect()

    // Résumé
    console.log(`\n${colors.bold}${colors.cyan}📈 Summary${colors.reset}\n`)

    const successful = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length
    const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length
    const slowest = results.reduce((max, r) => r.duration > max.duration ? r : max)
    const fastest = results.reduce((min, r) => r.duration < min.duration ? r : min)

    console.log(`Total tests: ${results.length}`)
    console.log(`${colors.green}Successful: ${successful}${colors.reset}`)
    if (failed > 0) console.log(`${colors.red}Failed: ${failed}${colors.reset}`)
    console.log(`Average duration: ${formatTime(avgDuration)}`)
    console.log(`Fastest: ${fastest.name} (${formatTime(fastest.duration)})`)
    console.log(`Slowest: ${slowest.name} (${formatTime(slowest.duration)})`)

    // Recommandations
    console.log(`\n${colors.bold}${colors.cyan}💡 Recommendations${colors.reset}\n`)

    const slowQueries = results.filter(r => r.duration > 500)
    if (slowQueries.length > 0) {
        console.log(`${colors.yellow}⚠ Slow queries detected:${colors.reset}`)
        slowQueries.forEach(q => {
            console.log(`  - ${q.name}: ${formatTime(q.duration)}`)
        })
        console.log(`\nConsider:`)
        console.log(`  1. Adding database indexes`)
        console.log(`  2. Using select to limit fields`)
        console.log(`  3. Implementing caching`)
        console.log(`  4. Optimizing relations`)
    } else {
        console.log(`${colors.green}✓ All queries are performing well!${colors.reset}`)
    }

    console.log('')
}

// Exécuter
runPerformanceTests().catch(console.error)
