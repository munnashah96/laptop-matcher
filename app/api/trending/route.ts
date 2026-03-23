import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Gaming: RTX/GTX graphics, RAM >= 16GB, price <= 1500, sorted by price (cheapest first)
    const gaming = await prisma.laptop.findMany({
      where: {
        OR: [
          { graphics: { contains: 'RTX' } },
          { graphics: { contains: 'GTX' } }
        ],
        ram_gb: { gte: 16 },
        price_usd: { lte: 1500 },
      },
      orderBy: { price_usd: 'asc' },
      take: 1,
    })

    // Video Editing: RAM >= 16GB, storage >= 512GB, processor contains i7 or Ryzen 7, price <= 2000
    const videoEditing = await prisma.laptop.findMany({
      where: {
        ram_gb: { gte: 16 },
        storage_gb: { gte: 512 },
        OR: [
          { processor: { contains: 'i7' } },
          { processor: { contains: 'Ryzen 7' } },
          { processor: { contains: 'i9' } },
          { processor: { contains: 'Ryzen 9' } },
        ],
        price_usd: { lte: 2000 },
      },
      orderBy: { price_usd: 'asc' },
      take: 1,
    })

    // Portable: weight <= 1.5kg, screen <= 14", price <= 1200
    const portable = await prisma.laptop.findMany({
      where: {
        weight_kg: { lte: 1.5 },
        screen_inches: { lte: 14 },
        price_usd: { lte: 1200 },
      },
      orderBy: { price_usd: 'asc' },
      take: 1,
    })

    // Combine results, filter out nulls
    const trendingPicks = [...gaming, ...videoEditing, ...portable].filter(Boolean)

    return NextResponse.json(trendingPicks)
  } catch (error) {
    console.error('Error in /api/trending:', error)
    // Return empty array on error to avoid breaking the frontend
    return NextResponse.json([], { status: 200 }) // 200 with empty array
  }
}