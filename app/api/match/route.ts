import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'  // Import the singleton Prisma client

// Scoring function (ported from Python)
function scoreLaptop(laptop: any, prefs: any): number {
  let score = 0

  // Price (weight 30%)
  if (prefs.maxPrice && laptop.price_usd <= prefs.maxPrice) {
    const priceScore = (prefs.maxPrice - laptop.price_usd) / prefs.maxPrice
    score += priceScore * 0.3
  } else if (prefs.maxPrice) {
    score -= 10 // penalty for exceeding budget
  }

  // RAM (weight 20%)
  if (prefs.minRam && laptop.ram_gb >= prefs.minRam) {
    const ramScore = (laptop.ram_gb - prefs.minRam) / 10
    score += Math.min(ramScore, 0.5) * 0.2
  } else if (prefs.minRam) {
    score -= 5
  }

  // Storage (weight 10%)
  if (prefs.minStorage && laptop.storage_gb >= prefs.minStorage) {
    const storageScore = (laptop.storage_gb - prefs.minStorage) / 500
    score += Math.min(storageScore, 0.3) * 0.1
  } else if (prefs.minStorage) {
    score -= 5
  }

  // Brand preference (weight 15%)
  if (prefs.brands && prefs.brands.length > 0) {
    if (prefs.brands.includes(laptop.brand)) {
      score += 0.5 * 0.15
    }
  }

  // Purpose (weight 25%)
  if (prefs.purpose) {
    switch (prefs.purpose) {
      case 'gaming':
        if (laptop.graphics.includes('RTX') || laptop.graphics.includes('GTX')) {
          score += 0.5 * 0.25
        }
        if (laptop.ram_gb >= 16) {
          score += 0.2 * 0.25
        }
        break
      case 'office':
        if (laptop.weight_kg <= 2.0) {
          score += 0.3 * 0.2
        }
        if (laptop.graphics.includes('Integrated')) {
          score += 0.2 * 0.2
        }
        break
      case 'portable':
        if (laptop.weight_kg <= 1.5) {
          score += 0.5 * 0.3
        }
        if (laptop.screen_inches <= 14) {
          score += 0.3 * 0.3
        }
        break
      // 'general' – no extra points
    }
  }

  return score
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      maxPrice = 2000,
      minRam = 8,
      minStorage = 256,
      brands = [],
      purpose = 'general',
      topN = 6,
    } = body

    // Build the database query (basic filters)
    const where: any = {
      price_usd: { lte: maxPrice },
      ram_gb: { gte: minRam },
      storage_gb: { gte: minStorage },
    }

    // If specific brands are selected, add them to the filter
    if (brands && brands.length > 0) {
      where.brand = { in: brands }
    }

    const laptops = await prisma.laptop.findMany({ where })

    // Apply scoring and sort
    const scored = laptops.map((laptop) => ({
      ...laptop,
      score: scoreLaptop(laptop, { maxPrice, minRam, minStorage, brands, purpose }),
    }))

    scored.sort((a, b) => b.score - a.score)
    const topLaptops = scored.slice(0, topN)

    return NextResponse.json(topLaptops)
  } catch (error) {
    console.error('Error in /api/match:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}